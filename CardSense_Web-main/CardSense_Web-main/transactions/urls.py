from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet

router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transactions')

urlpatterns = [
    path('', include(router.urls)),
    path('health/', views.HealthCheckView.as_view(), name='health'),
    path('import-csv/', views.TransactionCSVImportView.as_view(), name='csv-import'),
    path('recommend-card/', views.CardRecommendationView.as_view(), name='recommend-card'),
    path('optimization-stats/', views.OptimizationStatsView.as_view(), name='optimization-stats'),
]