import os
import random
import time
from functools import lru_cache

_ERROR_RATE = float(os.environ.get("ERROR_RATE", "0"))


@lru_cache(maxsize=None)
def _instruments():
    from opentelemetry import metrics

    meter = metrics.get_meter("platform_poc_api.http")
    return {
        "requests": meter.create_counter(
            "http.server.request.count",
            description="Total HTTP requests by method, route, and status",
        ),
        "errors": meter.create_counter(
            "http.server.error.count",
            description="Total HTTP 5xx responses",
        ),
        "duration": meter.create_histogram(
            "http.server.request.duration",
            unit="ms",
            description="HTTP request duration in milliseconds",
        ),
    }


class MetricsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.monotonic()
        response = self.get_response(request)
        duration_ms = (time.monotonic() - start) * 1000

        route = (
            request.resolver_match.route
            if request.resolver_match
            else "unknown"
        )
        attrs = {
            "http.request.method": request.method,
            "http.route": route,
            "http.response.status_code": str(response.status_code),
        }
        inst = _instruments()
        inst["requests"].add(1, attrs)
        inst["duration"].record(duration_ms, attrs)
        if response.status_code >= 500:
            inst["errors"].add(1, attrs)

        return response


class ErrorSimulationMiddleware:
    """Injects synthetic 500s at ERROR_RATE probability for canary rollback demos."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if _ERROR_RATE > 0 and random.random() < _ERROR_RATE:
            from django.http import JsonResponse

            return JsonResponse({"detail": "simulated error"}, status=500)
        return self.get_response(request)
