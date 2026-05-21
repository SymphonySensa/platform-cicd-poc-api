from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    TransactionListView, FlagTransactionView,
    DeploymentEventViewSet, FeatureFlagViewSet, ABTestViewSet,
    ConfigView, MetricsView
)

router = SimpleRouter()
router.register(r"deployments", DeploymentEventViewSet, basename="deployment")
router.register(r"flags", FeatureFlagViewSet, basename="flag")
router.register(r"ab-tests", ABTestViewSet, basename="ab-test")

urlpatterns = [
    path("transactions/", TransactionListView.as_view(), name="transaction-list"),
    path("transactions/flag/", FlagTransactionView.as_view(), name="transaction-flag"),
    path("config/", ConfigView.as_view(), name="config"),
    path("metrics/", MetricsView.as_view(), name="metrics"),
    path("", include(router.urls)),
]
