"""
Behavioral Intelligence data models.

Stores: events, daily snapshots, insights, detected patterns, and adaptive changes.
"""

import uuid

from django.conf import settings
from django.db import models

from .constants import (
    ALL_EVENT_TYPES,
    ADAPTATION_TYPE_CHOICES,
    INSIGHT_PRIORITIES,
    INSIGHT_TONES,
    PATTERN_TYPE_CHOICES,
)


class BehaviorEvent(models.Model):
    """
    Core event store. Every meaningful user action is recorded here.
    All behavioral analysis operates on this event stream.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='behavior_events',
    )
    event_type = models.CharField(max_length=50, choices=ALL_EVENT_TYPES, db_index=True)
    metadata = models.JSONField(default=dict, blank=True)
    session_id = models.UUIDField(
        null=True, blank=True,
        help_text='Groups events that belong to the same user session',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'event_type']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['user', 'event_type', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user_id} | {self.event_type} | {self.created_at:%Y-%m-%d %H:%M}"


class DailyBehaviorSnapshot(models.Model):
    """
    Daily aggregate of behavioral metrics.
    Powers longitudinal trend analysis and identity evolution tracking.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='behavior_snapshots',
    )
    date = models.DateField()

    # Core scores (0-100)
    momentum_score = models.FloatField(default=0)
    burnout_risk = models.FloatField(default=0)
    consistency_score = models.FloatField(default=0)
    dropoff_risk = models.FloatField(default=0)
    procrastination_index = models.FloatField(default=0)
    recovery_speed = models.FloatField(default=0)

    # Activity counts
    active_minutes = models.IntegerField(default=0)
    tasks_completed = models.IntegerField(default=0)
    tasks_skipped = models.IntegerField(default=0)
    sessions_count = models.IntegerField(default=0)

    # Context
    preferred_hour = models.IntegerField(null=True, blank=True)
    identity_type = models.CharField(max_length=50, blank=True)

    # Full metrics dump for historical analysis
    raw_metrics = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        unique_together = ('user', 'date')
        indexes = [
            models.Index(fields=['user', 'date']),
        ]

    def __str__(self):
        return f"{self.user_id} | {self.date} | momentum={self.momentum_score}"


class BehavioralInsight(models.Model):
    """
    AI-interpreted behavioral insights with predictions and strategies.
    Rendered on the frontend as adaptive insight cards.
    """

    PRIORITY_CHOICES = [(p, p.title()) for p in INSIGHT_PRIORITIES]
    TONE_CHOICES = [(t, t.title()) for t in INSIGHT_TONES]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='behavioral_insights',
    )
    insight_type = models.CharField(
        max_length=30,
        help_text='behavioral, momentum, prediction, roadmap, identity, loop, adaptation',
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    confidence = models.FloatField(default=0, help_text='0-100 confidence score')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    strategy = models.TextField(blank=True)
    cta_label = models.CharField(max_length=100, blank=True)
    cta_action = models.CharField(max_length=100, blank=True)
    tone = models.CharField(max_length=30, choices=TONE_CHOICES, default='neutral')
    context_data = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    dismissed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['user', 'insight_type']),
        ]

    def __str__(self):
        return f"{self.user_id} | {self.insight_type} | {self.title[:50]}"


class BehaviorPattern(models.Model):
    """
    Detected behavioral loops and recurring patterns.
    Planorah's biggest moat — understanding repeated behavioral cycles.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='behavior_patterns',
    )
    pattern_type = models.CharField(max_length=50, choices=PATTERN_TYPE_CHOICES)
    description = models.TextField()
    detection_data = models.JSONField(default=dict, blank=True)
    occurrences = models.IntegerField(default=1)
    first_detected = models.DateTimeField(auto_now_add=True)
    last_detected = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-last_detected']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['user', 'pattern_type']),
        ]

    def __str__(self):
        return f"{self.user_id} | {self.pattern_type} | x{self.occurrences}"


class AdaptiveChange(models.Model):
    """
    Log of roadmap adaptation recommendations and applied changes.
    All changes are logged and reversible.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='adaptive_changes',
    )
    roadmap_id = models.UUIDField(
        null=True, blank=True,
        help_text='FK reference to roadmap (UUID to avoid cross-app FK)',
    )
    change_type = models.CharField(max_length=50, choices=ADAPTATION_TYPE_CHOICES)
    description = models.TextField()
    suggested_changes = models.JSONField(default=list, blank=True)
    before_state = models.JSONField(default=dict, blank=True)
    after_state = models.JSONField(default=dict, blank=True)
    trigger_metrics = models.JSONField(default=dict, blank=True)
    confidence = models.FloatField(default=0)
    applied = models.BooleanField(default=False)
    applied_at = models.DateTimeField(null=True, blank=True)
    reverted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'applied']),
        ]

    def __str__(self):
        status = 'applied' if self.applied else ('reverted' if self.reverted else 'pending')
        return f"{self.user_id} | {self.change_type} | {status}"
