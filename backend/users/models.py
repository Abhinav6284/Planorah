from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from datetime import timedelta
from typing import TYPE_CHECKING


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

    if TYPE_CHECKING:
        profile: "UserProfile"  # type annotation for reverse relation

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.username} ({self.email})"


class UserProfile(models.Model):
    user = models.OneToOneField(
        CustomUser, on_delete=models.CASCADE, related_name='profile')

    # UNIVERSAL ONBOARDING FIELDS
    purpose = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        choices=[
            ('skill_learning', 'Skill learning'),
            ('project_building', 'Project building'),
            ('research_work', 'Research work'),
            ('teaching_mentoring', 'Teaching / mentoring others'),
            ('personal_goal', 'Personal goal tracking'),
        ],
        help_text='What the user is using Planorah for'
    )
    domain = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        choices=[
            ('technology', 'Technology'),
            ('science_research', 'Science & Research'),
            ('design_creative', 'Design & Creative'),
            ('business_management', 'Business & Management'),
            ('arts_humanities', 'Arts & Humanities'),
            ('other', 'Other'),
        ],
        help_text='General domain/area of work'
    )
    validation_mode = models.CharField(
        max_length=20,
        default='automatic',
        choices=[
            ('automatic', 'Automatic (quizzes, repos, structured proofs)'),
            ('manual', 'Manual (mentor / professor / reviewer)'),
            ('mixed', 'Mixed (recommended)'),
        ],
        help_text='How work should be validated'
    )
    weekly_hours = models.IntegerField(
        default=5,
        help_text='Committed hours per week'
    )
    goal_statement = models.TextField(
        blank=True,
        null=True,
        help_text='One-line goal description (logged and enforced)'
    )
    goal_type = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        choices=[
            ('learn_skill', 'Learn a skill'),
            ('build_project', 'Build a project'),
            ('research_study', 'Complete a research study'),
            ('prepare_evaluation', 'Prepare for evaluation'),
            ('track_work', 'Track structured work'),
        ],
        help_text='Type of goal being pursued'
    )
    readiness_score = models.IntegerField(
        default=0,
        help_text='Execution readiness score (0-100)'
    )
    onboarding_accepted_terms = models.BooleanField(
        default=False,
        help_text='User accepted work validation terms'
    )

    # LEGACY FIELDS (kept for backward compatibility)
    field_of_study = models.CharField(max_length=100, blank=True, null=True)
    target_role = models.CharField(max_length=100, blank=True, null=True)
    experience_level = models.CharField(max_length=50, blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)
    career_intent = models.CharField(max_length=100, blank=True, null=True)

    # Onboarding flag - DEPRECATED in favor of lifecycle_state
    onboarding_complete = models.BooleanField(default=False)

    # Phase-gating state machine (NEW)
    lifecycle_state = models.CharField(
        max_length=50,
        default='ONBOARDING',
        help_text="Current phase in the user lifecycle"
    )
    goal_locked_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when goal was locked (point of no return)"
    )
    last_activity_date = models.DateField(
        null=True,
        blank=True,
        help_text="Last date user had meaningful activity for consistency tracking"
    )
    consistency_score = models.FloatField(
        default=0.0,
        help_text="Score tracking user's consistency in executing their roadmap"
    )

    # Profile Extensions
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    # Gamification
    streak_count = models.IntegerField(default=0)
    last_study_date = models.DateField(
        null=True, blank=True)  # Used for streak tracking
    xp_points = models.IntegerField(default=0)

    def __str__(self):
        return f"Profile for {self.user.username}"


class StreakLog(models.Model):
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="streak_logs")
    activity_date = models.DateField(auto_now_add=True)
    # e.g., 'login', 'resume_gen', 'ats_scan'
    activity_type = models.CharField(max_length=50)

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


class DeletedUser(models.Model):
    """
    Track deleted user emails to prevent them from re-registering via OAuth.
    When a user account is deleted, their email is added to this table.
    """
    email = models.EmailField(unique=True, db_index=True)
    deleted_at = models.DateTimeField(auto_now_add=True)
    deletion_reason = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Deleted User"
        verbose_name_plural = "Deleted Users"
        ordering = ['-deleted_at']

    def __str__(self):
        return f"{self.email} (deleted {self.deleted_at.strftime('%Y-%m-%d')})"
