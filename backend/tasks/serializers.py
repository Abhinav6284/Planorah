from rest_framework import serializers
from .models import Task, Note
from roadmap_ai.models import Roadmap, Milestone


class TaskSerializer(serializers.ModelSerializer):
    roadmap_title = serializers.CharField(source='roadmap.goal', read_only=True)
    milestone_title = serializers.CharField(source='milestone.title', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'user', 'roadmap', 'roadmap_title', 'milestone', 'milestone_title',
            'title', 'description', 'status', 'day', 'due_date', 'order_in_day',
            'estimated_minutes', 'actual_minutes', 'notes', 'tags', 'is_revision',
            'original_task', 'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'completed_at']


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'roadmap', 'milestone', 'title', 'description', 'day', 'due_date',
            'estimated_minutes', 'tags'
        ]


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'user', 'roadmap', 'title', 'content', 'tags', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
