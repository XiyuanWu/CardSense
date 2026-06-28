from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from .models import UserCategorySelection
from .serializers import UserCategorySelectionSerializer
from .services import best_cards_for_category

# Create your views here.
# Check API health
class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)

# AI generated code
class UserCategorySelectionViewSet(viewsets.ModelViewSet):
    queryset = UserCategorySelection.objects.all()
    serializer_class = UserCategorySelectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return UserCategorySelection.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MyOptimizerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tags = (UserCategorySelection.objects
                .filter(user=request.user)
                .values_list("category_tag", flat=True))

        results = []
        for tag in tags:
            results.append({
                "category_tag": tag,
                **best_cards_for_category(tag, request.user)  # ← pass user here
            })
        return Response(results)