"""
Rewards calculation service for transactions.
Calculates cashback/points based on card reward rules and transaction categories.
"""
from decimal import Decimal
from cards.models import RewardRule


def calculate_transaction_reward(transaction):
    """
    Calculate the reward earned for a single transaction.
    Uses the recommended card if no actual card is specified.
    Falls back to OTHER (base rate) if no specific category bonus exists.
    
    Args:
        transaction: Transaction object with card_actually_used, amount, and category
    
    Returns:
        Decimal: Reward amount earned (in dollars/cashback)
    """
    # Use recommended_card if card is not specified (recommendation scenario)
    card_to_use = transaction.card_actually_used or transaction.recommended_card
    
    if not card_to_use or not transaction.category:
        return Decimal('0.00')
    
    # Get all reward rules for this card
    reward_rules = RewardRule.objects.filter(card=card_to_use)
    
    best_multiplier = Decimal('0.00')
    best_other_multiplier = Decimal('0.00')  # Fallback for base rate
    
    for rule in reward_rules:
        # Check if transaction category matches rule category
        # rule.category can be a string or comma-separated list from MultiSelectField
        categories = rule.category
        if isinstance(categories, str):
            categories = [cat.strip() for cat in categories.split(',')]
        
        # Track the best OTHER (base rate) multiplier as fallback
        if 'OTHER' in categories:
            if rule.multiplier and rule.multiplier > best_other_multiplier:
                best_other_multiplier = rule.multiplier
        
        # Check for exact category match
        if transaction.category in categories:
            if rule.multiplier and rule.multiplier > best_multiplier:
                best_multiplier = rule.multiplier
    
    # If no specific category bonus found, fall back to OTHER (base rate)
    if best_multiplier == Decimal('0.00') and best_other_multiplier > Decimal('0.00'):
        best_multiplier = best_other_multiplier
    
    # Calculate reward: amount × multiplier ÷ 100 (if multiplier is percentage)
    # Most cards use percentage (e.g., 3% back = multiplier of 3.00)
    reward = (transaction.amount * best_multiplier) / Decimal('100')
    
    return reward.quantize(Decimal('0.01'))


def calculate_total_rewards(user, start_date=None, end_date=None):
    """
    Calculate total rewards earned by a user across all transactions.
    
    Args:
        user: User object
        start_date: Optional start date filter
        end_date: Optional end date filter
    
    Returns:
        Decimal: Total rewards earned
    """
    from transactions.models import Transaction
    
    transactions = Transaction.objects.filter(user=user)
    
    if start_date:
        transactions = transactions.filter(created_at__gte=start_date)
    if end_date:
        transactions = transactions.filter(created_at__lte=end_date)
    
    total_rewards = Decimal('0.00')
    
    for transaction in transactions:
        total_rewards += calculate_transaction_reward(transaction)
    
    return total_rewards.quantize(Decimal('0.01'))


def calculate_rewards_by_card(user, start_date=None, end_date=None):
    """
    Calculate rewards earned per card for a user.
    Uses recommended card if actual card is not specified.
    
    Args:
        user: User object
        start_date: Optional start date filter
        end_date: Optional end date filter
    
    Returns:
        dict: {card_id: reward_amount}
    """
    from transactions.models import Transaction
    
    transactions = Transaction.objects.filter(user=user)
    
    if start_date:
        transactions = transactions.filter(created_at__gte=start_date)
    if end_date:
        transactions = transactions.filter(created_at__lte=end_date)
    
    rewards_by_card = {}
    
    for transaction in transactions:
        # Use recommended_card if card is not specified
        card_to_use = transaction.card_actually_used or transaction.recommended_card
        
        if not card_to_use:
            continue  # Skip transactions without any card
            
        card_id = card_to_use.id
        reward = calculate_transaction_reward(transaction)
        
        if card_id in rewards_by_card:
            rewards_by_card[card_id] += reward
        else:
            rewards_by_card[card_id] = reward
    
    return rewards_by_card

