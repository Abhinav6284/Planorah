from django.db import models
from django.conf import settings

class SpotifyToken(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='spotify_token')
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_type = models.CharField(max_length=50, default='Bearer')
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Spotify Token for {self.user.username}"

    def is_expired(self):
        from django.utils import timezone
        return timezone.now() >= self.expires_at


class YouTubeToken(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='youtube_token')
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_type = models.CharField(max_length=50, default='Bearer')
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"YouTube Token for {self.user.username}"

    def is_expired(self):
        from django.utils import timezone
        return timezone.now() >= self.expires_at


class MusicPreferences(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='music_preferences')
    spotify_enabled = models.BooleanField(default=True)
    youtube_enabled = models.BooleanField(default=True)
    default_service = models.CharField(max_length=20, default='spotify', choices=[
        ('spotify', 'Spotify'),
        ('youtube', 'YouTube'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Music Preferences for {self.user.username}"
