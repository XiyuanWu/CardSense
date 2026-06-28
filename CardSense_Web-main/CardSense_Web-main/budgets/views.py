from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from datetime import datetime
from django.utils import timezone as django_timezone
from .models import MonthlyBudget, BudgetAlertEvent
from .serializers import (
    MonthlyBudgetSerializer, BudgetCurrentSerializer, BudgetAlertEventSerializer,
    BudgetHistoryItemSerializer
)
from .services import mtd_spend, evaluate_thresholds, compute_user_month_window, get_user_timezone


# Check API health
class HealthCheckView(APIView):
    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)


class BudgetsCurrentView(APIView):
    """GET /api/budgets/current/ - Return current month's budget, MTD spend, percent used, next threshold."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        # Get current month in user's timezone
        tz = get_user_timezone(user)
        now_user_tz = django_timezone.now().astimezone(tz)
        year_month = now_user_tz.strftime('%Y-%m')
        
        # Get budget for this month
        try:
            budget_obj = MonthlyBudget.objects.get(user=user, year_month=year_month)
            budget_amount = budget_obj.amount
            thresholds = budget_obj.thresholds if isinstance(budget_obj.thresholds, list) else [0.5, 0.7, 0.9]
            fired_flags = budget_obj.fired_flags if isinstance(budget_obj.fired_flags, list) else []
        except MonthlyBudget.DoesNotExist:
            budget_amount = None
            thresholds = [0.5, 0.7, 0.9]
            fired_flags = []
        
        # Compute MTD spend
        mtd = mtd_spend(user, year_month)
        
        # Compute percent used
        if budget_amount and budget_amount > 0:
            percent_used = float(mtd / budget_amount)
        else:
            percent_used = 0.0
        
        # Find next threshold (lowest not yet crossed)
        next_threshold = None
        for threshold in thresholds:
            threshold_float = float(threshold)
            if percent_used < threshold_float and threshold_float not in fired_flags:
                next_threshold = Decimal(str(threshold_float))
                break
        
        serializer = BudgetCurrentSerializer({
            'budget': budget_amount,
            'mtd': mtd,
            'percent_used': percent_used,
            'next_threshold': next_threshold
        })
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class BudgetsView(APIView):
    """GET /api/budgets/ - List all budgets for the user.
       POST /api/budgets/ - Create or upsert monthly budget for given or current year_month.
       DELETE /api/budgets/?year_month=YYYY-MM - Delete budget for specified month."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """List all budgets for the user, ordered by year_month descending."""
        user = request.user
        budgets = MonthlyBudget.objects.filter(user=user).order_by('-year_month')
        
        # Calculate spending for each budget
        result = []
        for budget in budgets:
            mtd = mtd_spend(user, budget.year_month)
            percent_used = float(mtd / budget.amount) if budget.amount > 0 else 0.0
            
            result.append({
                'id': budget.id,
                'year_month': budget.year_month,
                'amount': float(budget.amount),
                'spent': float(mtd),
                'remaining': float(budget.amount - mtd),
                'percentage_used': percent_used * 100,
                'thresholds': budget.thresholds,
                'fired_flags': budget.fired_flags
            })
        
        return Response({
            'success': True,
            'data': result
        }, status=status.HTTP_200_OK)
    
    def delete(self, request):
        user = request.user
        year_month = request.query_params.get('year_month')
        
        if not year_month:
            # If no year_month provided, use current month
            tz = get_user_timezone(user)
            now_user_tz = django_timezone.now().astimezone(tz)
            year_month = now_user_tz.strftime('%Y-%m')
        
        try:
            budget_obj = MonthlyBudget.objects.get(user=user, year_month=year_month)
            
            # Delete associated budget alerts for this year_month
            BudgetAlertEvent.objects.filter(user=user, year_month=year_month).delete()
            
            # Delete the budget
            budget_obj.delete()
            
            return Response({
                "success": True,
                "message": "Budget and associated alerts deleted successfully"
            }, status=status.HTTP_200_OK)
        except MonthlyBudget.DoesNotExist:
            return Response({
                "success": False,
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Budget not found"
                }
            }, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        user = request.user
        data = request.data.copy()
        # Remove user from data since it's read-only and set automatically
        if 'user' in data:
            del data['user']
        
        # If year_month not provided, use current month
        if 'year_month' not in data or not data['year_month']:
            tz = get_user_timezone(user)
            now_user_tz = django_timezone.now().astimezone(tz)
            data['year_month'] = now_user_tz.strftime('%Y-%m')
        
        # Check if budget exists
        year_month = data['year_month']
        try:
            budget_obj = MonthlyBudget.objects.get(user=user, year_month=year_month)
            # Update existing budget
            old_thresholds = budget_obj.thresholds if isinstance(budget_obj.thresholds, list) else [0.5, 0.7, 0.9]
            serializer = MonthlyBudgetSerializer(budget_obj, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                # If thresholds changed, recompute fired_flags
                new_thresholds = serializer.validated_data.get('thresholds', old_thresholds)
                if new_thresholds != old_thresholds:
                    # Reset fired_flags and recompute
                    budget_obj.fired_flags = []
                    budget_obj.save(update_fields=['fired_flags'])
                    # Recompute MTD and evaluate thresholds
                    mtd = mtd_spend(user, year_month)
                    evaluate_thresholds(budget_obj, mtd)
                return Response({
                    "success": True,
                    "data": serializer.data,
                    "message": "Budget updated successfully"
                }, status=status.HTTP_200_OK)
            return Response({
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Failed to update budget",
                    "details": serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        except MonthlyBudget.DoesNotExist:
            # Create new budget
            serializer = MonthlyBudgetSerializer(data=data)
            if serializer.is_valid():
                budget_obj = serializer.save(user=user)
                # Compute MTD and evaluate thresholds
                mtd = mtd_spend(user, year_month)
                evaluate_thresholds(budget_obj, mtd)
                return Response({
                    "success": True,
                    "data": serializer.data,
                    "message": "Budget created successfully"
                }, status=status.HTTP_201_CREATED)
            return Response({
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Failed to create budget",
                    "details": serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)


class BudgetsHistoryView(APIView):
    """GET /api/budgets/history/?limit=6 - Return last N months: budget vs actual totals."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        limit = int(request.query_params.get('limit', 6))
        
        # Get current month in user's timezone
        tz = get_user_timezone(user)
        now_user_tz = django_timezone.now().astimezone(tz)
        
        # Build list of last N months
        months = []
        current_month_start = now_user_tz.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        for i in range(limit):
            # Go back i months from current month
            if i == 0:
                month_dt = current_month_start
            else:
                # Subtract i months - go to first of current month, then subtract i months
                year = current_month_start.year
                month = current_month_start.month - i
                while month <= 0:
                    month += 12
                    year -= 1
                month_dt = datetime(year, month, 1, tzinfo=tz)
            year_month = month_dt.strftime('%Y-%m')
            months.append(year_month)
        
        # Get budgets for these months
        budgets = {b.year_month: b for b in MonthlyBudget.objects.filter(user=user, year_month__in=months)}
        
        # Build response
        history = []
        for year_month in months:
            budget_obj = budgets.get(year_month)
            budget_amount = budget_obj.amount if budget_obj else None
            actual_spend = mtd_spend(user, year_month)
            if budget_amount and budget_amount > 0:
                percent_used = float(actual_spend / budget_amount)
            else:
                percent_used = 0.0
            
            history.append({
                'year_month': year_month,
                'budget_amount': budget_amount,
                'actual_spend': actual_spend,
                'percent_used': percent_used
            })
        
        serializer = BudgetHistoryItemSerializer(history, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BudgetAlertsView(APIView):
    """GET /api/budgets/alerts/ - List recent BudgetAlertEvents for the user."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        alerts = BudgetAlertEvent.objects.filter(user=user).order_by('-fired_at')
        serializer = BudgetAlertEventSerializer(alerts, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)


class BudgetAlertAckView(APIView):
    """POST /api/budgets/alerts/{id}/ack/ - Mark an alert as acknowledged."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, id):
        user = request.user
        try:
            alert = BudgetAlertEvent.objects.get(id=id, user=user)
            alert.status = 'acknowledged'
            alert.save(update_fields=['status'])
            serializer = BudgetAlertEventSerializer(alert)
            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        except BudgetAlertEvent.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Alert not found'
            }, status=status.HTTP_404_NOT_FOUND)
