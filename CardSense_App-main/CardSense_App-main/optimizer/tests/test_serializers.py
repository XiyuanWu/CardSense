from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError as DRFValidationError
from optimizer.models import UserCategorySelection
from optimizer.serializers import UserCategorySelectionSerializer

'''
Expectations
------------
UserCategorySelectionSerializer
- Automatically assigns 'user' from request context (CurrentUserDefault).
- Requires a valid 'category_tag' (must be one of RewardRule.CATEGORY_CHOICES).
- Enforces uniqueness of (user, category_tag); duplicate entries return a clear error.
- Returns serialized fields: id, user, category_tag.
'''


User = get_user_model()

class TestUserCategorySelectionSerializer(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u1", email="u1@example.com", password="pw")

    def _make_context(self):
        # Create a mock request object with user
        class MockRequest:
            def __init__(self, user):
                self.user = user
        return {"request": MockRequest(self.user)}

    def test_sets_user_from_context(self):
        ser = UserCategorySelectionSerializer(data={"category_tag": "DINING"}, context=self._make_context())
        self.assertTrue(ser.is_valid(), ser.errors)
        instance = ser.save()
        self.assertEqual(instance.user, self.user)
        self.assertEqual(instance.category_tag, "DINING")

    def test_duplicate_pair_rejected(self):
        UserCategorySelection.objects.create(user=self.user, category_tag="GAS")
        ser = UserCategorySelectionSerializer(data={"category_tag": "GAS"}, context=self._make_context())
        self.assertFalse(ser.is_valid())
        msg = str(ser.errors).lower()
        self.assertIn("already selected this category", msg)

    def test_invalid_category_rejected(self):
        ser = UserCategorySelectionSerializer(data={"category_tag": "INVALID"}, context=self._make_context())
        # .is_valid() will fail because model full_clean() fails category choices
        with self.assertRaises(DRFValidationError):
            if ser.is_valid(raise_exception=True):
                ser.save()

# To run the tests:
# python manage.py test optimizer.tests.test_serializers
