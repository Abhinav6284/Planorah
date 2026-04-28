from django.db import models
from django.conf import settings
from .encryption import TokenEncryption
import logging

logger = logging.getLogger(__name__)


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

    def save(self, *args, **kwargs):
        """Encrypt tokens before saving to database."""
        if self.access_token and not self._is_encrypted(self.access_token):
            self.access_token = TokenEncryption.encrypt(self.access_token)
        if self.refresh_token and not self._is_encrypted(self.refresh_token):
            self.refresh_token = TokenEncryption.encrypt(self.refresh_token)
        super().save(*args, **kwargs)

    def __getattribute__(self, name):
        """Decrypt tokens on access."""
        value = super().__getattribute__(name)
        if name in ('access_token', 'refresh_token') and value:
            if self._is_encrypted(value):
                try:
                    return TokenEncryption.decrypt(value)
                except Exception as e:
                    logger.error(f"Failed to decrypt Google {name} for user {self.user.id}: {e}")
                    return None
        return value

    @staticmethod
    def _is_encrypted(value: str) -> bool:
        """Check if a token is already encrypted (base64 with length > typical JWT)."""
        if not value:
            return False
        # Encrypted tokens are longer and start with different character patterns
        return len(value) > 1000 and all(c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=' for c in value[:50])


class SpotifyCredential(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='spotify_credential')
    access_token = models.TextField()
    refresh_token = models.TextField(blank=True, null=True)
    expires_in = models.DateTimeField(blank=True, null=True)
    token_type = models.CharField(max_length=50, default='Bearer')

    def __str__(self):
        return f"Spotify Credential for {self.user.username}"

    def save(self, *args, **kwargs):
        """Encrypt tokens before saving to database."""
        if self.access_token and not self._is_encrypted(self.access_token):
            self.access_token = TokenEncryption.encrypt(self.access_token)
        if self.refresh_token and not self._is_encrypted(self.refresh_token):
            self.refresh_token = TokenEncryption.encrypt(self.refresh_token)
        super().save(*args, **kwargs)

    def __getattribute__(self, name):
        """Decrypt tokens on access."""
        value = super().__getattribute__(name)
        if name in ('access_token', 'refresh_token') and value:
            if self._is_encrypted(value):
                try:
                    return TokenEncryption.decrypt(value)
                except Exception as e:
                    logger.error(f"Failed to decrypt Spotify {name} for user {self.user.id}: {e}")
                    return None
        return value

    @staticmethod
    def _is_encrypted(value: str) -> bool:
        """Check if a token is already encrypted (base64 with length > typical JWT)."""
        if not value:
            return False
        return len(value) > 1000 and all(c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=' for c in value[:50])
