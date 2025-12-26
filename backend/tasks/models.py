from django.db import models
from django.conf import settings
from roadmap_ai.models import Roadmap, Milestone
from django.utils import timezone


class Task(models.Model):
    """Individual task with day-wise assignment and notes."""
    
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('needs_revision', 'Needs Revision'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='roadmap_tasks')
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name='tasks')
    milestone = models.ForeignKey(Milestone, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    
    # Task details
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    
    # Scheduling
    day = models.IntegerField(help_text="Day number in roadmap (1-based)")
    due_date = models.DateField()
    order_in_day = models.IntegerField(default=0)
    
    # Time tracking
    estimated_minutes = models.IntegerField(default=60)
    actual_minutes = models.IntegerField(default=0)
    
    # Notes (markdown format)
    notes = models.TextField(blank=True)
    
    # Metadata
    tags = models.JSONField(default=list, blank=True)
    is_revision = models.BooleanField(default=False)
    original_task = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='revision_tasks')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['day', 'order_in_day', 'created_at']
        indexes = [
            models.Index(fields=['user', 'roadmap']),
            models.Index(fields=['user', 'day']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"{self.title} (Day {self.day})"
    
    def mark_complete(self):
        """Mark task as complete and create revision tasks."""
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()
        
        # Create revision tasks
        self.create_revision_tasks()
    
    def create_revision_tasks(self):
        """Create revision tasks at 1, 3, and 7 days after completion."""
        if self.is_revision:
            return  # Don't create revisions for revision tasks
        
        revision_days = [1, 3, 7]
        for days_after in revision_days:
            revision_due_date = self.completed_at.date() + timezone.timedelta(days=days_after)
            
            Task.objects.create(
                user=self.user,
                roadmap=self.roadmap,
                milestone=self.milestone,
                title=f"📝 Revision: {self.title}",
                description=f"Review and reinforce: {self.description}",
                status='not_started',
                day=self.day + days_after,
                due_date=revision_due_date,
                estimated_minutes=30,
                is_revision=True,
                original_task=self,
                tags=self.tags + ['revision']
            )


class Note(models.Model):
    """Standalone notes not tied to specific tasks."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notes')
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, null=True, blank=True, related_name='notes')
    
    title = models.CharField(max_length=500)
    content = models.TextField(help_text="Markdown formatted content")
    
    tags = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return self.title
