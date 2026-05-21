from django.urls import path, include

urlpatterns = [
    path("health/", include("transactions.urls_health")),
    path("api/", include("transactions.urls")),
]
