from rest_framework import serializers
from .models import (
    Task,
    DailySummary,
    ExecutionTask,
    FocusSession,
    UserStats,
    XPLog,
    ExamPlan,
)


class TaskSerializer(serializers.ModelSerializer):
    roadmap_title = serializers.CharField(
        source='roadmap.title', read_only=True)
    milestone_title = serializers.CharField(
        source='milestone.title', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'


class DailySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailySummary
        fields = '__all__'


class ExecutionTaskSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='task_type')

    class Meta:
        model = ExecutionTask
        fields = [
            'id',
            'title',
            'type',
            'status',
            'priority',
            'difficulty',
            'estimated_time',
            'estimated_minutes',
            'reason',
            'ai_generated',
            'metadata',
            'scheduled_for',
            'completed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'completed_at', 'created_at', 'updated_at']


class FocusSessionSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)

    class Meta:
        model = FocusSession
        fields = [
            'id',
            'task',
            'task_title',
            'planned_minutes',
            'status',
            'started_at',
            'ended_at',
            'actual_minutes',
            'distraction_blocked',
        ]
        read_only_fields = ['id', 'started_at']


class UserStatsSerializer(serializers.ModelSerializer):
    progress_label = serializers.SerializerMethodField()

    class Meta:
        model = UserStats
        fields = [
            'xp_points',
            'current_streak',
            'longest_streak',
            'tasks_completed',
            'focus_minutes',
            'level',
            'progress_label',
            'updated_at',
        ]

    def get_progress_label(self, obj):
        if obj.tasks_completed == 0:
            return "Start your first task"
        if obj.tasks_completed < 10:
            return "You're getting started"
        return "You're on fire"


class XPLogSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)

    class Meta:
        model = XPLog
        fields = ['id', 'task', 'task_title', 'points', 'reason', 'created_at']


class ExamPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamPlan
        fields = [
            'id',
            'title',
            'syllabus_text',
            'exam_pattern',
            'topics',
            'revision_schedule',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'topics',
                            'revision_schedule', 'created_at', 'updated_at']
