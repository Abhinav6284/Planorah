"""
Resume Derivation System
A resume COMPILER, not a builder.

CORE PRINCIPLE: Resume content ONLY from PASS attempts.
Every line is traceable to proof.
"""
from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid
import json


class ResumeVersion(models.Model):
    """
    Immutable resume snapshot.
    Once generated, never modified - only new versions created.
    """

    version_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resume_versions'
    )

    roadmap = models.ForeignKey(
        'roadmap_ai.Roadmap',
        on_delete=models.CASCADE,
        related_name='resume_versions'
    )

    # Version metadata
    version_number = models.IntegerField(
        help_text="Incrementing version number"
    )

    generated_at = models.DateTimeField(auto_now_add=True)

    # Eligibility at generation time
    was_eligible = models.BooleanField(
        help_text="Was user eligible when this was generated"
    )

    eligibility_snapshot = models.JSONField(
        default=dict,
        help_text="Core/support status at generation"
    )

    # Compiled resume data
    compiled_content = models.JSONField(
        default=dict,
        help_text="Full resume content with traceability"
    )

    # Statistics
    total_tasks_completed = models.IntegerField(default=0)
    core_tasks_completed = models.IntegerField(default=0)
    average_score = models.FloatField(null=True)

    # Status
    is_latest = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Current version for this user/roadmap"
    )

    class Meta:
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['user', 'is_latest']),
            models.Index(fields=['roadmap', 'generated_at']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'roadmap', 'version_number'],
                name='unique_resume_version'
            )
        ]

    def __str__(self):
        return f"{self.user.username} Resume v{self.version_number}"


class ResumeEntry(models.Model):
    """
    Individual resume line/entry.
    MUST trace back to specific PASS attempt.
    """

    entry_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    resume_version = models.ForeignKey(
        ResumeVersion,
        on_delete=models.CASCADE,
        related_name='entries'
    )

    # Source traceability (CRITICAL)
    source_task = models.ForeignKey(
        'tasks.Task',
        on_delete=models.CASCADE,
        related_name='resume_entries'
    )

    source_attempt = models.ForeignKey(
        'tasks.TaskAttempt',
        on_delete=models.CASCADE,
        related_name='resume_entries',
        help_text="The PASS attempt this entry is derived from"
    )

    # Entry content
    entry_type = models.CharField(
        max_length=30,
        choices=[
            ('skill', 'Technical Skill'),
            ('project', 'Project'),
            ('achievement', 'Achievement'),
            ('certification', 'Certification'),
        ]
    )

    title = models.CharField(max_length=500)
    description = models.TextField()

    # Proof URL (GitHub repo, live URL, etc)
    proof_url = models.URLField(
        blank=True,
        help_text="Direct link to proof"
    )

    # Prominence (affected by task criticality)
    weight = models.IntegerField(
        help_text="From source task weight (1-5)"
    )

    score = models.FloatField(
        help_text="Validation score from source attempt"
    )

    # Display order
    order = models.IntegerField(default=0)

    # Tags from task
    tags = models.JSONField(default=list)

    class Meta:
        ordering = ['resume_version', 'order']
        indexes = [
            models.Index(fields=['resume_version', 'order']),
            models.Index(fields=['source_task']),
        ]

    def __str__(self):
        return f"{self.title} (from {self.source_task.title})"


class ResumeSectionTemplate(models.Model):
    """
    Templates for organizing resume sections.
    Defines how tasks map to resume sections.
    """

    template_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    # Section configuration
    sections = models.JSONField(
        default=list,
        help_text="""
        [
            {
                "name": "Technical Skills",
                "entry_type": "skill",
                "max_entries": 10,
                "sort_by": "score"  # or "weight", "date"
            },
            {
                "name": "Projects",
                "entry_type": "project",
                "max_entries": 5,
                "sort_by": "weight"
            }
        ]
        """
    )

    # Is this the default template?
    is_default = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
