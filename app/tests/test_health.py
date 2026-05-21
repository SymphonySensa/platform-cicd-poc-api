import pytest
from django.test import Client


@pytest.mark.django_db
def test_health_endpoint():
    """Test health check endpoint."""
    client = Client()
    response = client.get("/health/")
    assert response.status_code == 200
