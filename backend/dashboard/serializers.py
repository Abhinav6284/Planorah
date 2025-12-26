from rest_framework import serializers
from .models import Task, DailySummary


class TaskSerializer(serializers.ModelSerializer):
    roadmap_title = serializers.CharField(source='roadmap.title', read_only=True)
    milestone_title = serializers.CharField(source='milestone.title', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'


class DailySummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailySummary
        fields = '__all__'
