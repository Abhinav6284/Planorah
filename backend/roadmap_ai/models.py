from django.db import models
from django.conf import settings


class Roadmap(models.Model):
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    CATEGORY_CHOICES = [
        ('project', 'Project-Based'),
        ('career', 'Career Path'),
        ('research', 'Research & Academia'),
        ('skill_mastery', 'Skill Mastery'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='roadmaps')
    title = models.CharField(max_length=255)
    goal = models.TextField()
    overview = models.TextField(blank=True)
    estimated_duration = models.CharField(
        max_length=100, blank=True, default='6 months')
    daily_commitment = models.CharField(max_length=100, blank=True, null=True)
    difficulty_level = models.CharField(
        max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    category = models.CharField(
        max_length=20, choices=CATEGORY_CHOICES, default='career')
    
    # New fields for comprehensive roadmap
    tech_stack = models.TextField(blank=True, help_text="Preferred tech stack or domain")
    output_format = models.CharField(max_length=50, blank=True, default='Milestone-based')
    learning_constraints = models.TextField(blank=True, help_text="Time, budget, or resource constraints")
    motivation_style = models.CharField(max_length=50, blank=True, default='Milestones')
    success_definition = models.TextField(blank=True, help_text="How success is defined")

    prerequisites = models.JSONField(default=list, blank=True)
    career_outcomes = models.JSONField(default=list, blank=True)
    tips = models.JSONField(default=list, blank=True)
    faqs = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"

    class Meta:
        ordering = ['-created_at']


class Milestone(models.Model):
    roadmap = models.ForeignKey(
        Roadmap, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration = models.CharField(max_length=100, blank=True)
    order = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    resources = models.JSONField(default=list, blank=True)
    topics = models.JSONField(default=list, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.roadmap.title} - {self.title}"

    class Meta:
        ordering = ['order']


class Project(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    milestone = models.ForeignKey(
        Milestone, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=255)
    description = models.TextField()
    difficulty = models.CharField(
        max_length=20, choices=DIFFICULTY_CHOICES, default='medium')
    estimated_hours = models.IntegerField(default=0)
    tech_stack = models.JSONField(default=list)
    learning_outcomes = models.JSONField(default=list)
    completed = models.BooleanField(default=False)
    github_url = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.title
