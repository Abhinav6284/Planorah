# Generated manually for assistant v2 pipeline models.
import uuid

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AssistantConversation",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("channel", models.CharField(choices=[("text", "Text"), ("voice", "Voice")], default="text", max_length=16)),
                ("context_source", models.CharField(blank=True, default="assistant", max_length=64)),
                ("language_preference", models.CharField(blank=True, default="hinglish", max_length=32)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="assistant_v2_conversations", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-updated_at"]},
        ),
        migrations.CreateModel(
            name="AssistantTurn",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("channel", models.CharField(choices=[("text", "Text"), ("voice", "Voice")], max_length=16)),
                ("user_input_text", models.TextField(blank=True, default="")),
                ("transcript", models.TextField(blank=True, default="")),
                ("frontend_context", models.JSONField(blank=True, default=dict)),
                ("backend_context", models.JSONField(blank=True, default=dict)),
                ("llm_output", models.JSONField(blank=True, default=dict)),
                ("assistant_text", models.TextField(blank=True, default="")),
                ("language", models.CharField(blank=True, default="hinglish", max_length=32)),
                ("status", models.CharField(choices=[("ok", "OK"), ("needs_confirmation", "Needs Confirmation"), ("clarification", "Clarification"), ("error", "Error")], default="ok", max_length=32)),
                ("tts_mime_type", models.CharField(blank=True, default="", max_length=64)),
                ("tts_voice", models.CharField(blank=True, default="", max_length=64)),
                ("tts_duration_ms", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("conversation", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="turns", to="assistant.assistantconversation")),
            ],
            options={"ordering": ["created_at"]},
        ),
        migrations.CreateModel(
            name="AssistantActionProposal",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("action_type", models.CharField(max_length=128)),
                ("summary", models.TextField()),
                ("args", models.JSONField(blank=True, default=dict)),
                ("args_preview", models.JSONField(blank=True, default=dict)),
                ("is_async", models.BooleanField(default=False)),
                ("requires_confirmation", models.BooleanField(default=True)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("confirmed", "Confirmed"), ("cancelled", "Cancelled"), ("executed", "Executed"), ("failed", "Failed")], default="pending", max_length=32)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("confirmed_at", models.DateTimeField(blank=True, null=True)),
                ("executed_at", models.DateTimeField(blank=True, null=True)),
                ("conversation", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="action_proposals", to="assistant.assistantconversation")),
                ("turn", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="action_proposals", to="assistant.assistantturn")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="AssistantActionExecution",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("idempotency_key", models.CharField(blank=True, default="", max_length=128)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("running", "Running"), ("succeeded", "Succeeded"), ("failed", "Failed"), ("cancelled", "Cancelled")], default="pending", max_length=32)),
                ("result", models.JSONField(blank=True, default=dict)),
                ("error", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("conversation", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="executions", to="assistant.assistantconversation")),
                ("proposal", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="executions", to="assistant.assistantactionproposal")),
                ("user", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="assistant_action_executions", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="AssistantJob",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("action_type", models.CharField(max_length=128)),
                ("celery_task_id", models.CharField(blank=True, default="", max_length=128)),
                ("status", models.CharField(choices=[("queued", "Queued"), ("running", "Running"), ("succeeded", "Succeeded"), ("failed", "Failed"), ("cancelled", "Cancelled")], default="queued", max_length=32)),
                ("result", models.JSONField(blank=True, default=dict)),
                ("error", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("execution", models.ForeignKey(blank=True, null=True, on_delete=models.deletion.SET_NULL, related_name="jobs", to="assistant.assistantactionexecution")),
                ("proposal", models.ForeignKey(blank=True, null=True, on_delete=models.deletion.SET_NULL, related_name="jobs", to="assistant.assistantactionproposal")),
                ("user", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="assistant_jobs", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddIndex(
            model_name="assistantactionexecution",
            index=models.Index(fields=["user", "idempotency_key"], name="assistant_a_user_id_c1cf7c_idx"),
        ),
    ]
