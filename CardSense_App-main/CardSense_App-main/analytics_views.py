from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from transactions.models import Transaction
from budgets.models import MonthlyBudget, BudgetAlertEvent
from transactions.rewards import calculate_total_rewards
from django.db.models import Sum
from datetime import datetime
from decimal import Decimal

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        now = datetime.now()
        current_month = now.strftime('%Y-%m')
        
        # Get this month's spending
        this_month_transactions = Transaction.objects.filter(
            user=user,
            created_at__year=now.year,
            created_at__month=now.month
        )
        
        total_spent = this_month_transactions.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        # Calculate rewards earned this month
        month_start = datetime(now.year, now.month, 1)
        rewards_earned = calculate_total_rewards(user, start_date=month_start)
        
        # Get current budget
        try:
            current_budget = MonthlyBudget.objects.get(
                user=user,
                year_month=current_month
            )
            budget_data = {
                'id': current_budget.id,
                'amount': float(current_budget.amount),
                'spent': float(total_spent),
                'remaining': float(current_budget.amount - total_spent),
                'percentage_used': float((total_spent / current_budget.amount) * 100) if current_budget.amount > 0 else 0,
                'category': {
                    'name': f'Monthly Budget ({current_month})'
                }
            }
        except MonthlyBudget.DoesNotExist:
            budget_data = None
        
        # Get recent transactions
        recent_transactions = this_month_transactions.order_by('-created_at')[:5]
        transactions_data = []
        for t in recent_transactions:
            transactions_data.append({
                'id': t.id,
                'merchant': t.merchant,
                'amount': float(t.amount),
                'category': t.category,
                'date': t.created_at.strftime('%Y-%m-%d'),
                'created_at': t.created_at.isoformat()
            })
        
        # Count active budgets (current month and future only)
        active_budgets = MonthlyBudget.objects.filter(
            user=user,
            year_month__gte=current_month
        ).count()
        
        # Count pending budget alerts
        budget_alerts_count = BudgetAlertEvent.objects.filter(
            user=user,
            status='pending'
        ).count()
        
        return Response({
            'success': True,
            'data': {
                'summary': {
                    'total_spent_this_month': float(total_spent),
                    'total_rewards_this_month': float(rewards_earned),
                    'active_budgets': active_budgets,
                    'budget_alerts': budget_alerts_count
                },
                'budget_status': [budget_data] if budget_data else [],
                'recent_transactions': transactions_data
            }
        })

