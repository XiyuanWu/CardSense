from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from cards.models import Card, CardBenefit, RewardRule, UserCard
from cards.serializers import (
    CardBenefitSerializer,
    CardSerializer,
    RewardRuleSerializer,
    UserCardSerializer,
)

'''
Expectations
------------
CardBenefitSerializer
- Converts a comma/line-separated benefits string into a list of clean items.
- Returns an empty list if benefits is blank or None.

CardSerializer
- Serializes core card fields: id, name, issuer, annual_fee, ftf.
- Includes nested read-only reward_rules and benefits.
- Does not allow direct creation/update of nested data.

RewardRuleSerializer
- Serializes multiplier and category values as strings/lists.
- Accepts only valid CATEGORY_CHOICES in category field.

UserCardSerializer
- Automatically sets 'user' from request context (CurrentUserDefault).
- 'is_active' defaults to True if not provided.
- Includes computed read-only field 'card_name' ("CardName (ISSUER)").
- Prevents duplicate (user, card) pairs with a clear validation error.
'''

User = get_user_model()


# ---------- CardBenefitSerializer ----------
class TestCardBenefitSerializer(TestCase):
    def test_split_and_clean_benefits(self):
        c = Card.objects.create(name="Prime", issuer="AMEX", annual_fee=0)
        b = CardBenefit.objects.create(card=c, benefits="Free DoorDash,  Extended warranty , ,Travel credit")
        data = CardBenefitSerializer(b).data
        self.assertEqual(data["benefits"], ["Free DoorDash", "Extended warranty", "Travel credit"])

    def test_none_or_blank_benefits_returns_empty_list(self):
        c = Card.objects.create(name="Prime", issuer="AMEX", annual_fee=0)
        b = CardBenefit.objects.create(card=c, benefits=None)
        data = CardBenefitSerializer(b).data
        self.assertEqual(data["benefits"], [])


# ---------- CardSerializer ----------
class TestCardSerializer(TestCase):
    def test_includes_nested_reward_rules_and_benefits(self):
        c = Card.objects.create(name="Freedom", issuer="CHASE", annual_fee=0)
        RewardRule.objects.create(card=c, multiplier=Decimal("1.50"), category=["OTHER"])
        CardBenefit.objects.create(card=c, benefits="No AF")
        ser = CardSerializer(c)
        data = ser.data
        for field in ["id", "name", "issuer", "annual_fee", "ftf", "reward_rules", "benefits"]:
            self.assertIn(field, data)
        self.assertEqual(len(data["reward_rules"]), 1)
        self.assertEqual(len(data["benefits"]), 1)


# ---------- RewardRuleSerializer ----------
class TestRewardRuleSerializer(TestCase):
    def test_valid_category_serialization(self):
        c = Card.objects.create(name="Custom Cash", issuer="CITI", annual_fee=0)
        rr = RewardRule.objects.create(card=c, multiplier=Decimal("5.00"), category=["DINING", "GAS"])
        ser = RewardRuleSerializer(rr)
        data = ser.data
        self.assertEqual(set(data["category"]), {"DINING", "GAS"})
        self.assertEqual(data["multiplier"], "5.00")

    def test_invalid_category_rejected(self):
        c = Card.objects.create(name="Prime", issuer="AMEX", annual_fee=0)
        ser = RewardRuleSerializer(data={"card": c.id, "multiplier": "2.0", "category": ["BAD"]})
        self.assertFalse(ser.is_valid())
        self.assertIn("category", ser.errors)


# ---------- UserCardSerializer ----------
class TestUserCardSerializer(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="x", email="x@e.com", password="pw")
        self.card = Card.objects.create(name="Altitude Go", issuer="USBANK", annual_fee=0)

    def test_sets_user_from_context_and_computes_card_name(self):
        # Create a mock request object with user
        class MockRequest:
            def __init__(self, user):
                self.user = user
        
        mock_request = MockRequest(self.user)
        ser = UserCardSerializer(data={"card": self.card.id}, context={"request": mock_request})
        self.assertTrue(ser.is_valid(), ser.errors)
        instance = ser.save()
        self.assertEqual(instance.user, self.user)
        data = UserCardSerializer(instance).data
        self.assertEqual(data["card_name"], "Altitude Go (USBANK)")

    def test_duplicate_pair_rejected(self):
        UserCard.objects.create(user=self.user, card=self.card)
        # Create a mock request object with user
        class MockRequest:
            def __init__(self, user):
                self.user = user
        
        mock_request = MockRequest(self.user)
        ser = UserCardSerializer(data={"card": self.card.id}, context={"request": mock_request})
        self.assertFalse(ser.is_valid())
        msg = str(ser.errors).lower()
        self.assertIn("already added", msg)

# To run the tests:
# python manage.py test cards.tests.test_serializers
