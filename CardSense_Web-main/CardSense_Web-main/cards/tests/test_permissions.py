from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from cards.models import Card

'''
Expectations
- Read: any authenticated user (regular user or developer) can GET cards and reward rules.
- Write: developers only (e.g., staff flag) can POST/PATCH/DELETE.
- Anonymous: cannot read or write.
'''

User = get_user_model()

class TestCardPermissions(APITestCase):
    def setUp(self):
        self.client = APIClient()
        # seed
        self.card = Card.objects.create(name="Freedom", issuer="CHASE", annual_fee=0, ftf=True)
        # users
        self.user = User.objects.create_user(username="user", email="user@example.com", password="pw")
        self.dev  = User.objects.create_user(username="dev", email="dev@example.com",  password="pw", is_staff=True)

    def test_anonymous_cannot_read(self):
        r = self.client.get("/api/cards/cards/")
        self.assertIn(r.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_user_can_read_list_and_detail(self):
        self.client.force_authenticate(self.user)
        r1 = self.client.get("/api/cards/cards/")
        r2 = self.client.get(f"/api/cards/cards/{self.card.id}/")
        self.assertEqual(r1.status_code, status.HTTP_200_OK)
        self.assertEqual(r2.status_code, status.HTTP_200_OK)

    def test_user_cannot_write(self):
        self.client.force_authenticate(self.user)
        r = self.client.post("/api/cards/cards/", {"name":"X","issuer":"CITI","annual_fee":0,"ftf":True}, format="json")
        self.assertEqual(r.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_developer_cannot_write(self):
        self.client.force_authenticate(self.dev)
        r = self.client.post("/api/cards/cards/", {"name":"X","issuer":"CITI","annual_fee":0,"ftf":True}, format="json")
        self.assertEqual(r.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

class TestRewardRulePermissions(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="u", email="u@e.com", password="pw")
        self.dev  = User.objects.create_user(username="d", email="d@e.com", password="pw", is_staff=True)

    def test_user_can_read_rules_list(self):
        self.client.force_authenticate(self.user)
        r = self.client.get("/api/cards/reward-rules/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_user_cannot_create_rule(self):
        self.client.force_authenticate(self.user)
        r = self.client.post("/api/cards/reward-rules/", {"card": 999, "multiplier": "3.0", "category": ["DINING"]}, format="json")
        self.assertEqual(r.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

# To run the tests:
# python manage.py test cards.tests.test_permissions