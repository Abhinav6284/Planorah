from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from users.models import (
    CustomUser, UserProfile, StreakLog,
    OTPVerification, PasswordResetToken, DeletedUser,
)


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = "Profile"
    fields = (
        "purpose", "domain", "lifecycle_state", "goal_statement",
        "education_stage", "weekly_hours", "xp_points", "streak_count",
        "consistency_score", "last_activity_date", "readiness_score",
    )
    readonly_fields = ("consistency_score",)


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    inlines = [UserProfileInline]
    list_display = (
        "email", "username", "first_name", "last_name",
        "status", "is_verified", "is_staff", "is_active", "created_at",
    )
    list_filter = ("status", "is_verified", "is_staff", "is_active", "created_at")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        ("Personal Info", {"fields": ("first_name", "last_name", "date_of_birth", "phone_number", "address")}),
        ("Status", {"fields": ("status", "is_verified", "is_active", "is_staff", "is_superuser")}),
        ("Permissions", {"fields": ("groups", "user_permissions")}),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "password1", "password2", "is_staff", "is_active"),
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "lifecycle_state", "domain", "xp_points", "streak_count", "last_activity_date")
    list_filter = ("lifecycle_state", "domain", "education_stage")
    search_fields = ("user__email", "user__username", "goal_statement")
    raw_id_fields = ("user",)
    readonly_fields = ("consistency_score",)


@admin.register(StreakLog)
class StreakLogAdmin(admin.ModelAdmin):
    list_display = ("user", "activity_date", "activity_type")
    list_filter = ("activity_type", "activity_date")
    search_fields = ("user__email",)
    date_hierarchy = "activity_date"


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    list_display = ("email", "otp", "created_at", "is_used")
    list_filter = ("is_used",)
    search_fields = ("email",)
    readonly_fields = ("created_at",)


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("email", "user", "created_at", "is_used", "used_at")
    list_filter = ("is_used",)
    search_fields = ("email", "user__email")
    readonly_fields = ("token", "created_at", "used_at")


@admin.register(DeletedUser)
class DeletedUserAdmin(admin.ModelAdmin):
    list_display = ("email", "deleted_at", "deletion_reason")
    search_fields = ("email",)
    readonly_fields = ("email", "deleted_at")
    date_hierarchy = "deleted_at"
