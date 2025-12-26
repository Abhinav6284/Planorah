from django.db import models
from django.conf import settings

class ATSAnalysis(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ats_analyses')
    
    # Input
    resume_text = models.TextField()
    job_description = models.TextField()
    job_role = models.CharField(max_length=255, blank=True, null=True)
    
    # Output
    match_score = models.IntegerField(default=0)  # 0-100
    missing_keywords = models.JSONField(default=list)
    strength_areas = models.JSONField(default=list)
    improvement_areas = models.JSONField(default=list)
    summary_feedback = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ATS Scan ({self.match_score}%) - {self.user.username}"
