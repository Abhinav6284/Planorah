from rest_framework import serializers
from .models import Roadmap, Milestone, Project, StudentProject, Task


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'


class StudentProjectSerializer(serializers.ModelSerializer):
    """Serializer for student-uploaded projects."""
    has_github = serializers.SerializerMethodField()

    class Meta:
        model = StudentProject
        fields = [
            'id',
            'title',
            'description',
            'tech_stack',
            'source_type',
            'git_url',
            'github_url',
            'live_demo_url',
            'visibility',
            'has_github',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_has_github(self, obj):
        """Check if project has been published to GitHub."""
        return bool(obj.github_url)


class StudentProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating student projects."""

    class Meta:
        model = StudentProject
        fields = [
            'title',
            'description',
            'tech_stack',
            'source_type',
            'git_url',
            'live_demo_url',
            'visibility',
        ]

    def validate_git_url(self, value):
        """Validate git URL if source_type is git_url."""
        if self.initial_data.get('source_type') == 'git_url' and not value:
            raise serializers.ValidationError(
                "Git URL is required when source type is 'git_url'.")
        return value


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
