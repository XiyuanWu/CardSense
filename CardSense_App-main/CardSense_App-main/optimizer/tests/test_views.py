from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate
from unittest.mock import patch

from optimizer.models import UserCategorySelection
from optimizer.views import (
    HealthCheckView,
    UserCategorySelectionViewSet,
    MyOptimizerDashboardView,
)

'''
Expectations
------------
HealthCheckView
- GET always returns 200 and {"status": "ok"} without auth.

UserCategorySelectionViewSet
- Requires authentication for all actions.
- GET /list returns only the current user’s selections.
- POST auto-assigns request.user (ignores any user in payload).
- Duplicate (user, category_tag) is rejected with a 400.
- Standard retrieve/update/delete work only on the user’s own rows.

MyOptimizerDashboardView
- Requires authentication.
- GET returns a list where each item corresponds to a saved category_tag for the user.
- For each tag, calls best_cards_for_category(tag, user) and merges its dict into the item.
'''



User = get_user_model()

class TestHealthCheck(TestCase):
    def test_health_ok(self):
        rf = APIRequestFactory()
        req = rf.get("/optimizer/health/")
        resp = HealthCheckView.as_view()(req)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data, {"status": "ok"})


class TestUserCategorySelectionViewSet(TestCase):
    def setUp(self):
        self.rf = APIRequestFactory()
        self.user = User.objects.create_user(username="u1", email="u1@e.com", password="pw")
        self.other = User.objects.create_user(username="u2", email="u2@e.com", password="pw")
        # seed: other user has one selection
        UserCategorySelection.objects.create(user=self.other, category_tag="DINING")

    def test_requires_auth(self):
        view = UserCategorySelectionViewSet.as_view({"get": "list"})
        req = self.rf.get("/optimizer/selections/")
        resp = view(req)
        self.assertIn(resp.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_list_filters_to_request_user(self):
        # add one for self.user
        UserCategorySelection.objects.create(user=self.user, category_tag="GAS")
        view = UserCategorySelectionViewSet.as_view({"get": "list"})
        req = self.rf.get("/optimizer/selections/")
        force_authenticate(req, self.user)
        resp = view(req)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["category_tag"], "GAS")

    def test_create_sets_user_ignoring_payload_user(self):
        view = UserCategorySelectionViewSet.as_view({"post": "create"})
        req = self.rf.post("/optimizer/selections/", {"category_tag": "GROCERIES", "user": self.other.id}, format="json")
        force_authenticate(req, self.user)
        resp = view(req)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        obj = UserCategorySelection.objects.get(id=resp.data["id"])
        self.assertEqual(obj.user, self.user)
        self.assertEqual(obj.category_tag, "GROCERIES")

    def test_duplicate_pair_rejected(self):
        UserCategorySelection.objects.create(user=self.user, category_tag="DINING")
        view = UserCategorySelectionViewSet.as_view({"post": "create"})
        req = self.rf.post("/optimizer/selections/", {"category_tag": "DINING"}, format="json")
        force_authenticate(req, self.user)
        resp = view(req)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("already selected this category", str(resp.data).lower())

    def test_retrieve_update_delete_only_own_rows(self):
        mine = UserCategorySelection.objects.create(user=self.user, category_tag="GAS")

        # retrieve mine
        view_r = UserCategorySelectionViewSet.as_view({"get": "retrieve"})
        req_r = self.rf.get(f"/optimizer/selections/{mine.id}/")
        force_authenticate(req_r, self.user)
        self.assertEqual(view_r(req_r, pk=mine.id).status_code, status.HTTP_200_OK)

        # retrieve other's should 404 due to get_queryset scoping
        view_r_other = UserCategorySelectionViewSet.as_view({"get": "retrieve"})
        req_r_other = self.rf.get(f"/optimizer/selections/999/")
        force_authenticate(req_r_other, self.user)
        # use a real pk but owned by other
        other_row = UserCategorySelection.objects.get(user=self.other, category_tag="DINING")
        self.assertEqual(view_r_other(req_r_other, pk=other_row.id).status_code, status.HTTP_404_NOT_FOUND)

        # update mine
        view_u = UserCategorySelectionViewSet.as_view({"patch": "partial_update"})
        req_u = self.rf.patch(f"/optimizer/selections/{mine.id}/", {"category_tag": "OTHER"}, format="json")
        force_authenticate(req_u, self.user)
        self.assertEqual(view_u(req_u, pk=mine.id).status_code, status.HTTP_200_OK)

        # delete mine
        view_d = UserCategorySelectionViewSet.as_view({"delete": "destroy"})
        req_d = self.rf.delete(f"/optimizer/selections/{mine.id}/")
        force_authenticate(req_d, self.user)
        self.assertEqual(view_d(req_d, pk=mine.id).status_code, status.HTTP_204_NO_CONTENT)


class TestMyOptimizerDashboardView(TestCase):
    def setUp(self):
        self.rf = APIRequestFactory()
        self.user = User.objects.create_user(username="u1", email="u1@e.com", password="pw")
        UserCategorySelection.objects.create(user=self.user, category_tag="DINING")
        UserCategorySelection.objects.create(user=self.user, category_tag="GAS")

    @patch("optimizer.views.best_cards_for_category")
    def test_dashboard_calls_service_per_tag_and_merges(self, mock_best):
        mock_best.side_effect = [
            {"best_card": "CardA", "multiplier": 4, "top3": ["A","B","C"]},
            {"best_card": "CardB", "multiplier": 3, "top3": ["B","A","C"]},
        ]
        view = MyOptimizerDashboardView.as_view()
        req = self.rf.get("/optimizer/my-dashboard/")
        from rest_framework.test import force_authenticate
        force_authenticate(req, self.user)
        resp = view(req)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        body = resp.data
        # two rows (DINING, GAS), each merges service output
        self.assertEqual(len(body), 2)
        tags = {row["category_tag"] for row in body}
        self.assertEqual(tags, {"DINING", "GAS"})
        for row in body:
            self.assertIn("best_card", row)
            self.assertIn("multiplier", row)
            self.assertIn("top3", row)
        # ensure service called with (tag, user)
        calls = [call.args for call in mock_best.call_args_list]
        called_tags = {args[0] for args in calls}
        self.assertEqual(called_tags, {"DINING", "GAS"})
        self.assertTrue(all(args[1] == self.user for args in calls))

# To run the tests:
# python manage.py test optimizer.tests.test_views