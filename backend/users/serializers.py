from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers
from .models import UserProfile

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD  # keep compatibility

    def validate(self, attrs):
        identifier = attrs.get("username")
        password = attrs.get("password")

        user = None
        if identifier and "@" in identifier:
            try:
                user_obj = User.objects.get(email=identifier)
                user = authenticate(
                    username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        else:
            user = authenticate(username=identifier, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        refresh = self.get_token(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),  # type: ignore[attr-defined]
            "user": {
                "id": user.id,  # type: ignore[attr-defined]
                "username": user.username,
                "email": user.email,
            },
        }


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "field_of_study",
            "target_role",
            "experience_level",
            "skills",
            "career_intent",
            "bio",
            "avatar",
            "onboarding_complete",
            "xp_points",
            "streak_count"
        ]
        read_only_fields = ["onboarding_complete"]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    role = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "created_at",
            "role",
            "avatar",
            "profile"
        ]
    
    def get_role(self, obj):
        """Return user role based on is_staff status"""
        return "Admin" if obj.is_staff else "Student"
    
    def get_avatar(self, obj):
        """Return full avatar URL if user has profile with avatar"""
        if hasattr(obj, 'profile') and obj.profile.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile.avatar.url)
            return obj.profile.avatar.url
        return None

