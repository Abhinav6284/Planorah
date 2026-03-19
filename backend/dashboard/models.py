from django.db import models
from django.conf import settings
import uuid


class Task(models.Model):
    """
    Legacy lightweight dashboard task.
    NOTE: This is separate from tasks.Task (roadmap tasks).
    Prefer tasks.Task for new development.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default='medium')
    tags = models.JSONField(default=list, blank=True)
    estimated_pomodoros = models.PositiveIntegerField(default=1)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.status})"


class DailySummary(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='summaries')
    date = models.DateField(auto_now_add=True)
    completed_tasks = models.PositiveIntegerField(default=0)
    pending_tasks = models.PositiveIntegerField(default=0)
    productivity_score = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.user.username} - {self.date}"


class ExecutionTask(models.Model):
    TASK_TYPE_CHOICES = [
        ('learning', 'Learning'),
        ('exam', 'Exam'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='execution_tasks'
    )
    title = models.CharField(max_length=255)
    task_type = models.CharField(
        max_length=16, choices=TASK_TYPE_CHOICES, default='learning')
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default='medium')
    difficulty = models.CharField(
        max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    estimated_time = models.CharField(max_length=32, default='25 min')
    estimated_minutes = models.PositiveIntegerField(default=25)
    reason = models.TextField(blank=True)
    ai_generated = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)
    scheduled_for = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'task_type', 'status']),
            models.Index(fields=['user', 'scheduled_for']),
        ]

    def __str__(self):
        return f"{self.title} ({self.task_type})"


class UserStats(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='execution_stats'
    )
    xp_points = models.PositiveIntegerField(default=0)
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    tasks_completed = models.PositiveIntegerField(default=0)
    focus_minutes = models.PositiveIntegerField(default=0)
    level = models.CharField(max_length=32, default='Beginner')
    last_completed_date = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} stats"


class Streak(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='execution_streaks'
    )
    day = models.DateField()
    active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'day')
        ordering = ['-day']

    def __str__(self):
        return f"{self.user.username} {self.day} ({'active' if self.active else 'inactive'})"


class XPLog(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='execution_xp_logs'
    )
    task = models.ForeignKey(
        ExecutionTask,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='xp_logs'
    )
    points = models.IntegerField(default=0)
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.points} XP ({self.reason})"


class FocusSession(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='focus_sessions'
    )
    task = models.ForeignKey(
        ExecutionTask,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='focus_sessions'
    )
    planned_minutes = models.PositiveIntegerField(default=25)
    status = models.CharField(
        max_length=16, choices=STATUS_CHOICES, default='active')
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    actual_minutes = models.PositiveIntegerField(default=0)
    distraction_blocked = models.BooleanField(default=True)

    class Meta:
        ordering = ['-started_at']


class ExamPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='exam_plans'
    )
    title = models.CharField(max_length=255, default='Exam Plan')
    syllabus_text = models.TextField()
    exam_pattern = models.TextField(blank=True)
    topics = models.JSONField(default=list, blank=True)
    revision_schedule = models.JSONField(default=list, blank=True)
    raw_ai_response = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.username} exam plan"
