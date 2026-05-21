import pytest
from django.urls import reverse
from transactions.models import Transaction
from .factories import TransactionFactory


@pytest.mark.django_db
def test_list_transactions_empty(client):
    response = client.get(reverse("transaction-list"))
    assert response.status_code == 200
    assert response.json()["count"] == 0


@pytest.mark.django_db
def test_list_transactions_returns_results(client):
    TransactionFactory.create_batch(3)
    response = client.get(reverse("transaction-list"))
    assert response.status_code == 200
    assert response.json()["count"] == 3


@pytest.mark.django_db
def test_list_transactions_filter_by_risk(client):
    TransactionFactory(risk_level=Transaction.RiskLevel.HIGH)
    TransactionFactory(risk_level=Transaction.RiskLevel.LOW)
    response = client.get(reverse("transaction-list") + "?risk_level=high")
    assert response.status_code == 200
    assert response.json()["count"] == 1


@pytest.mark.django_db
def test_flag_transaction(client):
    txn = TransactionFactory(flagged=False)
    payload = {"transaction_id": txn.transaction_id, "reason": "Suspicious pattern"}
    response = client.post(
        reverse("transaction-flag"),
        data=payload,
        content_type="application/json",
    )
    assert response.status_code == 200
    data = response.json()
    assert data["flagged"] is True
    assert data["flagged_reason"] == "Suspicious pattern"

    txn.refresh_from_db()
    assert txn.flagged is True


@pytest.mark.django_db
def test_flag_transaction_not_found(client):
    payload = {"transaction_id": "DOES-NOT-EXIST", "reason": "test"}
    response = client.post(
        reverse("transaction-flag"),
        data=payload,
        content_type="application/json",
    )
    assert response.status_code == 404


@pytest.mark.django_db
def test_flag_transaction_missing_reason(client):
    txn = TransactionFactory()
    payload = {"transaction_id": txn.transaction_id}
    response = client.post(
        reverse("transaction-flag"),
        data=payload,
        content_type="application/json",
    )
    assert response.status_code == 400
