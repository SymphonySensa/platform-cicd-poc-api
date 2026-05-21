from django.conf import settings
from django.db import connection, OperationalError
from rest_framework.response import Response
from rest_framework.throttling import BaseThrottle
from rest_framework.views import APIView


class HealthView(APIView):
    throttle_classes: list[type[BaseThrottle]] = []  # exempt health from throttling

    def get(self, request):
        db_ok = True
        try:
            connection.ensure_connection()
        except OperationalError:
            db_ok = False

        payload = {
            "status": "ok" if db_ok else "degraded",
            "version": settings.APP_VERSION,
            "db": "ok" if db_ok else "error",
        }
        status_code = 200 if db_ok else 503
        return Response(payload, status=status_code)
