import uuid

from django.conf import settings
from django.db import models


class AssistantConversation(models.Model):
    CHANNEL_TEXT = "text"
    CHANNEL_VOICE = "voice"
    CHANNEL_CHOICES = [
        (CHANNEL_TEXT, "Text"),
        (CHANNEL_VOICE, "Voice"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assistant_v2_conversations",
    )
    channel = models.CharField(max_length=16, choices=CHANNEL_CHOICES, default=CHANNEL_TEXT)
    context_source = models.CharField(max_length=64, blank=True, default="assistant")
    language_preference = models.CharField(max_length=32, blank=True, default="hinglish")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"AssistantConversation({self.id}, user={self.user_id}, channel={self.channel})"


class AssistantTurn(models.Model):
    STATUS_OK = "ok"
    STATUS_NEEDS_CONFIRMATION = "needs_confirmation"
    STATUS_CLARIFICATION = "clarification"
    STATUS_ERROR = "error"
    STATUS_CHOICES = [
        (STATUS_OK, "OK"),
        (STATUS_NEEDS_CONFIRMATION, "Needs Confirmation"),
        (STATUS_CLARIFICATION, "Clarification"),
        (STATUS_ERROR, "Error"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        AssistantConversation,
        on_delete=models.CASCADE,
        related_name="turns",
    )
    channel = models.CharField(max_length=16, choices=AssistantConversation.CHANNEL_CHOICES)
    user_input_text = models.TextField(blank=True, default="")
    transcript = models.TextField(blank=True, default="")
    frontend_context = models.JSONField(default=dict, blank=True)
    backend_context = models.JSONField(default=dict, blank=True)
    llm_output = models.JSONField(default=dict, blank=True)
    assistant_text = models.TextField(blank=True, default="")
    language = models.CharField(max_length=32, blank=True, default="hinglish")
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_OK)
    tts_mime_type = models.CharField(max_length=64, blank=True, default="")
    tts_voice = models.CharField(max_length=64, blank=True, default="")
    tts_duration_ms = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"AssistantTurn({self.id}, conversation={self.conversation_id}, status={self.status})"


class AssistantActionProposal(models.Model):
    STATUS_PENDING = "pending"
    STATUS_CONFIRMED = "confirmed"
    STATUS_CANCELLED = "cancelled"
    STATUS_EXECUTED = "executed"
    STATUS_FAILED = "failed"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_CONFIRMED, "Confirmed"),
        (STATUS_CANCELLED, "Cancelled"),
        (STATUS_EXECUTED, "Executed"),
        (STATUS_FAILED, "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        AssistantConversation,
        on_delete=models.CASCADE,
        related_name="action_proposals",
    )
    turn = models.ForeignKey(
        AssistantTurn,
        on_delete=models.CASCADE,
        related_name="action_proposals",
    )
    action_type = models.CharField(max_length=128)
    summary = models.TextField()
    args = models.JSONField(default=dict, blank=True)
    args_preview = models.JSONField(default=dict, blank=True)
    is_async = models.BooleanField(default=False)
    requires_confirmation = models.BooleanField(default=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    executed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"AssistantActionProposal({self.id}, action={self.action_type}, status={self.status})"


class AssistantActionExecution(models.Model):
    STATUS_PENDING = "pending"
    STATUS_RUNNING = "running"
    STATUS_SUCCEEDED = "succeeded"
    STATUS_FAILED = "failed"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_RUNNING, "Running"),
        (STATUS_SUCCEEDED, "Succeeded"),
        (STATUS_FAILED, "Failed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assistant_action_executions",
    )
    conversation = models.ForeignKey(
        AssistantConversation,
        on_delete=models.CASCADE,
        related_name="executions",
    )
    proposal = models.ForeignKey(
        AssistantActionProposal,
        on_delete=models.CASCADE,
        related_name="executions",
    )
    idempotency_key = models.CharField(max_length=128, blank=True, default="")
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_PENDING)
    result = models.JSONField(default=dict, blank=True)
    error = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "idempotency_key"]),
        ]

    def __str__(self):
        return f"AssistantActionExecution({self.id}, status={self.status})"


class AssistantJob(models.Model):
    STATUS_QUEUED = "queued"
    STATUS_RUNNING = "running"
    STATUS_SUCCEEDED = "succeeded"
    STATUS_FAILED = "failed"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_QUEUED, "Queued"),
        (STATUS_RUNNING, "Running"),
        (STATUS_SUCCEEDED, "Succeeded"),
        (STATUS_FAILED, "Failed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assistant_jobs",
    )
    proposal = models.ForeignKey(
        AssistantActionProposal,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="jobs",
    )
    execution = models.ForeignKey(
        AssistantActionExecution,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="jobs",
    )
    action_type = models.CharField(max_length=128)
    celery_task_id = models.CharField(max_length=128, blank=True, default="")
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_QUEUED)
    result = models.JSONField(default=dict, blank=True)
    error = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"AssistantJob({self.id}, action={self.action_type}, status={self.status})"
