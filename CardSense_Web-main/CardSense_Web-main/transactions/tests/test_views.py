from decimal import Decimal
from datetime import timedelta
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate
from django.test import TestCase
from django.utils import timezone
from transactions.models import Transaction
from transactions.views import HealthCheckView, TransactionViewSet, TransactionCSVImportView
from cards.models import Card, UserCard
from io import StringIO
from django.core.files.uploadedfile import SimpleUploadedFile

'''
Expectations
------------
HealthCheckView
- GET always returns 200 OK and {"status": "ok"}.
- No authentication required.

TransactionViewSet
- Requires authentication for all actions.
- GET /list returns only transactions belonging to the authenticated user.
- Returned list is ordered by created_at descending.
- POST automatically sets 'user' to request.user (ignores any 'user' in payload).
- Anonymous users get 401/403 for any endpoint.
- PATCH/DELETE limited to the owner's transactions; cannot access others'.

TransactionCSVImportView
- Requires authentication (401/403 for anonymous users).
- POST takes CSV file under 'file' key.
- Validates CSV format and encoding (UTF-8).
- Processes each row with TransactionCSVRowSerializer.
- Card can be specified by ID (must be in user's wallet) or name.
- Date field optional, format: YYYY-MM-DD.
- Returns response with imported_count, failed_count, and results array.
- Each result includes row number, status ("imported" or "error"), and errors if it fails.
- Handles invalid CSV, missing columns, encoding errors properly.
'''


User = get_user_model()

class TestHealthCheck(TestCase):
    def test_health_ok(self):
        rf = APIRequestFactory()
        req = rf.get("/api/transactions/health/")
        resp = HealthCheckView.as_view()(req)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data, {"status": "ok"})


class TestTransactionViewSet(TestCase):
    def setUp(self):
        self.rf = APIRequestFactory()
        self.user1 = User.objects.create_user(username="a", email="a@e.com", password="pw")
        self.user2 = User.objects.create_user(username="b", email="b@e.com", password="pw")
        self.card = Card.objects.create(name="Freedom", issuer="CHASE", annual_fee=0, ftf=True)

    def _create_tx(self, user, amount, merchant, created_at=None):
        """helper to seed transactions with controlled created_at ordering"""
        t = Transaction.objects.create(
            user=user,
            card_actually_used=self.card,
            amount=Decimal(amount),
            merchant=merchant,
            category="DINING",
        )
        if created_at:
            # Update created_at after creation for precise ordering control
            Transaction.objects.filter(id=t.id).update(created_at=created_at)
            t.refresh_from_db()
        return t

    def test_requires_authentication(self):
        view = TransactionViewSet.as_view({"get": "list"})
        req = self.rf.get("/api/transactions/")
        resp = view(req)
        self.assertIn(resp.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_list_returns_only_current_user_sorted(self):
        # Create transactions with explicit timestamps to ensure ordering
        now = timezone.now()
        self._create_tx(self.user1, "5.00", "A", created_at=now)
        self._create_tx(self.user1, "9.00", "B", created_at=now + timedelta(seconds=1))
        self._create_tx(self.user2, "11.00", "C")
        view = TransactionViewSet.as_view({"get": "list"})
        req = self.rf.get("/api/transactions/")
        force_authenticate(req, self.user1)
        resp = view(req)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # Response is wrapped in {'success': True, 'data': [...]}
        merchants = [row["merchant"] for row in resp.data['data']]
        self.assertEqual(merchants, ["B", "A"])  # newest first

    def test_create_auto_assigns_user_and_saves(self):
        view = TransactionViewSet.as_view({"post": "create"})
        payload = {
            "card_actually_used": self.card.id,
            "amount": "15.00",
            "merchant": "Target",
            "category": "GROCERIES",
            "user": self.user2.id,  # should be ignored
        }
        req = self.rf.post("/api/transactions/", payload, format="json")
        force_authenticate(req, self.user1)
        resp = view(req)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        # Response is wrapped in {'success': True, 'data': {...}}
        t = Transaction.objects.get(id=resp.data["data"]["id"])
        self.assertEqual(t.user, self.user1)
        self.assertEqual(t.merchant, "Target")

    def test_user_cannot_access_others_transaction(self):
        # belongs to user2
        t = self._create_tx(self.user2, "8.50", "Chipotle")
        # try retrieving as user1
        view = TransactionViewSet.as_view({"get": "retrieve"})
        req = self.rf.get(f"/api/transactions/{t.id}/")
        force_authenticate(req, self.user1)
        resp = view(req, pk=t.id)
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_own_transaction_allowed(self):
        t = self._create_tx(self.user1, "12.00", "Walmart")
        view = TransactionViewSet.as_view({"delete": "destroy"})
        req = self.rf.delete(f"/api/transactions/{t.id}/")
        force_authenticate(req, self.user1)
        resp = view(req, pk=t.id)
        # View returns 200 with success message, not 204
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertFalse(Transaction.objects.filter(id=t.id).exists())


class TestTransactionCSVImportView(TestCase):
    def setUp(self):
        self.rf = APIRequestFactory()
        self.user = User.objects.create_user(username="csvuser", email="csv@e.com", password="pw")
        self.card = Card.objects.create(name="Freedom", issuer="CHASE", annual_fee=0, ftf=True)
        self.user_card = UserCard.objects.create(user=self.user, card=self.card, is_active=True)

    def _create_csv_file(self, content):
        """Helper to create a CSV file for upload."""
        return SimpleUploadedFile(
            "transactions.csv",
            content.encode('utf-8'),
            content_type="text/csv"
        )

    def test_csv_import_requires_authentication(self):
        """Test CSV import endpoint requires authentication."""
        csv_content = "card,merchant,amount,category\n1,Store A,10.00,GROCERIES\n"
        csv_file = self._create_csv_file(csv_content)
        view = TransactionCSVImportView.as_view()
        req = self.rf.post("/api/transactions/import-csv/", {"file": csv_file}, format="multipart")
        resp = view(req)
        self.assertIn(resp.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_csv_import_valid_file(self):
        """Test successful CSV import with valid data."""
        csv_content = "card,merchant,amount,category\n1,Store A,25.50,GROCERIES\n1,Restaurant B,15.00,DINING\n"
        csv_file = self._create_csv_file(csv_content)
        view = TransactionCSVImportView.as_view()
        req = self.rf.post("/api/transactions/import-csv/", {"file": csv_file}, format="multipart")
        force_authenticate(req, user=self.user)
        resp = view(req)
        
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["data"]["imported_count"], 2)
        self.assertEqual(resp.data["data"]["failed_count"], 0)
        self.assertEqual(len(resp.data["data"]["results"]), 2)
        #Verify transactions created
        self.assertEqual(Transaction.objects.filter(user=self.user).count(), 2)

    def test_csv_import_with_card_name(self):
        """Test CSV import using card name instead of ID."""
        csv_content = "card,merchant,amount,category\nFreedom,Store C,30.00,GROCERIES\n"
        csv_file = self._create_csv_file(csv_content)
        view = TransactionCSVImportView.as_view()
        req = self.rf.post("/api/transactions/import-csv/", {"file": csv_file}, format="multipart")
        force_authenticate(req, user=self.user)
        resp = view(req)
        
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["data"]["imported_count"], 1)
        tx = Transaction.objects.get(user=self.user, merchant="Store C")
        self.assertEqual(tx.card_actually_used, self.card)

    def test_csv_import_with_date(self):
        """Test CSV import with date field."""
        csv_content = "card,merchant,amount,category,date\n1,Store D,20.00,DINING,2024-01-15\n"
        csv_file = self._create_csv_file(csv_content)
        view = TransactionCSVImportView.as_view()
        req = self.rf.post("/api/transactions/import-csv/", {"file": csv_file}, format="multipart")
        force_authenticate(req, user=self.user)
        resp = view(req)
        
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["data"]["imported_count"], 1)
        tx = Transaction.objects.get(user=self.user, merchant="Store D")
        # Verify date was set
        self.assertEqual(tx.created_at.strftime("%Y-%m-%d"), "2024-01-15")

    def test_csv_import_missing_file(self):
        """Test CSV import without file returns 400."""
        view = TransactionCSVImportView.as_view()
        req = self.rf.post("/api/transactions/import-csv/", {}, format="multipart")
        force_authenticate(req, user=self.user)
        resp = view(req)
        
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", resp.data)

    def test_csv_import_invalid_category(self):
        """Test CSV import with invalid category returns error for that row."""
        csv_content = "card,merchant,amount,category\n1,Store E,10.00,INVALID_CATEGORY\n"
        csv_file = self._create_csv_file(csv_content)
        view = TransactionCSVImportView.as_view()
        req = self.rf.post("/api/transactions/import-csv/", {"file": csv_file}, format="multipart")
        force_authenticate(req, user=self.user)
        resp = view(req)
        
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["data"]["imported_count"], 0)
        self.assertEqual(resp.data["data"]["failed_count"], 1)
        self.assertEqual(resp.data["data"]["results"][0]["status"], "error")
        self.assertIn("errors", resp.data["data"]["results"][0])

    def test_csv_import_invalid_amount(self):
        """Test CSV import with invalid amount format returns error."""
        csv_content = "card,merchant,amount,category\n1,Store F,not_a_number,GROCERIES\n"
        csv_file = self._create_csv_file(csv_content)
        view = TransactionCSVImportView.as_view()
        req = self.rf.post("/api/transactions/import-csv/", {"file": csv_file}, format="multipart")
        force_authenticate(req, user=self.user)
        resp = view(req)
        
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["data"]["failed_count"], 1)
        self.assertIn("amount", str(resp.data["data"]["results"][0]["errors"]).lower())

    def test_csv_import_card_not_in_wallet(self):
        """Test CSV import with card not in user's wallet returns error."""
        other_card = Card.objects.create(name="Other Card", issuer="CITI", annual_fee=0)
        csv_content = f"card,merchant,amount,category\n{other_card.id},Store G,10.00,GROCERIES\n"
        csv_file = self._create_csv_file(csv_content)
        view = TransactionCSVImportView.as_view()
        req = self.rf.post("/api/transactions/import-csv/", {"file": csv_file}, format="multipart")
        force_authenticate(req, user=self.user)
        resp = view(req)
        
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["data"]["failed_count"], 1)
        self.assertIn("not found in your wallet", str(resp.data["data"]["results"][0]["errors"]).lower())

    def test_csv_import_mixed_success_and_failure(self):
        """Test CSV import with some valid and some invalid rows."""
        csv_content = "card,merchant,amount,category\n1,Store H,10.00,GROCERIES\n1,Store I,invalid,DINING\n1,Store J,20.00,INVALID\n"
        csv_file = self._create_csv_file(csv_content)
        view = TransactionCSVImportView.as_view()
        req = self.rf.post("/api/transactions/import-csv/", {"file": csv_file}, format="multipart")
        force_authenticate(req, user=self.user)
        resp = view(req)
        
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["data"]["imported_count"], 1)
        self.assertEqual(resp.data["data"]["failed_count"], 2)
        self.assertEqual(len(resp.data["data"]["results"]), 3)
        # Verify only valid transaction created
        self.assertEqual(Transaction.objects.filter(user=self.user).count(), 1)

    def test_csv_import_invalid_date_format(self):
        """Test CSV import with invalid date format returns error."""
        csv_content = "card,merchant,amount,category,date\n1,Store K,10.00,GROCERIES,01-15-2024\n"
        csv_file = self._create_csv_file(csv_content)
        view = TransactionCSVImportView.as_view()
        req = self.rf.post("/api/transactions/import-csv/", {"file": csv_file}, format="multipart")
        force_authenticate(req, user=self.user)
        resp = view(req)
        
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["data"]["failed_count"], 1)
        self.assertIn("date", str(resp.data["data"]["results"][0]["errors"]).lower())

    def test_csv_import_response_format(self):
        """Test CSV import response has correct structure."""
        csv_content = "card,merchant,amount,category\n1,Store L,10.00,GROCERIES\n"
        csv_file = self._create_csv_file(csv_content)
        view = TransactionCSVImportView.as_view()
        req = self.rf.post("/api/transactions/import-csv/", {"file": csv_file}, format="multipart")
        force_authenticate(req, user=self.user)
        resp = view(req)
        
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("data", resp.data)
        data = resp.data["data"]
        self.assertIn("imported_count", data)
        self.assertIn("failed_count", data)
        self.assertIn("results", data)
        self.assertIsInstance(data["results"], list)
        if data["results"]:
            result = data["results"][0]
            self.assertIn("row", result)
            self.assertIn("status", result)
            if result["status"] == "imported":
                self.assertIn("transaction_id", result)
            elif result["status"] == "error":
                self.assertIn("errors", result)

#To run tests:
# python manage.py test transactions