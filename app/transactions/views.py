from django.shortcuts import get_object_or_404
from opentelemetry import trace
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Transaction
from .serializers import TransactionSerializer, FlagSerializer

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
