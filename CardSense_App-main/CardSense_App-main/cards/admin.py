from django.contrib import admin
from .models import Card, RewardRule, UserCard, CardBenefit

# Register your models here.
# admin.site.register(Card)
# admin.site.register(RewardRule)
# admin.site.register(UserCard)

@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ("issuer", "name", "annual_fee", "ftf")
    fields = ("name", "issuer", "annual_fee", "ftf")
    ordering = ["issuer", "name"]

@admin.register(RewardRule)
class RewardRuleAdmin(admin.ModelAdmin):
    list_display = ("card", "multiplier", "get_categories", "cap_amount", "notes")
    fields = ("card", "multiplier", "category", "cap_amount", "notes")
    ordering = ["card", "-multiplier"]
    
    # AI generated function
    def get_categories(self, obj):
        """Display categories in a more readable format"""
        if obj.category:
            # Get the choice labels instead of raw values
            choice_dict = dict(RewardRule.CATEGORY_CHOICES)
            
            # MultiSelectField stores as a comma-separated string
            categories = obj.category if isinstance(obj.category, list) else obj.category.split(',')
            # Convert raw values to human-readable labels
            readable_categories = [choice_dict.get(cat.strip(), cat.strip()) for cat in categories]
            return ", ".join(readable_categories)
        return "-"
    get_categories.short_description = "Categories"


@admin.register(UserCard)
class UserCardAdmin(admin.ModelAdmin):
    list_display = ("user", "card", "is_active", "notes")
    fields = ("card", "user", "is_active", "notes")

@admin.register(CardBenefit)
class CardBenefitAdmin(admin.ModelAdmin):
    list_display = ("card", "get_benefits_preview")
    fields = ("card", "benefits")
    ordering = ["card"]
    
    # AI generated function
    def get_benefits_preview(self, obj):
        """Display a preview of the benefits"""
        if obj.benefits:
            # Show first 50 characters of benefits
            preview = obj.benefits[:50]
            if len(obj.benefits) > 50:
                preview += "..."
            return preview
        return "No benefits"
    get_benefits_preview.short_description = "Benefits Preview"