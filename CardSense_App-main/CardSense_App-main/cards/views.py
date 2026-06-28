# Most of the code is AI generated in this file
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from .models import Card, RewardRule, UserCard, CardBenefit
from .serializers import CardSerializer, RewardRuleSerializer, UserCardSerializer, CardBenefitSerializer
from transactions.rewards import calculate_rewards_by_card
from datetime import datetime

# Create your views here.
# Check API health
class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)


class CardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Card.objects.all().order_by("issuer", "name")
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response({"success": True, "data": response.data}, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return Response({"success": True, "data": response.data}, status=status.HTTP_200_OK)

class RewardRuleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RewardRule.objects.select_related("card").all()
    serializer_class = RewardRuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response({"success": True, "data": response.data}, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return Response({"success": True, "data": response.data}, status=status.HTTP_200_OK)

class UserCardViewSet(viewsets.ModelViewSet):
    serializer_class = UserCardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserCard.objects.select_related("card").filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response({"success": True, "data": response.data}, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return Response({"success": True, "data": response.data}, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response({"success": True, "data": response.data}, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return Response({"success": True, "data": response.data}, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        return Response({"success": True, "data": response.data}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return Response({"success": True, "message": "User card removed successfully"}, status=status.HTTP_200_OK)

class CardBenefitViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CardBenefit.objects.select_related("card").all()
    serializer_class = CardBenefitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response({"success": True, "data": response.data}, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return Response({"success": True, "data": response.data}, status=status.HTTP_200_OK)


class CardRewardsView(APIView):
    """GET /api/cards/rewards/ - Get rewards earned per card for the current user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        now = datetime.now()
        
        # Calculate rewards for current month
        month_start = datetime(now.year, now.month, 1)
        rewards_by_card = calculate_rewards_by_card(user, start_date=month_start)
        
        # Format response with card details
        user_cards = UserCard.objects.filter(user=user).select_related('card')
        
        result = []
        for user_card in user_cards:
            card_id = user_card.card.id
            reward_amount = float(rewards_by_card.get(card_id, 0))
            
            result.append({
                'card_id': card_id,
                'card_name': user_card.card.name,
                'card_issuer': user_card.card.issuer,
                'rewards_earned': reward_amount
            })
        
        return Response({
            'success': True,
            'data': result
        }, status=status.HTTP_200_OK)