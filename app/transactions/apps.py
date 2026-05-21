from django.apps import AppConfig


class TransactionsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "transactions"

    def ready(self) -> None:
        from config.otel import setup_telemetry
        setup_telemetry()
