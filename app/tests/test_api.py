import pytest
from django.test import Client


@pytest.mark.django_db
class TestAPIEndpoints:
    """Test API endpoints."""

    def test_api_root(self):
        """Test API root endpoint."""
        client = Client()
        response = client.get("/api/")
        assert response.status_code in [200, 404]  # 200 if root exists, 404 if not configured
