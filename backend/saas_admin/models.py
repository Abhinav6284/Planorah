from django.db import models
from django.conf import settings


class FeatureFlag(models.Model):
    """
    System-wide feature flags for enabling/disabling features in production.
    Managed by staff via the SaaS admin panel.
    """
    name = models.CharField(max_length=100, unique=True, help_text="Human-readable flag name")
    key = models.SlugField(max_length=100, unique=True, help_text="Code identifier, e.g. enable_ai_calls")
    description = models.TextField(blank=True, help_text="What this flag controls")
    is_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="feature_flags_updated",
    )

    class Meta:
        ordering = ["key"]

    def __str__(self):
        status = "ON" if self.is_enabled else "OFF"
        return f"{self.key} [{status}]"


class AdminLog(models.Model):
    """
    Immutable audit trail of all actions taken via the SaaS admin panel.
    """
    ACTION_CHOICES = [
        ("user_disabled", "User Disabled"),
        ("user_enabled", "User Enabled"),
        ("user_deleted", "User Deleted"),
        ("plan_assigned", "Plan Assigned"),
        ("subscription_cancelled", "Subscription Cancelled"),
        ("subscription_extended", "Subscription Extended"),
        ("trial_granted", "Trial Granted"),
        ("progress_reset", "Progress Reset"),
        ("flag_toggled", "Feature Flag Toggled"),
        ("premium_granted", "Premium Granted Manually"),
        ("note_added", "Admin Note Added"),
    ]

    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="admin_logs_performed",
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="admin_actions_received",
    )
    detail = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["admin", "created_at"]),
            models.Index(fields=["target_user"]),
            models.Index(fields=["action"]),
        ]

    def __str__(self):
        return f"{self.admin} → {self.get_action_display()} @ {self.created_at:%Y-%m-%d %H:%M}"
