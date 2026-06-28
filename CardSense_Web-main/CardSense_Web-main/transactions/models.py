from django.db import models
from django.conf import settings
from cards.models import Card, RewardRule
from decimal import Decimal

# Create your models here.


class Transaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="transactions")
    card_actually_used = models.ForeignKey(
        Card, 
        on_delete=models.SET_NULL, 
        related_name="used_transactions", 
        null=True, 
        blank=True,
        verbose_name="Card Actually Used",
        help_text="The card that was actually used for this transaction (optional)"
    )
    recommended_card = models.ForeignKey(
        Card, 
        on_delete=models.SET_NULL, 
        related_name="recommended_transactions", 
        null=True, 
        blank=True,
        verbose_name="Recommended Card",
        help_text="The optimal card recommended by the system"
    )
    merchant = models.CharField(max_length=255)
    amount = models.DecimalField("Amount ($)", max_digits=10, decimal_places=2)
    category = models.CharField(max_length=255, choices=RewardRule.CATEGORY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.merchant} - ${self.amount} ({self.user.username})"
    
    def _calculate_reward_for_card(self, card):
        """Helper method to calculate reward for a specific card"""
        if not card or not self.category:
            return Decimal('0.00')
        
        # Get all reward rules for this card
        reward_rules = RewardRule.objects.filter(card=card)
        best_multiplier = Decimal('0.00')
        best_other_multiplier = Decimal('0.00')  # Fallback for base rate
        
        for rule in reward_rules:
            # Check if transaction category matches rule category
            categories = rule.category
            if isinstance(categories, str):
                categories = [cat.strip() for cat in categories.split(',')]
            
            # Track the best OTHER (base rate) multiplier as fallback
            if 'OTHER' in categories:
                if rule.multiplier and rule.multiplier > best_other_multiplier:
                    best_other_multiplier = rule.multiplier
            
            # Check for exact category match
            if self.category in categories:
                if rule.multiplier and rule.multiplier > best_multiplier:
                    best_multiplier = rule.multiplier
        
        # If no specific category bonus found, fall back to OTHER (base rate)
        if best_multiplier == Decimal('0.00') and best_other_multiplier > Decimal('0.00'):
            best_multiplier = best_other_multiplier
        
        # Calculate reward: amount × multiplier ÷ 100
        reward = (self.amount * best_multiplier) / Decimal('100')
        return reward.quantize(Decimal('0.01'))
    
    @property
    def actual_reward(self):
        """Reward from card actually used (0 if no card specified)"""
        if not self.card_actually_used:
            return Decimal('0.00')  # No card used = no rewards earned
        return self._calculate_reward_for_card(self.card_actually_used)
    
    @property
    def optimal_reward(self):
        """Reward from the recommended (optimal) card"""
        return self._calculate_reward_for_card(self.recommended_card)
    
    @property
    def missed_reward(self):
        """Difference between optimal and actual rewards (positive = missed opportunity)"""
        return self.optimal_reward - self.actual_reward
    
    @property
    def used_optimal_card(self):
        """True only if user explicitly used the recommended card"""
        if not self.card_actually_used:
            return False  # No card specified - can't verify optimization
        if not self.recommended_card:
            return True  # No recommendation available, so any card is fine
        return self.card_actually_used.id == self.recommended_card.id