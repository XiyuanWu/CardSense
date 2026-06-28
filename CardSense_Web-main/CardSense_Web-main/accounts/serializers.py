from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    # Optional: accept confirmPassword if provided, but not required
    confirmPassword = serializers.CharField(write_only=True, min_length=8, source='password_confirm', required=False)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'confirmPassword', 'first_name', 'last_name']
    
    def validate(self, data):
        # If confirm provided, ensure it matches password
        password = data.get('password')
        password_confirm = data.pop('password_confirm', None)
        if password_confirm is not None and password != password_confirm:
            raise serializers.ValidationError({"confirmPassword": "Passwords don't match"})
        
        # Check if email already exists
        email = data.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists"})
        
        return data
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data['email']
        
        # Generate username from email
        username = email.split('@')[0]
        # Ensure username is unique
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        validated_data['username'] = username
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ProfileSerializer(serializers.Serializer):
    timezone = serializers.CharField(required=False, allow_blank=True)
    currency = serializers.CharField(required=False, allow_blank=True, default='USD')
    notification_prefs = serializers.JSONField(required=False, default=dict)


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField(min_length=8)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data

