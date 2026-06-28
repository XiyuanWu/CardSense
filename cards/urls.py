from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import CardViewSet, RewardRuleViewSet, UserCardViewSet, CardBenefitViewSet

router = DefaultRouter()
router.register(r"cards", CardViewSet, basename="cards")
router.register(r"reward-rules", RewardRuleViewSet, basename="reward-rules")
router.register(r"user-cards", UserCardViewSet, basename="user-cards")
router.register(r"card-benefits", CardBenefitViewSet, basename="card-benefits")

urlpatterns = [
    path("", include(router.urls)),
    path("health/", views.HealthCheckView.as_view(), name="health"),
    path("rewards/", views.CardRewardsView.as_view(), name="card-rewards"),
]