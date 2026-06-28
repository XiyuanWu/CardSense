from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from .models import UserCategorySelection

class UserCategorySelectionSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = UserCategorySelection
        fields = ("id", "user", "category_tag")
        validators = [
            UniqueTogetherValidator(
                queryset=UserCategorySelection.objects.all(),
                fields=("user", "category_tag"),
                message="You have already selected this category.",
            )
        ]
