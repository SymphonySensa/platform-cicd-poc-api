from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Transaction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("transaction_id", models.CharField(max_length=64, unique=True)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=15)),
                ("currency", models.CharField(max_length=3)),
                ("originator", models.CharField(max_length=128)),
                ("beneficiary", models.CharField(max_length=128)),
                ("risk_level", models.CharField(
                    choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")],
                    default="low", max_length=10,
                )),
                ("flagged", models.BooleanField(default=False)),
                ("flagged_reason", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
