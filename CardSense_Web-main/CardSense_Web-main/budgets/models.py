from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
import json


def default_thresholds():
    """Default thresholds for budget alerts."""
    return [0.5, 0.7, 0.9]


def default_fired_flags():
    """Default fired flags list."""
    return []


class MonthlyBudget(models.Model):
    """Single monthly budget per user. Key is (user, year_month)."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="budgets")
    year_month = models.CharField(max_length=7)  # YYYY-MM format
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    thresholds = models.JSONField(default=default_thresholds)  # default [0.5, 0.7, 0.9]
    fired_flags = models.JSONField(default=default_fired_flags)  # track which thresholds already fired
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['user', 'year_month']]
        indexes = [
            models.Index(fields=['user', 'year_month']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.year_month}: ${self.amount}"


class BudgetAlertEvent(models.Model):
    """Alert fired when MTD spend crosses a threshold."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="budget_alerts")
    year_month = models.CharField(max_length=7)
    threshold = models.DecimalField(max_digits=3, decimal_places=2)  # e.g., 0.50, 0.70, 0.90
    spend_at_fire = models.DecimalField(max_digits=10, decimal_places=2)
    fired_at = models.DateTimeField(auto_now_add=True)
    channel = models.CharField(max_length=50, blank=True, null=True)  # optional
    status = models.CharField(max_length=20, default='pending')  # pending, acknowledged

    class Meta:
        indexes = [
            models.Index(fields=['user', '-fired_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.year_month} @ {self.threshold} ({self.status})"
