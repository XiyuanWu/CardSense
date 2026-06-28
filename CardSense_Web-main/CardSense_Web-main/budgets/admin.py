from django.contrib import admin
from .models import MonthlyBudget, BudgetAlertEvent

# Register your models here.

@admin.register(MonthlyBudget)
class MonthlyBudgetAdmin(admin.ModelAdmin):
    list_display = ['user', 'year_month', 'amount', 'created_at']
    list_filter = ['year_month', 'created_at']
    search_fields = ['user__username', 'year_month']


@admin.register(BudgetAlertEvent)
class BudgetAlertEventAdmin(admin.ModelAdmin):
    list_display = ['user', 'year_month', 'threshold', 'spend_at_fire', 'fired_at', 'status']
    list_filter = ['status', 'year_month', 'fired_at']
    search_fields = ['user__username', 'year_month']
