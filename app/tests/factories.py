import factory
from transactions.models import Transaction


class TransactionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Transaction

    transaction_id = factory.Sequence(lambda n: f"TXN-TEST-{n:04d}")
    amount = factory.Faker("pydecimal", left_digits=6, right_digits=2, positive=True)
    currency = factory.Iterator(["USD", "EUR", "GBP"])
    originator = factory.Faker("company")
    beneficiary = factory.Faker("company")
    risk_level = Transaction.RiskLevel.LOW
    flagged = False
    flagged_reason = ""
