"""Serializers for the behavioral intelligence API."""

from rest_framework import serializers
from .models import (
    BehaviorEvent,
    BehavioralInsight,
    BehaviorPattern,
    AdaptiveChange,
    DailyBehaviorSnapshot,
)


class BehaviorEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = BehaviorEvent
        fields = ['id', 'event_type', 'metadata', 'session_id', 'created_at']
        read_only_fields = ['id', 'created_at']


class BehavioralInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = BehavioralInsight
        fields = [
            'id', 'insight_type', 'title', 'description', 'confidence',
            'priority', 'strategy', 'cta_label', 'cta_action', 'tone',
            'context_data', 'is_active', 'dismissed_at', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class BehaviorPatternSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = BehaviorPattern
        fields = [
            'id', 'pattern_type', 'display_name', 'description',
            'detection_data', 'occurrences', 'is_active',
            'first_detected', 'last_detected',
        ]
        read_only_fields = ['id', 'first_detected', 'last_detected']

    def get_display_name(self, obj):
        from intelligence.constants import PATTERN_TYPES
        info = PATTERN_TYPES.get(obj.pattern_type, {})
        return info.get('display', obj.pattern_type.replace('_', ' ').title())


class AdaptiveChangeSerializer(serializers.ModelSerializer):
    display_type = serializers.SerializerMethodField()

    class Meta:
        model = AdaptiveChange
        fields = [
            'id', 'change_type', 'display_type', 'description',
            'suggested_changes', 'trigger_metrics', 'confidence',
            'applied', 'applied_at', 'reverted', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'applied_at']

    def get_display_type(self, obj):
        from intelligence.constants import ADAPTATION_TYPES
        info = ADAPTATION_TYPES.get(obj.change_type, {})
        return info.get('display', obj.change_type.replace('_', ' ').title())


class DailyBehaviorSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyBehaviorSnapshot
        fields = [
            'id', 'date', 'momentum_score', 'burnout_risk',
            'consistency_score', 'dropoff_risk', 'procrastination_index',
            'recovery_speed', 'active_minutes', 'tasks_completed',
            'tasks_skipped', 'sessions_count', 'identity_type', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
