from django.db import models
from django.conf import settings


class Event(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_completed = models.BooleanField(default=False)
    linked_task = models.ForeignKey(
        'tasks.Task', on_delete=models.SET_NULL, null=True, blank=True, related_name='calendar_events')

    def __str__(self):
        return f"{self.title} ({self.start_time.strftime('%Y-%m-%d %H:%M')})"


class GoogleCredential(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='google_credential')
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, null=True)
    token_uri = models.CharField(max_length=255)
    client_id = models.CharField(max_length=255)
    client_secret = models.CharField(max_length=255)
    scopes = models.TextField()
    expiry = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Google Credential for {self.user.username}"


class SpotifyCredential(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='spotify_credential')
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, null=True)
    expires_in = models.DateTimeField(blank=True, null=True)
    token_type = models.CharField(max_length=50, default='Bearer')

    def __str__(self):
        return f"Spotify Credential for {self.user.username}"
