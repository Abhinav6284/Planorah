from django.db import models
from django.conf import settings


class Task(models.Model):
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
