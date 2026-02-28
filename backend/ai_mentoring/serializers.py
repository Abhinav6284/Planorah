from rest_framework import serializers
from .models import StudentSession


class SessionRequestSerializer(serializers.Serializer):
    """Validates incoming mentoring session requests."""
    context_source = serializers.CharField(max_length=100)
    student_goal = serializers.CharField(
        required=False, allow_blank=True, default='')
    current_progress = serializers.CharField(
        required=False, allow_blank=True, default='')
    transcript = serializers.CharField()


class StudentSessionSerializer(serializers.ModelSerializer):
    """Full session representation for API responses."""

    class Meta:
        model = StudentSession
        fields = [
            'id',
            'context_source',
            'student_goal',
            'current_progress',
            'transcript',
            'mentor_message',
            'emotional_tone',
            'confidence_level',
            'clarity_level',
            'action_items',
            'session_summary',
            'created_at',
        ]
        read_only_fields = fields
