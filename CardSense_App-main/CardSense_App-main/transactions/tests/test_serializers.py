from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError as DRFValidationError
from transactions.serializers import TransactionSerializer
from cards.models import Card


'''
Expectations
------------
TransactionSerializer
- Serializes all core fields: id, card_actually_used, card_actually_used_details, recommended_card, recommended_card_details, merchant, amount, category, created_at, updated_at, notes.
- Includes computed fields: actual_reward, optimal_reward, missed_reward, used_optimal_card.
- Automatically handles read-only fields: id, user, created_at, updated_at, and computed reward fields.
- Validates 'category' against RewardRule.CATEGORY_CHOICES.
- Validates 'amount' as a positive decimal.
- Accepts optional 'notes' and 'card_actually_used' (nullable/blank).
- Prevents client from overriding 'user'.
'''

User = get_user_model()

class TestTransactionSerializer(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u1", email="u1@example.com", password="pw")
        self.card = Card.objects.create(name="Freedom", issuer="CHASE", annual_fee=0, ftf=True)

    def _make_context(self):
        # Create a mock request object with user
        class MockRequest:
            def __init__(self, user):
                self.user = user
        return {"request": MockRequest(self.user)}

    def test_valid_transaction_serialization(self):
        data = {
            "card_actually_used": self.card.id,
            "merchant": "Amazon",
            "amount": "23.45",
            "category": "ONLINE_SHOPPING",  # Fixed: use valid category
            "notes": "Test purchase",
        }
        ser = TransactionSerializer(data=data, context=self._make_context())
        self.assertTrue(ser.is_valid(), ser.errors)
        instance = ser.save(user=self.user)
        self.assertEqual(instance.user, self.user)
        self.assertEqual(instance.amount, Decimal("23.45"))
        self.assertEqual(instance.category, "ONLINE_SHOPPING")

        rendered = TransactionSerializer(instance).data
        for key in ("id", "card_actually_used", "merchant", "amount", "category", "created_at", "updated_at", "notes"):
            self.assertIn(key, rendered)

    def test_invalid_category_rejected(self):
        data = {
            "card_actually_used": self.card.id,
            "merchant": "eBay",
            "amount": "15.00",
            "category": "INVALID",
        }
        ser = TransactionSerializer(data=data, context=self._make_context())
        with self.assertRaises(DRFValidationError):
            if ser.is_valid(raise_exception=True):
                ser.save(user=self.user)

    def test_negative_amount_rejected(self):
        data = {
            "card_actually_used": self.card.id,
            "merchant": "Nike",
            "amount": "-10.00",
            "category": "ONLINE_SHOPPING",  # Fixed: use valid category
        }
        ser = TransactionSerializer(data=data, context=self._make_context())
        self.assertFalse(ser.is_valid())
        self.assertIn("amount", ser.errors)

    def test_notes_optional(self):
        data = {
            "card_actually_used": self.card.id,
            "merchant": "Starbucks",
            "amount": "4.50",
            "category": "DINING",
        }
        ser = TransactionSerializer(data=data, context=self._make_context())
        self.assertTrue(ser.is_valid(), ser.errors)
        instance = ser.save(user=self.user)
        self.assertIsNone(instance.notes)

    def test_readonly_fields_not_writable(self):
        # user tries to override user or id
        data = {
            "card_actually_used": self.card.id,
            "merchant": "Target",
            "amount": "50.00",
            "category": "GROCERIES",
            "user": 999,  # should be ignored
        }
        ser = TransactionSerializer(data=data, context=self._make_context())
        self.assertTrue(ser.is_valid(), ser.errors)
        instance = ser.save(user=self.user)
        self.assertEqual(instance.user, self.user)

# To run the tests:
# python manage.py test transactions.tests.test_serializers
