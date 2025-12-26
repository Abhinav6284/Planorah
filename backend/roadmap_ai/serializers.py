from rest_framework import serializers
from .models import Roadmap, Milestone, Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class MilestoneSerializer(serializers.ModelSerializer):
    projects = ProjectSerializer(many=True, read_only=True)

    class Meta:
        model = Milestone
        fields = '__all__'


class RoadmapSerializer(serializers.ModelSerializer):
    milestone_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Roadmap
        fields = ['id', 'title', 'goal', 'overview', 'estimated_duration',
                  'difficulty_level', 'category', 'tech_stack', 'output_format', 
                  'learning_constraints', 'motivation_style', 'success_definition',
                  'created_at', 'milestone_count', 'completion_percentage']

    def get_milestone_count(self, obj):
        return obj.milestones.count()

    def get_completion_percentage(self, obj):
        total = obj.milestones.count()
        if total == 0:
            return 0
        completed = obj.milestones.filter(is_completed=True).count()
        return round((completed / total) * 100, 2)


class RoadmapDetailSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)

    class Meta:
        model = Roadmap
        fields = '__all__'
