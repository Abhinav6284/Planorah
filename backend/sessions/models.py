import uuid
from django.db import models
from django.conf import settings


class SessionRequest(models.Model):
    TOPIC_CHOICES = [
        ('roadmap', 'Roadmap'),
        ('portfolio', 'Portfolio'),
        ('career', 'Career Advice'),
        ('resume', 'Resume Help'),
        ('problem', 'Problem / Blocker'),
        ('other', 'Other'),
    ]

    STATUS_REQUESTED = 'requested'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_REQUESTED, 'Requested'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='session_requests',
    )
    topic_tags = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_REQUESTED)
    month_year = models.CharField(max_length=7)  # "YYYY-MM"
    scheduled_at = models.DateTimeField(null=True, blank=True)
    meeting_link = models.URLField(blank=True, default='')
    confirmed_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'month_year']),
            models.Index(fields=['user', 'status']),
        ]

    def __str__(self):
        return f"{self.user} — {self.status} ({self.month_year})"


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='session_notifications',
    )
    session = models.ForeignKey(
        SessionRequest,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True,
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user} — {'read' if self.is_read else 'unread'}"
