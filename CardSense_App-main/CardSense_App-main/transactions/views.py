from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .models import Transaction
from .serializers import TransactionSerializer, TransactionCSVRowSerializer
from rest_framework import viewsets, permissions
import csv
import io
from datetime import datetime
from budgets.models import MonthlyBudget
from budgets.services import mtd_spend, evaluate_thresholds
from optimizer.services import best_cards_for_category
from cards.models import Card


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # AI help me understand the concept of two functions below, what is does in detail
    
    # Records the API should return when a user makes a GET request
    # No filter. Will return all transactions for that user, sorted by created_at in descending order
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).select_related('card_actually_used', 'recommended_card').order_by("-created_at")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Transaction created successfully'
        }, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'Transaction deleted successfully'
        }, status=status.HTTP_200_OK)

    # Saves the transaction to the database
    def perform_create(self, serializer):
        # Get recommended card based on category
        category = serializer.validated_data.get('category')
        recommended_card_id = None
        
        if category:
            recommendation = best_cards_for_category(category, self.request.user)
            if recommendation.get('best_card'):
                recommended_card_id = recommendation['best_card']['card_id']
        
        # Save transaction with recommended card
        if recommended_card_id:
            try:
                recommended_card = Card.objects.get(id=recommended_card_id)
                serializer.save(user=self.request.user, recommended_card=recommended_card)
            except Card.DoesNotExist:
                serializer.save(user=self.request.user)
        else:
            serializer.save(user=self.request.user)
        
        # After creating transaction, check if we need to fire budget alerts
        now = datetime.now()
        current_month = now.strftime('%Y-%m')
        try:
            budget = MonthlyBudget.objects.get(user=self.request.user, year_month=current_month)
            mtd = mtd_spend(self.request.user, current_month)
            evaluate_thresholds(budget, mtd)
        except MonthlyBudget.DoesNotExist:
            pass  # No budget set for this month

class CardRecommendationView(APIView):
    """Get card recommendation for a given category"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        category = request.data.get('category')
        amount = request.data.get('amount', 0)
        
        if not category:
            return Response(
                {
                    "success": False,
                    "error": "Category is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        recommendation = best_cards_for_category(category, request.user)
        
        return Response({
            "success": True,
            "data": {
                "category": category,
                "amount": amount,
                "recommendation": recommendation
            }
        })


class TransactionCSVImportView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        if 'file' not in request.FILES:
            return Response(
                {
                    "success": False,
                    "error": "No file uploaded under 'file'."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        uploaded_file = request.FILES['file']
        
        try:
            file_content = uploaded_file.read().decode('utf-8')
        except UnicodeDecodeError as e:
            return Response(
                {
                    "success": False,
                    "error": f"File encoding error: {str(e)}. Please ensure the file is UTF-8 encoded."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            csv_reader = csv.DictReader(io.StringIO(file_content))
        except Exception as e:
            return Response(
                {"detail": f"CSV parsing error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        imported_count = 0
        failed_count = 0
        results = []
        
        for row_num, row_data in enumerate(csv_reader, start=2):
            serializer = TransactionCSVRowSerializer(
                data=row_data,
                context={"user": request.user}
            )
            
            if serializer.is_valid():
                try:
                    transaction = serializer.save()
                    results.append({
                        "row": row_num,
                        "status": "imported",
                        "transaction_id": transaction.id
                    })
                    imported_count += 1
                except Exception as e:
                    results.append({
                        "row": row_num,
                        "status": "error",
                        "errors": {"non_field_errors": [str(e)]}
                    })
                    failed_count += 1
            else:
                results.append({
                    "row": row_num,
                    "status": "error",
                    "errors": serializer.errors
                })
                failed_count += 1
        
        # After importing, check if we need to fire budget alerts
        if imported_count > 0:
            now = datetime.now()
            current_month = now.strftime('%Y-%m')
            try:
                budget = MonthlyBudget.objects.get(user=request.user, year_month=current_month)
                mtd = mtd_spend(request.user, current_month)
                evaluate_thresholds(budget, mtd)
            except MonthlyBudget.DoesNotExist:
                pass  # No budget set for this month
        
        return Response({
            "success": True,
            "data": {
                "imported_count": imported_count,
                "failed_count": failed_count,
                "results": results
            }
        }, status=status.HTTP_200_OK)


class OptimizationStatsView(APIView):
    """Get user's card optimization statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        now = datetime.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        transactions = Transaction.objects.filter(
            user=user,
            created_at__gte=month_start
        )
        
        total = transactions.count()
        
        if total == 0:
            return Response({
                "success": True,
                "data": {
                    "total_transactions": 0,
                    "optimal_card_usage_count": 0,
                    "optimization_rate": 0,
                    "actual_rewards": 0,
                    "potential_rewards": 0,
                    "missed_rewards": 0
                }
            })
        
        optimal_count = sum(1 for t in transactions if t.used_optimal_card)
        
        total_actual_rewards = sum(float(t.actual_reward) for t in transactions)
        total_optimal_rewards = sum(float(t.optimal_reward) for t in transactions)
        total_missed = total_optimal_rewards - total_actual_rewards
        
        return Response({
            "success": True,
            "data": {
                "total_transactions": total,
                "optimal_card_usage_count": optimal_count,
                "optimization_rate": round((optimal_count / total * 100), 2) if total > 0 else 0,
                "actual_rewards": round(total_actual_rewards, 2),
                "potential_rewards": round(total_optimal_rewards, 2),
                "missed_rewards": round(total_missed, 2)
            }
        })