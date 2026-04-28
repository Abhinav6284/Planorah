from rest_framework import serializers
from .models import SessionRequest, Notification


class SessionRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionRequest
        fields = ['topic_tags', 'description']

    def validate_topic_tags(self, value):
        valid = {'roadmap', 'portfolio', 'career', 'resume', 'problem', 'other'}
        for tag in value:
            if tag not in valid:
                raise serializers.ValidationError(f"'{tag}' is not a valid topic tag.")
        return value


class SessionRequestListSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionRequest
        fields = [
            'id', 'topic_tags', 'description', 'status',
            'month_year', 'scheduled_at', 'meeting_link',
            'confirmed_at', 'created_at',
        ]
        read_only_fields = fields


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at', 'session']
        read_only_fields = fields
