from django.shortcuts import render
# from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    ProfileSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer
)

# Create your views here.
# def HomePage(request):
#     return HttpResponse("Welcome to the Home Page!")

# Check API health
class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)


# Get CSRF Token
@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFToken(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        # This endpoint simply returns success and sets the CSRF cookie
        # The actual token is sent as a cookie automatically by Django
        return Response({
            "success": True,
            "message": "CSRF cookie set"
        }, status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # log them in automatically after registration
            login(request, user)
            return Response({
                "success": True,
                "data": {
                    "user": UserSerializer(user).data
                },
                "message": "User created successfully"
            }, status=status.HTTP_201_CREATED)
        return Response({
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Registration failed",
                "details": serializer.errors
            }
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Email and password are required"
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Try to find user by email and use username for authentication
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None
        
        if user is not None:
            login(request, user)
            return Response({
                "success": True,
                "data": {
                    "user": UserSerializer(user).data
                },
                "message": "Login successful"
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "success": False,
                "error": {
                    "code": "AUTHENTICATION_FAILED",
                    "message": "Invalid email or password"
                }
            }, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [AllowAny]  # Allow logout even if not authenticated
    
    def post(self, request):
        logout(request)
        return Response({
            "success": True,
            "message": "Logout successful"
        }, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # for now, just return basic user info
        # in the future, we can add a Profile model to store timezone, currency, etc.
        profile_data = {
            "user": UserSerializer(request.user).data,
            "timezone": "UTC",  # default
            "currency": "USD",  # default
            "notification_prefs": {}
        }
        return Response(profile_data, status=status.HTTP_200_OK)
    
    def patch(self, request):
        # for now, only allow updating user fields
        # in the future, we can add Profile model for timezone, currency, etc.
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Profile updated successfully",
                "user": serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # don't reveal if email exists or not for security
            return Response({
                "message": "If that email exists, a password reset link has been sent."
            }, status=status.HTTP_200_OK)
        
        # generate token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # in production, send email here
        # for now, just return the token (for development/testing)
        reset_link = f"http://localhost:3000/reset-password?uid={uid}&token={token}"
        
        # TODO: uncomment this in production when email is configured
        # send_mail(
        #     'Password Reset Request',
        #     f'Click here to reset your password: {reset_link}',
        #     settings.DEFAULT_FROM_EMAIL,
        #     [email],
        #     fail_silently=False,
        # )
        
        return Response({
            "message": "If that email exists, a password reset link has been sent.",
            # remove this in production
            "reset_link": reset_link
        }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        token = serializer.validated_data['token']
        uid = request.data.get('uid')  # get uid from request
        
        if not uid:
            return Response({
                "error": "UID is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                "error": "Invalid reset link"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # verify token
        if not default_token_generator.check_token(user, token):
            return Response({
                "error": "Invalid or expired reset token"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # set new password
        new_password = serializer.validated_data['new_password']
        user.set_password(new_password)
        user.save()
        
        return Response({
            "message": "Password reset successful"
        }, status=status.HTTP_200_OK)