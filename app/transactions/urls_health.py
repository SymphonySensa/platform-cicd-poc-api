from django.urls import path
from .views_health import HealthView

urlpatterns = [
    path("", HealthView.as_view(), name="health"),
]
