# cards/tests/test_views.py
from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from cards.models import Card, RewardRule, UserCard, CardBenefit

'''
Expectations
------------
General
- All endpoints under /api/cards/ require authentication (no anonymous access).
- Health endpoint (/api/cards/health/) always returns 200 OK and {"status": "ok"}.

Cards (CardViewSet)
- Authenticated users can list and retrieve cards.
- Each card object includes expected fields: id, name, issuer, annual_fee, ftf.
- Card detail includes nested reward_rules and benefits.
- API is read-only: POST, PATCH, DELETE are not allowed (405).

RewardRuleViewSet
- Authenticated users can list reward rules.
- Each rule object includes multiplier and category fields.
- Anonymous users cannot access this endpoint.

UserCardViewSet
- Authenticated users can list only their own cards.
- Authenticated users can create (POST) a user card entry; user is set automatically from request.
- Creating the same (user, card) pair twice returns 400 (unique constraint).
- Anonymous users cannot access any UserCard endpoints.

CardBenefitViewSet (optional)
- Authenticated users can list card benefits.
- Anonymous users cannot access this endpoint.
'''

User = get_user_model()

class TestHealthAndCardsRead(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", email="u@e.com", password="pw")
        self.card1 = Card.objects.create(name="Alpha", issuer="CHASE", annual_fee=0, ftf=True)
        self.card2 = Card.objects.create(name="Zeta", issuer="CITI", annual_fee=0, ftf=True)
        RewardRule.objects.create(card=self.card1, multiplier=Decimal("1.50"), category=["OTHER"])
        CardBenefit.objects.create(card=self.card1, benefits="No AF")

    def test_health_ok(self):
        r = self.client.get("/api/cards/health/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data, {"status": "ok"})

    def test_cards_list_requires_auth(self):
        r = self.client.get("/api/cards/cards/")
        self.assertIn(r.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_cards_list_and_retrieve_show_expected_fields(self):
        self.client.force_authenticate(self.user)
        r1 = self.client.get("/api/cards/cards/")
        self.assertEqual(r1.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(r1.data['data']), 2)
        # minimal field checks
        row = r1.data['data'][0]
        for k in ("id", "name", "issuer", "annual_fee", "ftf"):
            self.assertIn(k, row)

        r2 = self.client.get(f"/api/cards/cards/{self.card1.id}/")
        self.assertEqual(r2.status_code, status.HTTP_200_OK)
        # nested read-only pieces present
        self.assertIn("reward_rules", r2.data['data'])
        self.assertIn("benefits", r2.data['data'])

    def test_cards_readonly_methods_blocked(self):
        self.client.force_authenticate(self.user)
        r = self.client.post("/api/cards/cards/", {"name":"X","issuer":"CITI","annual_fee":0,"ftf":True}, format="json")
        self.assertEqual(r.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class TestRewardRulesAndUserCards(APITestCase):
    def setUp(self):
        self.u1 = User.objects.create_user(username="a", email="a@e.com", password="pw")
        self.u2 = User.objects.create_user(username="b", email="b@e.com", password="pw")
        self.card = Card.objects.create(name="Freedom", issuer="CHASE", annual_fee=0, ftf=True)
        RewardRule.objects.create(card=self.card, multiplier=Decimal("3.00"), category=["DINING"])
        UserCard.objects.create(user=self.u2, card=self.card, is_active=True)  # belongs to u2

    def test_reward_rules_list_auth_and_shape(self):
        self.client.force_authenticate(self.u1)
        r = self.client.get("/api/cards/reward-rules/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(r.data['data']), 1)
        self.assertIn("multiplier", r.data['data'][0])
        self.assertIn("category", r.data['data'][0])

    def test_user_cards_lists_only_current_user(self):
        self.client.force_authenticate(self.u1)
        r = self.client.get("/api/cards/user-cards/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['data'], [])  # u1 has none

        # add one for u1; should now appear
        uc = UserCard.objects.create(user=self.u1, card=self.card, is_active=True)
        r2 = self.client.get("/api/cards/user-cards/")
        self.assertEqual(r2.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r2.data['data']), 1)
        self.assertEqual(r2.data['data'][0]["id"], uc.id)

    def test_user_cards_create_uses_request_user(self):
        self.client.force_authenticate(self.u1)
        r = self.client.post("/api/cards/user-cards/", {"card": self.card.id}, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.data['data']["card"], self.card.id)
        # duplicate should fail (unique (user, card))
        r_dup = self.client.post("/api/cards/user-cards/", {"card": self.card.id}, format="json")
        self.assertEqual(r_dup.status_code, status.HTTP_400_BAD_REQUEST)


# To run the tests:
# python manage.py test cards.tests.test_views