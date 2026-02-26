from django.db import models
from django.conf import settings


class AICallLog(models.Model):
    """Tracks every AI-initiated outbound call."""

    TRIGGER_CHOICES = [
        ('onboarding_complete', 'Onboarding Complete'),
        ('manual', 'Manual Trigger'),
    ]

    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('skipped', 'Skipped'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_calls',
    )
    phone_number = models.CharField(max_length=20)
    # vapi / retell / elevenlabs / bland
    provider = models.CharField(max_length=50)
    trigger = models.CharField(
        max_length=50, choices=TRIGGER_CHOICES, default='onboarding_complete')
    call_id = models.CharField(
        max_length=255, blank=True, null=True)   # Provider's call ID
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='initiated')
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Call Log'
        verbose_name_plural = 'AI Call Logs'

    def __str__(self):
        return f"{self.user.email} | {self.provider} | {self.trigger} | {self.status} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
