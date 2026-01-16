"""
Serializers for user_lifecycle app.
"""

from rest_framework import serializers
from .models import LifecycleEvent, RealityIntake
from tasks.models import TaskAttempt


class LifecycleEventSerializer(serializers.ModelSerializer):
    """Read-only serializer for lifecycle events"""
    
    class Meta:
        model = LifecycleEvent
        fields = ['id', 'event_type', 'timestamp', 'data']
        read_only_fields = fields


class RealityIntakeSerializer(serializers.ModelSerializer):
    """Serializer for reality intake submission"""
    
    reality_gap_score = serializers.FloatField(read_only=True)
    intake_locked = serializers.BooleanField(read_only=True)
    locked_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = RealityIntake
        fields = [
            'id',
            'education_level',
            'branch_domain',
            'current_skills',
            'weekly_hours',
            'target_role',
            'target_timeline_months',
            'reality_gap_score',
            'intake_locked',
            'locked_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['reality_gap_score', 'intake_locked', 'locked_at', 'created_at', 'updated_at']
    
    def validate_current_skills(self, value):
        """Ensure skills is a list"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Skills must be a list")
        return value
    
    def validate_weekly_hours(self, value):
        """Ensure weekly hours is reasonable"""
        if value < 1 or value > 168:
            raise serializers.ValidationError("Weekly hours must be between 1 and 168")
        return value


class TaskAttemptSerializer(serializers.ModelSerializer):
    """Serializer for task attempt submission and display"""
    
    task_title = serializers.CharField(source='task.title', read_only=True)
    validation_status_display = serializers.CharField(source='get_validation_status_display', read_only=True)
    
    class Meta:
        model = TaskAttempt
        fields = [
            'id',
            'task',
            'task_title',
            'attempt_number',
            'proof_data',
            'validation_status',
            'validation_status_display',
            'score',
            'validator_feedback',
            'submitted_at',
            'validated_at',
        ]
        read_only_fields = [
            'attempt_number',
            'validation_status',
            'score',
            'validator_feedback',
            'submitted_at',
            'validated_at',
        ]
    
    def validate_proof_data(self, value):
        """Validate proof data structure"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Proof data must be a JSON object")
        
        # Ensure at least some proof is provided
        if not value:
            raise serializers.ValidationError("Proof data cannot be empty")
        
        return value
