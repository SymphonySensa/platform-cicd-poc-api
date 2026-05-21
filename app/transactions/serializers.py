from rest_framework import serializers
from .models import Transaction


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
