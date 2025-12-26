from django.db import models
from users.models import CustomUser

class InterviewSession(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    job_role = models.CharField(max_length=100)
    topic = models.CharField(max_length=100, default="General")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.job_role}"


class InterviewMessage(models.Model):
    SENDER_CHOICES = (
        ('ai', 'AI'),
        ('user', 'User'),
    )
    
    session = models.ForeignKey(InterviewSession, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    content = models.TextField()
    feedback = models.TextField(blank=True, null=True) # AI feedback on user's answer
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Msg from {self.sender} in {self.session.id}"
