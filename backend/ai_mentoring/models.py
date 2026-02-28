import uuid
from django.db import models
from django.conf import settings


class StudentSession(models.Model):
    """
    Stores each AI mentoring session for a user.
    Reusable across any section of the application (roadmap, dashboard, etc.).
    """

    EMOTIONAL_TONE_CHOICES = [
        ('encouraging', 'Encouraging'),
        ('empathetic', 'Empathetic'),
        ('motivating', 'Motivating'),
        ('neutral', 'Neutral'),
        ('supportive', 'Supportive'),
        ('challenging', 'Challenging'),
        ('celebratory', 'Celebratory'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='mentoring_sessions',
    )
    context_source = models.CharField(
        max_length=100,
        help_text='Origin section, e.g. "roadmap", "dashboard", "tasks"',
    )
    student_goal = models.TextField(blank=True, default='')
    current_progress = models.TextField(blank=True, default='')
    transcript = models.TextField(
        help_text='User input / conversation transcript')
    mentor_message = models.TextField(
        blank=True, default='',
        help_text='AI mentor response',
    )
    emotional_tone = models.CharField(
        max_length=50,
        blank=True,
        default='neutral',
        choices=EMOTIONAL_TONE_CHOICES,
    )
    confidence_level = models.FloatField(
        default=0.0,
        help_text='0.0 to 1.0 scale',
    )
    clarity_level = models.FloatField(
        default=0.0,
        help_text='0.0 to 1.0 scale',
    )
    action_items = models.JSONField(
        default=list,
        blank=True,
        help_text='List of suggested action items',
    )
    session_summary = models.TextField(
        blank=True,
        default='',
        help_text='Concise summary for memory across sessions',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Student Mentoring Session'
        verbose_name_plural = 'Student Mentoring Sessions'

    def __str__(self):
        return f"Session {self.id} — {self.user.email} ({self.context_source})"
