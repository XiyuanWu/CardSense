from rest_framework import serializers
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from django.utils import timezone
from datetime import datetime
from cards.models import Card, RewardRule
from cards.models import UserCard
from .models import Transaction

class CardBasicSerializer(serializers.ModelSerializer):
    """Basic card info for transactions"""
    class Meta:
        model = Card
        fields = ("id", "name", "issuer")

class TransactionSerializer(serializers.ModelSerializer):
    card_actually_used_details = CardBasicSerializer(source='card_actually_used', read_only=True)
    recommended_card_details = CardBasicSerializer(source='recommended_card', read_only=True)
    
    # Calculated reward fields
    actual_reward = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    optimal_reward = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    missed_reward = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    used_optimal_card = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Transaction
        fields = (
            "id", 
            "card_actually_used",
            "card_actually_used_details",
            "recommended_card", 
            "recommended_card_details",
            "merchant", 
            "amount", 
            "category",
            "actual_reward",
            "optimal_reward",
            "missed_reward",
            "used_optimal_card",
            "created_at", 
            "updated_at", 
            "notes"
        )
        read_only_fields = ("id", "user", "created_at", "updated_at")
    
    # Amount cannot be negative
    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Amount cannot be negative.")
        return value


class TransactionCSVRowSerializer(serializers.Serializer):
    card = serializers.CharField(required=False, allow_blank=True)
    merchant = serializers.CharField(required=True)
    amount = serializers.CharField(required=True)
    category = serializers.CharField(required=True)
    date = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_merchant(self, value):
        merchant = value.strip() if value else ""
        if not merchant:
            raise serializers.ValidationError("Merchant cannot be empty.")
        return merchant
    
    def validate_amount(self, value):
        try:
            amount = Decimal(str(value).strip())
        except (InvalidOperation, ValueError):
            raise serializers.ValidationError(f"Invalid amount format: '{value}'")
        
        if amount < 0:
            raise serializers.ValidationError("Amount cannot be negative.")
        
        amount = amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        return amount
    
    def validate_category(self, value):
        category = value.strip() if value else ""
        valid_categories = [choice[0] for choice in RewardRule.CATEGORY_CHOICES]
        
        if category not in valid_categories:
            raise serializers.ValidationError(f"Invalid category '{category}'. Valid: {', '.join(valid_categories)}")
        return category
    
    def validate_card(self, value):
        user = self.context.get("user")
        if not user:
            raise serializers.ValidationError("User context is required.")
        
        card_value = value.strip() if value else ""
        if not card_value:
            # Card is optional now - return None
            return None
        
        try:
            card_id = int(card_value)
            try:
                user_card = UserCard.objects.select_related('card').get(
                    user=user,
                    card_id=card_id,
                    is_active=True
                )
                return user_card.card
            except UserCard.DoesNotExist:
                raise serializers.ValidationError(f"Card ID '{card_id}' not found in your wallet.")
        except ValueError:
            try:
                card = Card.objects.get(name__iexact=card_value)
                try:
                    UserCard.objects.get(
                        user=user,
                        card=card,
                        is_active=True
                    )
                    return card
                except UserCard.DoesNotExist:
                    raise serializers.ValidationError(f"Card '{card_value}' not found in your wallet.")
            except Card.DoesNotExist:
                raise serializers.ValidationError(f"Card '{card_value}' not found.")
            except Card.MultipleObjectsReturned:
                raise serializers.ValidationError(f"Multiple cards found with name '{card_value}'. Please use card number instead.")
    
    def validate_date(self, value):
        if not value or not value.strip():
            return None
        
        date_str = value.strip()
        try:
            parsed_date = datetime.strptime(date_str, "%Y-%m-%d")
            return timezone.make_aware(parsed_date)
        except ValueError:
            raise serializers.ValidationError(
                f"Invalid date format '{date_str}'. Expected format: YYYY-MM-DD (e.g., 2025-10-01)"
            )
    
    def validate_notes(self, value):
        return value if value else None
    
    def create(self, validated_data):
        from optimizer.services import best_cards_for_category
        
        user = self.context["user"]
        card = validated_data.get("card")  # Can be None now
        merchant = validated_data["merchant"]
        amount = validated_data["amount"]
        category = validated_data["category"]
        notes = validated_data.get("notes")
        date = validated_data.get("date")
        
        # Get recommended card if no card specified
        recommended_card = None
        if category:
            recommendation = best_cards_for_category(category, user)
            if recommendation.get('best_card'):
                try:
                    recommended_card = Card.objects.get(id=recommendation['best_card']['card_id'])
                except Card.DoesNotExist:
                    pass
        
        transaction = Transaction.objects.create(
            user=user,
            card_actually_used=card,
            recommended_card=recommended_card,
            merchant=merchant,
            amount=amount,
            category=category,
            notes=notes
        )
        
        if date:
            Transaction.objects.filter(id=transaction.id).update(created_at=date)
            transaction.refresh_from_db()
            from budgets.signals import recompute_budget_for_transaction
            recompute_budget_for_transaction(transaction)
        
        return transaction