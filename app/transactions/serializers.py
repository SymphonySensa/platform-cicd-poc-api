from rest_framework import serializers
from .models import Transaction, FeatureFlag, DeploymentEvent, ABTest


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id", "transaction_id", "amount", "currency",
            "originator", "beneficiary", "risk_level",
            "flagged", "flagged_reason", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class FlagSerializer(serializers.Serializer):
    transaction_id = serializers.CharField(max_length=64)
    reason = serializers.CharField(max_length=512)


class FeatureFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureFlag
        fields = ["id", "name", "description", "status", "rollout_percentage", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class DeploymentEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeploymentEvent
        fields = [
            "id", "version", "strategy", "status",
            "canary_percentage", "error_rate",
            "created_at", "updated_at", "metadata"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ABTestSerializer(serializers.ModelSerializer):
    variant_a_conversion_rate = serializers.SerializerMethodField()
    variant_b_conversion_rate = serializers.SerializerMethodField()

    class Meta:
        model = ABTest
        fields = [
            "id", "name", "description", "status",
            "variant_a_name", "variant_b_name", "split_percentage",
            "variant_a_conversions", "variant_a_views", "variant_a_conversion_rate",
            "variant_b_conversions", "variant_b_views", "variant_b_conversion_rate",
            "created_at", "updated_at", "started_at", "ended_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_variant_a_conversion_rate(self, obj):
        return round(obj.variant_a_conversion_rate(), 2)

    def get_variant_b_conversion_rate(self, obj):
        return round(obj.variant_b_conversion_rate(), 2)
