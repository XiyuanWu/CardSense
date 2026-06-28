from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from transactions.models import Transaction
from .models import MonthlyBudget
from .services import mtd_spend, evaluate_thresholds, get_user_timezone


def recompute_budget_for_transaction(transaction):
    """Helper to recompute MTD and fire alerts for the transaction's month."""
    user = transaction.user
    # Figure out which year_month this transaction belongs to
    tz = get_user_timezone(user)
    # Transaction.created_at is already UTC, convert to user TZ
    tx_user_tz = transaction.created_at.astimezone(tz)
    year_month = tx_user_tz.strftime('%Y-%m')
    
    # Get budget for this month if it exists
    try:
        budget = MonthlyBudget.objects.get(user=user, year_month=year_month)
        # Recompute MTD
        mtd = mtd_spend(user, year_month)
        # Evaluate thresholds
        evaluate_thresholds(budget, mtd)
    except MonthlyBudget.DoesNotExist:
        # No budget for this month, nothing to do
        pass


@receiver(post_save, sender=Transaction)
def transaction_saved(sender, instance, **kwargs):
    """When a transaction is created or updated, recompute MTD and check thresholds."""
    recompute_budget_for_transaction(instance)


@receiver(post_delete, sender=Transaction)
def transaction_deleted(sender, instance, **kwargs):
    """When a transaction is deleted, recompute MTD and check thresholds."""
    recompute_budget_for_transaction(instance)

