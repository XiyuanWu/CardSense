from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import UserCategorySelectionViewSet, MyOptimizerDashboardView, HealthCheckView

router = DefaultRouter()
router.register(r'user-category-selections', UserCategorySelectionViewSet, basename='user-category-selections')

urlpatterns = [
    path('', include(router.urls)),
    path('health/', HealthCheckView.as_view(), name='health'),
    path('my-optimizer-dashboard/', MyOptimizerDashboardView.as_view(), name='my-optimizer-dashboard'),
]