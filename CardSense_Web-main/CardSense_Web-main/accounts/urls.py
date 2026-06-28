from django.urls import path, include
from . import views

urlpatterns = [
    # path('', views.HomePage, name='home'),
    # Add more paths as needed
    path("health/", views.HealthCheckView.as_view(), name="health"),
]