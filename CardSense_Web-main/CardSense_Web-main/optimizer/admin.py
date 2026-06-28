from django.contrib import admin
from .models import UserCategorySelection

# Register your models here.
@admin.register(UserCategorySelection)
class UserCategorySelectionAdmin(admin.ModelAdmin):
    list_display = ("user", "category_tag")
    fields = ("user", "category_tag")
    ordering = ["user", "category_tag"]

