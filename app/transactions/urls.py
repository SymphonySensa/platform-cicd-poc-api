from django.urls import path
from .views import TransactionListView, FlagTransactionView

urlpatterns = [
    path("transactions/", TransactionListView.as_view(), name="transaction-list"),
    path("transactions/flag/", FlagTransactionView.as_view(), name="transaction-flag"),
]
