from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.HealthCheckView.as_view(), name='health'),
    path('current/', views.BudgetsCurrentView.as_view(), name='budgets-current'),
    path('', views.BudgetsView.as_view(), name='budgets'),
    path('history/', views.BudgetsHistoryView.as_view(), name='budgets-history'),
    path('alerts/', views.BudgetAlertsView.as_view(), name='budgets-alerts'),
    path('alerts/<int:id>/ack/', views.BudgetAlertAckView.as_view(), name='budget-alert-ack'),
]
