from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.exceptions import ValidationError as DRFValidationError
from accounts.serializers import (
    RegisterSerializer,
    UserSerializer,
    PasswordResetConfirmSerializer,
)

'''
Expectations
------------
RegisterSerializer
- Validates that email is unique, if it's not then reaise validation error.
- Validates that passwords match if confirmPassword provided.
- Creates username from email, from what is before the @ symbol.
- Ensures username is unique, might add numbers if it's not.
- Creates user with set_password by hashing.
- Required fields are email, password.
- Optional fields are confirmPassword, first_name, last_name.

UserSerializer
- Serializes user fields are id, username, email, first_name, last_name, date_joined.
- Read fields are id, date_joined.
- Used for serializing user data in responses.

PasswordResetConfirmSerializer
- Validates that passwords match.
- Requires both fields, min_length=8.
- ValidationError if passwords don't match.
'''

User = get_user_model()


class TestRegisterSerializer(TestCase):
    def test_valid_registration_creates_user(self):
        """Test valid registration data creates user with generated username."""
        data = {
            "email": "newuser@example.com",
            "password": "securepass123",
            "first_name": "John",
            "last_name": "Doe"
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        
        self.assertEqual(user.email, "newuser@example.com")
        self.assertEqual(user.first_name, "John")
        self.assertEqual(user.last_name, "Doe")
        self.assertEqual(user.username, "newuser")
        self.assertTrue(user.check_password("securepass123"))

    def test_duplicate_email_rejected(self):
        """Test registration with existing email raises ValidationError."""
        User.objects.create_user(
            username="existing",
            email="existing@example.com",
            password="pass123"
        )
        data = {
            "email": "existing@example.com",
            "password": "newpass123"
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    def test_password_mismatch_rejected(self):
        """Test registration with mismatched passwords raises ValidationError."""
        data = {
            "email": "test@example.com",
            "password": "validpass123",
            "confirmPassword": "different123"
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("confirmPassword", serializer.errors)

    def test_username_generation_from_email(self):
        """Test username is generated from email prefix."""
        data = {
            "email": "jane.doe@example.com",
            "password": "validpass123"
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        
        self.assertEqual(user.username, "jane.doe")

    def test_username_uniqueness_enforced(self):
        """Test username uniqueness by appending numbers if needed."""
        User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="validpass123"
        )
        data = {
            "email": "testuser@different.com",
            "password": "validpass123"
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        
        # Should append number to make unique
        self.assertTrue(user.username.startswith("testuser"))
        self.assertNotEqual(user.username, "testuser")


class TestUserSerializer(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="pass123",
            first_name="Test",
            last_name="User"
        )

    def test_serializes_user_fields(self):
        """Test UserSerializer includes all expected fields."""
        serializer = UserSerializer(self.user)
        data = serializer.data
        
        self.assertIn("id", data)
        self.assertIn("username", data)
        self.assertIn("email", data)
        self.assertIn("first_name", data)
        self.assertIn("last_name", data)
        self.assertIn("date_joined", data)
        self.assertEqual(data["email"], "test@example.com")
        self.assertEqual(data["username"], "testuser")

    def test_readonly_fields_not_writable(self):
        """Test readonly fields (id, date_joined) cannot be updated."""
        serializer = UserSerializer(
            self.user,
            data={"id": 999, "date_joined": "2020-01-01"},
            partial=True
        )
        # Readonly fields ignored
        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()
        # make sure readonly fields are not changed
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.id, 999)

    def test_partial_update_allowed(self):
        """Test partial update of user fields."""
        serializer = UserSerializer(
            self.user,
            data={"first_name": "Updated"},
            partial=True
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Updated")


class TestPasswordResetConfirmSerializer(TestCase):
    def test_matching_passwords_valid(self):
        """Test serializer validates when passwords match."""
        data = {
            "token": "some_token",
            "new_password": "newpass123",
            "new_password_confirm": "newpass123"
        }
        serializer = PasswordResetConfirmSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_mismatched_passwords_rejected(self):
        """Test serializer rejects mismatched passwords."""
        data = {
            "token": "some_token",
            "new_password": "newpass123",
            "new_password_confirm": "different123"
        }
        serializer = PasswordResetConfirmSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)

    def test_password_min_length_enforced(self):
        """Test serializer enforces minimum password length."""
        data = {
            "token": "some_token",
            "new_password": "short",
            "new_password_confirm": "short"
        }
        serializer = PasswordResetConfirmSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("new_password", serializer.errors)

    def test_required_fields(self):
        """Test all fields are required."""
        data = {
            "token": "some_token",
            "new_password": "newpass123"
        }
        serializer = PasswordResetConfirmSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("new_password_confirm", serializer.errors)


#To run tests:
# python manage.py test accounts.tests.test_serializers

