from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from cards.models import Card
from transactions.models import Transaction

'''
Expectations
------------
Transaction
- Must link to a valid User (FK; CASCADE on delete).
- card_actually_used is optional (FK to Card; SET_NULL on delete, null=True, blank=True).
- recommended_card is optional (FK to Card; SET_NULL on delete, null=True, blank=True).
- category must be one of RewardRule.CATEGORY_CHOICES:
  Valid choices: SELECTED_CATEGORIES, RENT, ONLINE_SHOPPING, DINING, GROCERIES,
  PHARMACY, GAS, GENERAL_TRAVEL, AIRLINE_TRAVEL, HOTEL_TRAVEL, TRANSIT,
  ENTERTAINMENT, OTHER
- amount is a Decimal with 2 places; merchant is required text.
- notes is optional (nullable/blank).
- created_at auto-populates on insert; updated_at updates on save.
- Reverse relations exist: user.transactions, card.used_transactions, card.recommended_transactions.
- __str__ returns "<merchant> - $<amount> (<username>)".
- Properties: actual_reward, optimal_reward, missed_reward, used_optimal_card.
'''


User = get_user_model()


class TestTransactionModel(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u1", email="u1@example.com", password="pw")
        self.card = Card.objects.create(name="Freedom", issuer="CHASE", annual_fee=0, ftf=True)

    def test_required_fields_and_choices(self):
        # valid category from RewardRule.CATEGORY_CHOICES
        t = Transaction(
            user=self.user,
            card_actually_used=self.card,
            merchant="Starbucks",
            amount=Decimal("4.25"),
            category="DINING",
            notes=None,
        )
        # Ensure model-level validation passes when using full_clean (choices enforced)
        t.full_clean()
        t.save()
        self.assertEqual(Transaction.objects.count(), 1)

        # invalid category should fail full_clean()
        bad = Transaction(
            user=self.user,
            card_actually_used=self.card,
            merchant="Foo",
            amount=Decimal("1.00"),
            category="NOT_A_REAL_TAG",
        )
        with self.assertRaises(ValidationError):
            bad.full_clean()

    def test_notes_optional_and_decimal_amount(self):
        t = Transaction.objects.create(
            user=self.user,
            card_actually_used=self.card,
            merchant="Amazon",
            amount=Decimal("19.99"),
            category="OTHER",
            notes=None,  # optional
        )
        self.assertIsNone(t.notes)
        # decimal field retains exact value with 2 places
        self.assertEqual(t.amount, Decimal("19.99"))

    def test_timestamps_auto_set(self):
        t = Transaction.objects.create(
            user=self.user,
            card_actually_used=self.card,
            merchant="Shell",
            amount=Decimal("35.00"),
            category="GAS",
        )
        self.assertIsNotNone(t.created_at)
        self.assertIsNotNone(t.updated_at)
        # updated_at should change after save
        before = t.updated_at
        t.notes = "filled up"
        t.save()
        self.assertGreaterEqual(t.updated_at, before)

    def test_reverse_relations_exist(self):
        t = Transaction.objects.create(
            user=self.user,
            card_actually_used=self.card,
            merchant="Trader Joe's",
            amount=Decimal("12.34"),
            category="GROCERIES",
        )
        # user.transactions and card.used_transactions backrefs
        self.assertIn(t, self.user.transactions.all())
        self.assertIn(t, self.card.used_transactions.all())

    def test_str_format(self):
        t = Transaction.objects.create(
            user=self.user,
            card_actually_used=self.card,
            merchant="Chipotle",
            amount=Decimal("8.50"),
            category="DINING",
        )
        s = str(t)
        self.assertIn("Chipotle - $8.50", s)
        self.assertIn("(u1)", s)

    def test_cascade_on_user_delete_and_card_set_null(self):
        tx = Transaction.objects.create(
            user=self.user,
            card_actually_used=self.card,
            merchant="7-Eleven",
            amount=Decimal("3.00"),
            category="OTHER",
        )
        # delete user cascades (transactions deleted)
        self.user.delete()
        self.assertEqual(Transaction.objects.count(), 0)

        # re-create to test card cascade
        self.user = User.objects.create_user(username="u2", email="u2@example.com", password="pw")
        self.card = Card.objects.create(name="Custom Cash", issuer="CITI", annual_fee=0, ftf=True)
        tx = Transaction.objects.create(
            user=self.user,
            card_actually_used=self.card,
            merchant="Target",
            amount=Decimal("22.00"),
            category="OTHER",
        )
        # Card deletion uses SET_NULL, so transaction remains but card_actually_used becomes None
        self.card.delete()
        tx.refresh_from_db()
        self.assertIsNone(tx.card_actually_used)
        self.assertEqual(Transaction.objects.count(), 1)  # Transaction still exists

# To run the tests:
# python manage.py test transactions.tests.test_models