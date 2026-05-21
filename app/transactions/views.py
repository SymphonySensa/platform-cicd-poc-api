from django.shortcuts import get_object_or_404
from opentelemetry import trace
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Transaction, FeatureFlag, DeploymentEvent, ABTest
from .serializers import (
    TransactionSerializer, FlagSerializer,
    FeatureFlagSerializer, DeploymentEventSerializer, ABTestSerializer
)

tracer = trace.get_tracer(__name__)


class TransactionListView(generics.ListAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["risk_level", "flagged", "currency"]


class FlagTransactionView(APIView):
    def post(self, request):
        serializer = FlagSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        transaction_id = serializer.validated_data["transaction_id"]

        with tracer.start_as_current_span("flag_transaction") as span:
            span.set_attribute("transaction.id", transaction_id)

            transaction = get_object_or_404(Transaction, transaction_id=transaction_id)
            span.set_attribute("transaction.risk_level", transaction.risk_level)

            transaction.flagged = True
            transaction.flagged_reason = serializer.validated_data["reason"]
            transaction.save(update_fields=["flagged", "flagged_reason", "updated_at"])

            span.set_attribute("transaction.flagged", True)

        return Response(
            TransactionSerializer(transaction).data,
            status=status.HTTP_200_OK,
        )


class DeploymentEventViewSet(viewsets.ModelViewSet):
    queryset = DeploymentEvent.objects.all()
    serializer_class = DeploymentEventSerializer

    @action(detail=True, methods=["post"])
    def rollback(self, request, pk=None):
        deployment = self.get_object()
        with tracer.start_as_current_span("rollback_deployment") as span:
            span.set_attribute("deployment.id", deployment.id)
            span.set_attribute("deployment.version", deployment.version)

            deployment.status = DeploymentEvent.Status.ROLLED_BACK
            deployment.save(update_fields=["status", "updated_at"])
            span.set_attribute("deployment.status", DeploymentEvent.Status.ROLLED_BACK)

        return Response(
            DeploymentEventSerializer(deployment).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def abort(self, request, pk=None):
        deployment = self.get_object()
        with tracer.start_as_current_span("abort_deployment") as span:
            span.set_attribute("deployment.id", deployment.id)
            span.set_attribute("deployment.version", deployment.version)

            deployment.status = DeploymentEvent.Status.FAILED
            deployment.save(update_fields=["status", "updated_at"])
            span.set_attribute("deployment.status", DeploymentEvent.Status.FAILED)

        return Response(
            DeploymentEventSerializer(deployment).data,
            status=status.HTTP_200_OK,
        )


class FeatureFlagViewSet(viewsets.ModelViewSet):
    queryset = FeatureFlag.objects.all()
    serializer_class = FeatureFlagSerializer

    @action(detail=True, methods=["post"])
    def enable(self, request, pk=None):
        flag = self.get_object()
        with tracer.start_as_current_span("enable_feature_flag") as span:
            span.set_attribute("flag.name", flag.name)

            flag.status = FeatureFlag.Status.ENABLED
            flag.save(update_fields=["status", "updated_at"])
            span.set_attribute("flag.status", FeatureFlag.Status.ENABLED)

        return Response(
            FeatureFlagSerializer(flag).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def disable(self, request, pk=None):
        flag = self.get_object()
        with tracer.start_as_current_span("disable_feature_flag") as span:
            span.set_attribute("flag.name", flag.name)

            flag.status = FeatureFlag.Status.DISABLED
            flag.save(update_fields=["status", "updated_at"])
            span.set_attribute("flag.status", FeatureFlag.Status.DISABLED)

        return Response(
            FeatureFlagSerializer(flag).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["patch"])
    def set_rollout(self, request, pk=None):
        flag = self.get_object()
        rollout_percentage = request.data.get("rollout_percentage")

        if rollout_percentage is None or not (0 <= rollout_percentage <= 100):
            return Response(
                {"error": "rollout_percentage must be 0-100"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with tracer.start_as_current_span("set_flag_rollout") as span:
            span.set_attribute("flag.name", flag.name)
            span.set_attribute("flag.rollout_percentage", rollout_percentage)

            flag.rollout_percentage = rollout_percentage
            flag.save(update_fields=["rollout_percentage", "updated_at"])

        return Response(
            FeatureFlagSerializer(flag).data,
            status=status.HTTP_200_OK,
        )


class ABTestViewSet(viewsets.ModelViewSet):
    queryset = ABTest.objects.all()
    serializer_class = ABTestSerializer

    @action(detail=True, methods=["get"])
    def stats(self, request, pk=None):
        test = self.get_object()
        with tracer.start_as_current_span("get_ab_test_stats") as span:
            span.set_attribute("test.name", test.name)
            span.set_attribute("test.variant_a_conversion_rate", test.variant_a_conversion_rate())
            span.set_attribute("test.variant_b_conversion_rate", test.variant_b_conversion_rate())

        return Response(
            ABTestSerializer(test).data,
            status=status.HTTP_200_OK,
        )


class ConfigView(APIView):
    def get(self, request):
        latest_deployment = DeploymentEvent.objects.filter(
            status=DeploymentEvent.Status.SUCCEEDED
        ).latest("created_at") if DeploymentEvent.objects.filter(
            status=DeploymentEvent.Status.SUCCEEDED
        ).exists() else None

        active_flags = FeatureFlag.objects.filter(
            status__in=[FeatureFlag.Status.ENABLED, FeatureFlag.Status.ROLLING_OUT]
        )

        active_tests = ABTest.objects.filter(status=ABTest.Status.ACTIVE)

        config = {
            "version": latest_deployment.version if latest_deployment else "unknown",
            "deployment_strategy": latest_deployment.strategy if latest_deployment else None,
            "deployment_status": latest_deployment.status if latest_deployment else None,
            "feature_flags": FeatureFlagSerializer(active_flags, many=True).data,
            "active_ab_tests": ABTestSerializer(active_tests, many=True).data,
        }

        return Response(config, status=status.HTTP_200_OK)


class MetricsView(APIView):
    def get(self, request):
        deployments = DeploymentEvent.objects.all().order_by("-created_at")[:10]

        metrics = {
            "total_deployments": DeploymentEvent.objects.count(),
            "successful_deployments": DeploymentEvent.objects.filter(
                status=DeploymentEvent.Status.SUCCEEDED
            ).count(),
            "failed_deployments": DeploymentEvent.objects.filter(
                status=DeploymentEvent.Status.FAILED
            ).count(),
            "rollback_count": DeploymentEvent.objects.filter(
                status=DeploymentEvent.Status.ROLLED_BACK
            ).count(),
            "flagged_transactions": Transaction.objects.filter(flagged=True).count(),
            "total_transactions": Transaction.objects.count(),
            "active_feature_flags": FeatureFlag.objects.filter(
                status__in=[FeatureFlag.Status.ENABLED, FeatureFlag.Status.ROLLING_OUT]
            ).count(),
            "active_ab_tests": ABTest.objects.filter(status=ABTest.Status.ACTIVE).count(),
            "recent_deployments": DeploymentEventSerializer(deployments, many=True).data,
        }

        return Response(metrics, status=status.HTTP_200_OK)
