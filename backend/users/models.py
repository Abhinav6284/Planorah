from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from datetime import timedelta


class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        extra_fields.setdefault("first_name", username)

        return self.create_user(email, username, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    # Core user info
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)

    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    # OTP and verification fields
    otp = models.CharField(max_length=6, blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    # Django auth-related fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.username} ({self.email})"


class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    field_of_study = models.CharField(max_length=100, blank=True, null=True)  # e.g. CS, MBBS
    target_role = models.CharField(max_length=100, blank=True, null=True)     # e.g. Python Intern
    experience_level = models.CharField(max_length=50, blank=True, null=True) # e.g. Beginner, Intermediate
    skills = models.JSONField(default=list, blank=True)                       # e.g. ["Python", "Django"]
    career_intent = models.CharField(max_length=100, blank=True, null=True)   # e.g. Jobs, Internships, Resume
    
    # Onboarding flag - set to True once user completes initial onboarding
    onboarding_complete = models.BooleanField(default=False)
    
    # Profile Extensions
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    # Gamification
    streak_count = models.IntegerField(default=0)
    last_study_date = models.DateField(null=True, blank=True) # Used for streak tracking
    xp_points = models.IntegerField(default=0)

    def __str__(self):
        return f"Profile for {self.user.username}"


class StreakLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="streak_logs")
    activity_date = models.DateField(auto_now_add=True)
    activity_type = models.CharField(max_length=50) # e.g., 'login', 'resume_gen', 'ats_scan'
    
    class Meta:
        unique_together = ('user', 'activity_date')

    def __str__(self):
        return f"{self.user.username} - {self.activity_date}"


class OTPVerification(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=10)  # OTP valid for 10 mins

    def __str__(self):
        return f"{self.email} - {self.otp}"
