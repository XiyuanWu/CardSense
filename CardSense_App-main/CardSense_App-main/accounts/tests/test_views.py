from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIRequestFactory, force_authenticate
from rest_framework import status
from accounts.views import (
    HealthCheckView,
    GetCSRFToken,
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    ProfileView,
    PasswordResetView,
    PasswordResetConfirmView,
)
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

'''
Expectations
------------
HealthCheckView
- GET always returns OK.
- No authentication required.

GetCSRFToken
- GET sets CSRF cookie and returns success.
- No authentication required.

RegisterView
- POST creates a new user with email, password, first_name, last_name.
- Validates email is unique, else return 400.
- Validates passwords match if confirmPassword provided.
- logs in user after registration.
- Returns 201 CREATED with user data when successful.
- Returns 400 with validation errors when it fails.

LoginView
- POST authenticates user with email and password.
- Returns 200 OK with user data on success.
- Returns 401 UNAUTHORIZED with error message on failure.
- Requires both email and password fields.

LogoutView
- POST logs out the current user.
- Returns 200 OK when successful.
- No authentication required (can logout even if not authenticated).

MeView
- GET returns the currently authenticated user data.
- Requires authentication (401/403 for anonymous users).
- Returns user fields, id, username, email, first_name, last_name, date_joined.

ProfileView
- GET returns profile data, user info, timezone, currency, notification_prefs.
- PATCH updates user fields (first_name, last_name, etc.).
- Requires authentication for both GET and PATCH.
- Returns 200 OK when successful.

PasswordResetView
- POST accepts email and generates password reset token.
- Returns 200 OK when successful.
- In development, returns reset_link.
- No authentication required.

PasswordResetConfirmView
- POST accepts uid, token, new_password, new_password_confirm.
- Validates token and uid.
- Sets new password if valid.
- Returns 200 OK when successful, 400 BAD REQUEST when it fails.
- No authentication required.
'''

User = get_user_model()


class TestHealthCheck(APITestCase):
    def test_health_ok(self):
        """Test health endpoint returns 200 OK."""
        response = self.client.get("/api/accounts/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"status": "ok"})


class TestGetCSRFToken(APITestCase):
    def test_csrf_token_endpoint(self):
        """Test CSRF token endpoint sets cookie and returns success."""
        response = self.client.get("/api/auth/csrf/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["success"], True)
        self.assertEqual(response.data["message"], "CSRF cookie set")


class TestRegisterView(APITestCase):
    def test_register_creates_user_and_logs_in(self):
        """Test successful user registration creates user and logs in."""
        payload = {
            "email": "newuser@example.com",
            "password": "securepass123",
            "first_name": "John",
            "last_name": "Doe"
        }
        response = self.client.post("/api/auth/register/", payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["user"]["email"], "newuser@example.com")
        
        # Verify user was created
        user = User.objects.get(email="newuser@example.com")
        self.assertEqual(user.first_name, "John")
        self.assertEqual(user.last_name, "Doe")

    def test_register_duplicate_email_rejected(self):
        """Test registration with existing email returns 400."""
        User.objects.create_user(
            username="existing",
            email="existing@example.com",
            password="pass123456"
        )
        payload = {
            "email": "existing@example.com",
            "password": "newpass123"
        }
        response = self.client.post("/api/auth/register/", payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertIn("email", response.data["error"]["details"])

    def test_register_password_mismatch_rejected(self):
        """Test registration with mismatched passwords returns 400."""
        payload = {
            "email": "test@example.com",
            "password": "validpass123",
            "confirmPassword": "different123"
        }
        response = self.client.post("/api/auth/register/", payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("confirmPassword", response.data["error"]["details"])


class TestLoginView(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123"
        )

    def test_login_success_with_email(self):
        """Test successful login with email and password."""
        payload = {
            "email": "test@example.com",
            "password": "testpass123"
        }
        response = self.client.post("/api/auth/login/", payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["data"]["user"]["email"], "test@example.com")

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401."""
        payload = {
            "email": "test@example.com",
            "password": "wrongpassword"
        }
        response = self.client.post("/api/auth/login/", payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["error"]["code"], "AUTHENTICATION_FAILED")

    def test_login_missing_fields(self):
        """Test login without email or password returns 400."""
        payload = {"email": "test@example.com"}  # missing password
        response = self.client.post("/api/auth/login/", payload, format="json")
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"]["code"], "VALIDATION_ERROR")


class TestLogoutView(APITestCase):
    def test_logout_success(self):
        """Test logout endpoint returns success."""
        response = self.client.post("/api/auth/logout/")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["message"], "Logout successful")


class TestMeView(APITestCase):
    def setUp(self):
        self.rf = APIRequestFactory()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User"
        )

    def test_me_requires_authentication(self):
        """Test /me/ endpoint requires authentication."""
        view = MeView.as_view()
        request = self.rf.get("/api/auth/me/")
        response = view(request)
        
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_me_returns_current_user(self):
        """Test /me/ returns authenticated user's data."""
        view = MeView.as_view()
        request = self.rf.get("/api/auth/me/")
        force_authenticate(request, user=self.user)
        response = view(request)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "test@example.com")
        self.assertEqual(response.data["username"], "testuser")
        self.assertEqual(response.data["first_name"], "Test")
        self.assertIn("id", response.data)
        self.assertIn("date_joined", response.data)


class TestProfileView(APITestCase):
    def setUp(self):
        self.rf = APIRequestFactory()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            first_name="Old",
            last_name="Name"
        )

    def test_profile_get_requires_auth(self):
        """Test GET /profile/ requires authentication."""
        view = ProfileView.as_view()
        request = self.rf.get("/api/auth/profile/")
        response = view(request)
        
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_profile_get_returns_profile_data(self):
        """Test GET /profile/ returns profile data."""
        view = ProfileView.as_view()
        request = self.rf.get("/api/auth/profile/")
        force_authenticate(request, user=self.user)
        response = view(request)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("user", response.data)
        self.assertIn("timezone", response.data)
        self.assertIn("currency", response.data)
        self.assertEqual(response.data["user"]["email"], "test@example.com")

    def test_profile_patch_updates_user(self):
        """Test PATCH /profile/ updates user fields."""
        view = ProfileView.as_view()
        payload = {
            "first_name": "New",
            "last_name": "Name"
        }
        request = self.rf.patch("/api/auth/profile/", payload, format="json")
        force_authenticate(request, user=self.user)
        response = view(request)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "New")
        self.assertEqual(self.user.last_name, "Name")


class TestPasswordResetView(APITestCase):
    def setUp(self):
        self.rf = APIRequestFactory()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="oldpass123"
        )

    def test_password_reset_returns_success(self):
        """Test password reset request returns success message."""
        view = PasswordResetView.as_view()
        payload = {"email": "test@example.com"}
        request = self.rf.post("/api/auth/password/reset/", payload, format="json")
        response = view(request)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)
        # In development, should include reset_link
        self.assertIn("reset_link", response.data)

    def test_password_reset_nonexistent_email(self):
        """Test password reset with nonexistent email still returns success (security)."""
        view = PasswordResetView.as_view()
        payload = {"email": "nonexistent@example.com"}
        request = self.rf.post("/api/auth/password/reset/", payload, format="json")
        response = view(request)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should not reveal if email exists


class TestPasswordResetConfirmView(APITestCase):
    def setUp(self):
        self.rf = APIRequestFactory()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="oldpass123"
        )
        self.token = default_token_generator.make_token(self.user)
        self.uid = urlsafe_base64_encode(force_bytes(self.user.pk))

    def test_password_reset_confirm_success(self):
        """Test successful password reset with valid token."""
        view = PasswordResetConfirmView.as_view()
        payload = {
            "uid": self.uid,
            "token": self.token,
            "new_password": "newpass123",
            "new_password_confirm": "newpass123"
        }
        request = self.rf.post("/api/auth/password/reset/confirm/", payload, format="json")
        response = view(request)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newpass123"))

    def test_password_reset_confirm_invalid_token(self):
        """Test password reset with invalid token returns 400."""
        view = PasswordResetConfirmView.as_view()
        payload = {
            "uid": self.uid,
            "token": "invalid_token",
            "new_password": "newpass123",
            "new_password_confirm": "newpass123"
        }
        request = self.rf.post("/api/auth/password/reset/confirm/", payload, format="json")
        response = view(request)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_password_reset_confirm_mismatched_passwords(self):
        """Test password reset with mismatched passwords returns 400."""
        view = PasswordResetConfirmView.as_view()
        payload = {
            "uid": self.uid,
            "token": self.token,
            "new_password": "newpass123",
            "new_password_confirm": "different123"
        }
        request = self.rf.post("/api/auth/password/reset/confirm/", payload, format="json")
        response = view(request)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


#to run  tests:
# python manage.py test accounts.tests.test_views

