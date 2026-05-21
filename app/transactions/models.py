from django.db import models
from django.utils import timezone


class Transaction(models.Model):
    class RiskLevel(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    transaction_id = models.CharField(max_length=64, unique=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3)
    originator = models.CharField(max_length=128)
    beneficiary = models.CharField(max_length=128)
    risk_level = models.CharField(max_length=10, choices=RiskLevel.choices, default=RiskLevel.LOW)
    flagged = models.BooleanField(default=False)
    flagged_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.transaction_id} ({self.risk_level})"


class FeatureFlag(models.Model):
    """Feature flag for gradual rollouts and A/B testing."""

    class Status(models.TextChoices):
        DISABLED = "disabled", "Disabled"
        ENABLED = "enabled", "Enabled"
        ROLLING_OUT = "rolling_out", "Rolling Out"

    name = models.CharField(max_length=128, unique=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DISABLED)
    rollout_percentage = models.IntegerField(default=0, help_text="0-100: percentage of users to enable for")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.name} ({self.status} {self.rollout_percentage}%)"


class DeploymentEvent(models.Model):
    """Track deployment events and transitions."""

    class Strategy(models.TextChoices):
        BLUE_GREEN = "blue_green", "Blue-Green"
        CANARY = "canary", "Canary"
        FEATURE_FLAG = "feature_flag", "Feature Flag"
        AB_TEST = "ab_test", "A/B Test"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In Progress"
        SUCCEEDED = "succeeded", "Succeeded"
        FAILED = "failed", "Failed"
        ROLLED_BACK = "rolled_back", "Rolled Back"

    version = models.CharField(max_length=64, help_text="Git commit SHA or semver")
    strategy = models.CharField(max_length=20, choices=Strategy.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    canary_percentage = models.IntegerField(default=0, help_text="For canary: current traffic %")
    error_rate = models.FloatField(default=0.0, help_text="Observed error rate during rollout")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Deploy {self.version} ({self.strategy}) - {self.status}"


class ABTest(models.Model):
    """A/B test configuration and results."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    name = models.CharField(max_length=128, unique=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    # Variants
    variant_a_name = models.CharField(max_length=64, default="Control")
    variant_b_name = models.CharField(max_length=64, default="Variant")
    split_percentage = models.IntegerField(default=50, help_text="% of traffic for variant_b")

    # Metrics
    variant_a_conversions = models.IntegerField(default=0)
    variant_a_views = models.IntegerField(default=0)
    variant_b_conversions = models.IntegerField(default=0)
    variant_b_views = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def variant_a_conversion_rate(self):
        if self.variant_a_views == 0:
            return 0.0
        return (self.variant_a_conversions / self.variant_a_views) * 100

    def variant_b_conversion_rate(self):
        if self.variant_b_views == 0:
            return 0.0
        return (self.variant_b_conversions / self.variant_b_views) * 100

    def __str__(self):
        return f"A/B Test: {self.name} ({self.status})"
