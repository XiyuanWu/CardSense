from rest_framework import serializers
from decimal import Decimal
from .models import MonthlyBudget, BudgetAlertEvent
from .services import mtd_spend


class MonthlyBudgetSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating monthly budgets."""
    
    class Meta:
        model = MonthlyBudget
        fields = ['id', 'user', 'year_month', 'amount', 'thresholds', 'fired_flags', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'fired_flags', 'created_at', 'updated_at']
    
    def validate_thresholds(self, value):
        """Make sure thresholds are in (0,1] and non-decreasing."""
        if not isinstance(value, list):
            raise serializers.ValidationError("thresholds must be a list")
        if len(value) == 0:
            raise serializers.ValidationError("thresholds cannot be empty")
        prev = 0
        for t in value:
            t_float = float(t)
            if t_float <= 0 or t_float > 1:
                raise serializers.ValidationError(f"threshold {t} must be in (0, 1]")
            if t_float < prev:
                raise serializers.ValidationError("thresholds must be non-decreasing")
            prev = t_float
        return value


class BudgetCurrentSerializer(serializers.Serializer):
    """Response shape for /current/ endpoint."""
    budget = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    mtd = serializers.DecimalField(max_digits=10, decimal_places=2)
    percent_used = serializers.FloatField()
    next_threshold = serializers.DecimalField(max_digits=3, decimal_places=2, allow_null=True)


class BudgetAlertEventSerializer(serializers.ModelSerializer):
    """Serializer for budget alert events."""
    
    class Meta:
        model = BudgetAlertEvent
        fields = ['id', 'year_month', 'threshold', 'spend_at_fire', 'fired_at', 'channel', 'status']
        read_only_fields = ['id', 'fired_at']


class BudgetHistoryItemSerializer(serializers.Serializer):
    """Item in history response."""
    year_month = serializers.CharField()
    budget_amount = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    actual_spend = serializers.DecimalField(max_digits=10, decimal_places=2)
    percent_used = serializers.FloatField()

