from django.db import models
from django.conf import settings
from cards.models import RewardRule

# Create your models here.
# Model to store the user's category selections for the optimizer
class UserCategorySelection(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="optimizer_selections")
    category_tag = models.CharField(max_length=255, choices=RewardRule.CATEGORY_CHOICES)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "category_tag"],
                name="uniq_user_category_selection",
            ),
        ]
        indexes = [
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"{self.user} · {self.category_tag}"