from django.test import TestCase
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from cards.models import Card, CardBenefit, UserCard, RewardRule

User = get_user_model()

'''
Expectations
------------
Card
- Required fields: must have valid name and issuer from ISSUER_CHOICES.
- Defaults: 'ftf' is True unless specified; 'annual_fee' must be non-negative.
- String representation: displays as "ISSUER CardName".
- Relations: connected RewardRule, CardBenefit, and UserCard accessible via reverse lookups.
- Cascade delete: deleting a Card removes its related RewardRule, CardBenefit, and UserCard.

CardBenefit
- Must link to a valid Card.
- 'benefits' text is optional (can be null/blank).
- String representation includes the card name.
- Cascade delete when the Card is deleted.

UserCard
- Unique per (user, card) pair.
- 'is_active' defaults to True.
- String representation shows user → card.
- Deletes automatically when related Card or User is deleted.

RewardRule
- Must link to a valid Card.
- 'category' must contain only valid CATEGORY_CHOICES.
- 'multiplier' and 'cap_amount' stored as Decimal.
- 'cap_amount' and 'notes' optional (nullable/blank).
- Cascade delete when the Card is deleted.
'''

# ---------- Card ----------
class TestCardModel(TestCase):
    def test_required_and_issuer_choices(self):
        # blank name -> validation error on full_clean
        c1 = Card(name="", issuer="CHASE", annual_fee=0)
        with self.assertRaises(ValidationError):
            c1.full_clean()

        # invalid issuer choice -> validation error
        c2 = Card(name="Freedom", issuer="NOT_A_BANK", annual_fee=0)
        with self.assertRaises(ValidationError):
            c2.full_clean()

    def test_defaults_and_str(self):
        c = Card.objects.create(name="Freedom", issuer="CHASE", annual_fee=0)  # no ftf passed
        self.assertTrue(c.ftf)  # default
        self.assertEqual(str(c), "CHASE Freedom")

    def test_relations_reverse_managers_exist(self):
        c = Card.objects.create(name="Custom Cash", issuer="CITI", annual_fee=0)
        RewardRule.objects.create(card=c, multiplier=Decimal("3.00"), category=["DINING"])
        CardBenefit.objects.create(card=c, benefits="No AF")
        self.assertEqual(c.reward_rules.count(), 1)
        self.assertEqual(c.benefits.count(), 1)

    def test_cascade_delete_card_removes_related(self):
        u = User.objects.create_user(username="u", email="u@e.com", password="pw")
        c = Card.objects.create(name="SavorOne", issuer="CAPITALONE", annual_fee=0)
        RewardRule.objects.create(card=c, multiplier=Decimal("3.00"), category=["DINING"])
        CardBenefit.objects.create(card=c, benefits="Some perks")
        UserCard.objects.create(user=u, card=c)

        c.delete()
        self.assertEqual(RewardRule.objects.count(), 0)
        self.assertEqual(CardBenefit.objects.count(), 0)
        self.assertEqual(UserCard.objects.count(), 0)


# ---------- CardBenefit ----------
class TestCardBenefitModel(TestCase):
    def test_str_contains_card_name(self):
        c = Card.objects.create(name="Altitude Go", issuer="USBANK", annual_fee=0)
        b = CardBenefit.objects.create(card=c, benefits=None)
        self.assertTrue(str(b).startswith("Benefits for Altitude Go"))


# ---------- UserCard ----------
class TestUserCardModel(TestCase):
    def test_unique_user_card_pair(self):
        user = User.objects.create_user(username="x", email="x@e.com", password="pw")
        c = Card.objects.create(name="Sapphire Preferred", issuer="CHASE", annual_fee=95)
        UserCard.objects.create(user=user, card=c, is_active=True)
        with self.assertRaises(IntegrityError):
            UserCard.objects.create(user=user, card=c, is_active=True)

    def test_defaults_and_str(self):
        user = User.objects.create_user(username="y", email="y@e.com", password="pw")
        c = Card.objects.create(name="Freedom Unlimited", issuer="CHASE", annual_fee=0)
        uc = UserCard.objects.create(user=user, card=c)  # no is_active passed
        self.assertTrue(uc.is_active)
        self.assertTrue(str(uc).startswith(user.username) or "→" in str(uc))


# ---------- RewardRule ----------
class TestRewardRuleModel(TestCase):
    def test_valid_categories_and_fields(self):
        c = Card.objects.create(name="BOA Customized Cash", issuer="BANK OF AMERICA", annual_fee=0)
        rr = RewardRule.objects.create(
            card=c,
            multiplier=Decimal("3.00"),
            category=["DINING", "GROCERIES"],
            cap_amount=Decimal("2500"),
            notes="Quarterly cap",
        )
        self.assertEqual(set(rr.category), {"DINING", "GROCERIES"})
        self.assertEqual(rr.multiplier, Decimal("3.00"))
        self.assertEqual(rr.cap_amount, Decimal("2500"))

    def test_invalid_category_rejected_by_full_clean(self):
        c = Card.objects.create(name="Prime", issuer="AMEX", annual_fee=0)
        rr = RewardRule(card=c, multiplier=Decimal("2.00"), category=["NOT_A_REAL_TAG"])
        with self.assertRaises(ValidationError):
            rr.full_clean()

# To run the tests:
# python manage.py test cards.tests.test_models
