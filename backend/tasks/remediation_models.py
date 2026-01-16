"""
Remediation acknowledgment system.
User must explicitly accept difficulty changes.
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class RemediationAction(models.Model):
    """
    Records system-suggested or applied remediation actions.
    CRITICAL: User must explicitly acknowledge before applying.
    """

    ACTION_TYPES = [
        ('difficulty_downgrade', 'Difficulty Downgrade'),
        ('scope_reduction', 'Scope Reduction'),
        ('deadline_extension', 'Deadline Extension'),
        ('task_removal', 'Task Removal'),
    ]

    STATUS_CHOICES = [
        ('SUGGESTED', 'Suggested (awaiting user)'),
        ('ACCEPTED', 'Accepted by user'),
        ('REJECTED', 'Rejected by user'),
        ('AUTO_APPLIED', 'Auto-applied (emergency)'),
    ]

    remediation_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='remediations'
    )

    action_type = models.CharField(
        max_length=30,
        choices=ACTION_TYPES
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='SUGGESTED'
    )

    # What's being remediated
    task = models.ForeignKey(
        'tasks.Task',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='remediations'
    )

    roadmap = models.ForeignKey(
        'roadmap_ai.Roadmap',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='remediations'
    )

    # Why it's being suggested
    reason = models.TextField(
        help_text="Clear explanation of why remediation is needed"
    )

    # What will change
    proposed_changes = models.JSONField(
        default=dict,
        help_text="Detailed changes that will be applied"
    )

    # Applied changes (after acceptance)
    applied_changes = models.JSONField(
        default=dict,
        blank=True,
        help_text="Actual changes applied (may differ from proposed)"
    )

    # Timestamps
    suggested_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    applied_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Suggestion expires if not responded to"
    )

    # User response
    user_comment = models.TextField(
        blank=True,
        help_text="User's comment on accepting/rejecting"
    )

    class Meta:
        ordering = ['-suggested_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'suggested_at']),
        ]

    def __str__(self):
        return f"{self.action_type} for {self.user.username} - {self.status}"

    def accept(self, user_comment: str = ""):
        """User accepts the remediation."""
        if self.status != 'SUGGESTED':
            raise ValueError(
                f"Cannot accept remediation in status: {self.status}")

        self.status = 'ACCEPTED'
        self.responded_at = timezone.now()
        self.user_comment = user_comment
        self.save()

        # Apply changes
        self._apply_changes()

    def reject(self, user_comment: str = ""):
        """User rejects the remediation."""
        if self.status != 'SUGGESTED':
            raise ValueError(
                f"Cannot reject remediation in status: {self.status}")

        self.status = 'REJECTED'
        self.responded_at = timezone.now()
        self.user_comment = user_comment
        self.save()

    def _apply_changes(self):
        """Apply the remediation changes."""
        from .stagnation import apply_difficulty_downgrade

        if self.action_type == 'difficulty_downgrade' and self.task:
            level = self.proposed_changes.get('level', 'moderate')
            result = apply_difficulty_downgrade(self.task, level)
            self.applied_changes = result
            self.applied_at = timezone.now()
            self.save()

        # Other action types handled here
        # For now, just record the acceptance
        self.applied_at = timezone.now()
        self.save()


class EligibilityOverride(models.Model):
    """
    Admin override for eligibility edge cases.
    LOGGED PERMANENTLY - rarely used, but essential.
    """

    override_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='eligibility_overrides'
    )

    roadmap = models.ForeignKey(
        'roadmap_ai.Roadmap',
        on_delete=models.CASCADE,
        related_name='eligibility_overrides'
    )

    # Who granted the override
    granted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='granted_overrides'
    )

    # Justification (REQUIRED)
    justification = models.TextField(
        help_text="Why this override was granted - required for audit trail"
    )

    # Context at time of override
    eligibility_snapshot = models.JSONField(
        default=dict,
        help_text="Eligibility status when override was granted"
    )

    # Override details
    is_active = models.BooleanField(
        default=True,
        help_text="Override can be revoked"
    )

    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Optional expiration date"
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    revoked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='revoked_overrides'
    )
    revocation_reason = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['roadmap', 'is_active']),
        ]

    def __str__(self):
        return f"Override for {self.user.username} on {self.roadmap.title}"

    def revoke(self, revoked_by, reason: str):
        """Revoke the override."""
        self.is_active = False
        self.revoked_at = timezone.now()
        self.revoked_by = revoked_by
        self.revocation_reason = reason
        self.save()
