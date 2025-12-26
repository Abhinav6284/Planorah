from django.db import models
from django.conf import settings

class Resume(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=255, default="My Resume")
    
    # Input Data (JSON)
    personal_info = models.JSONField(default=dict)
    education = models.JSONField(default=list)
    experience = models.JSONField(default=list)
    skills = models.JSONField(default=list)
    projects = models.JSONField(default=list)
    
    # Generated Content (HTML/Markdown)
    generated_content = models.TextField(blank=True, null=True)
    
    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"
