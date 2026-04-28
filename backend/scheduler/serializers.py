from rest_framework import serializers
from .models import Event, GoogleCredential, SpotifyCredential


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'


class GoogleCredentialStatusSerializer(serializers.ModelSerializer):
    """
    Safe serializer for Google credential status.
    NEVER exposes access_token, refresh_token, or client_secret.
    """
    is_connected = serializers.SerializerMethodField()

    class Meta:
        model = GoogleCredential
        fields = [
            'is_connected',
            'expiry',
            'scopes',
        ]
        read_only_fields = fields

    def get_is_connected(self, obj):
        """Always return true if the credential exists."""
        return True


class SpotifyCredentialStatusSerializer(serializers.ModelSerializer):
    """
    Safe serializer for Spotify credential status.
    NEVER exposes access_token or refresh_token.
    """
    is_connected = serializers.SerializerMethodField()

    class Meta:
        model = SpotifyCredential
        fields = [
            'is_connected',
            'expires_in',
            'token_type',
        ]
        read_only_fields = fields

    def get_is_connected(self, obj):
        """Always return true if the credential exists."""
        return True
