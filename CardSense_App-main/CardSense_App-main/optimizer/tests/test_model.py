from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from optimizer.models import UserCategorySelection


'''
Expectations
------------
UserCategorySelection
- Must link to a valid User (FK, on_delete=CASCADE).
- category_tag must be one of RewardRule.CATEGORY_CHOICES.
- Unique per (user, category_tag); second insert with same pair fails.
- __str__ shows "<user> · <category_tag>".
- Deleting the user cascades and removes the selection.
'''

User = get_user_model()

class TestUserCategorySelectionModel(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u1", email="u1@example.com", password="pw")

    def test_requires_valid_user_and_valid_choice(self):
        # valid category from RewardRule.CATEGORY_CHOICES (e.g., "DINING")
        sel = UserCategorySelection(user=self.user, category_tag="DINING")
        # full_clean() will enforce choices before save
        sel.full_clean()
        sel.save()
        self.assertEqual(UserCategorySelection.objects.count(), 1)

        # invalid category should raise ValidationError on full_clean
        bad = UserCategorySelection(user=self.user, category_tag="NOT_A_REAL_TAG")
        with self.assertRaises(ValidationError):
            bad.full_clean()

    def test_unique_per_user_and_category(self):
        UserCategorySelection.objects.create(user=self.user, category_tag="GROCERIES")
        with self.assertRaises(IntegrityError):
            # second identical pair violates the UniqueConstraint(user, category_tag)
            UserCategorySelection.objects.create(user=self.user, category_tag="GROCERIES")

    def test_str_format(self):
        sel = UserCategorySelection.objects.create(user=self.user, category_tag="GAS")
        s = str(sel)
        # e.g., "u1 · GAS" (username or stringified user)
        self.assertIn("u1", s)
        self.assertIn("GAS", s)
        self.assertIn("·", s)  # Check for the separator character

    def test_cascade_on_user_delete(self):
        UserCategorySelection.objects.create(user=self.user, category_tag="DINING")
        self.user.delete()
        self.assertEqual(UserCategorySelection.objects.count(), 0)

# To run the tests:
# python manage.py test optimizer.tests.test_model