from rest_framework import serializers
from .models import Subject, ExamPattern, Topic, GeneratedNotes, StudyGuide, StudyPlan


class ExamPatternSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamPattern
        fields = ['id', 'marks_distribution', 'total_marks', 'duration_minutes', 'notes', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class TopicSerializer(serializers.ModelSerializer):
    has_notes = serializers.SerializerMethodField()
    has_study_guide = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = [
            'id', 'subject', 'name', 'description', 'importance', 'depth',
            'status', 'confidence', 'order', 'subtopics', 'expected_questions',
            'has_notes', 'has_study_guide', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'subject', 'created_at', 'updated_at', 'has_notes', 'has_study_guide']

    def get_has_notes(self, obj):
        return hasattr(obj, 'notes') and bool(obj.notes.content)

    def get_has_study_guide(self, obj):
        return hasattr(obj, 'study_guide') and bool(obj.study_guide.content)


class GeneratedNotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneratedNotes
        fields = ['id', 'topic', 'content', 'raw_text', 'created_at', 'updated_at']
        read_only_fields = ['id', 'topic', 'created_at', 'updated_at']


class StudyGuideSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyGuide
        fields = ['id', 'topic', 'content', 'raw_text', 'created_at', 'updated_at']
        read_only_fields = ['id', 'topic', 'created_at', 'updated_at']


class StudyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPlan
        fields = ['id', 'subject', 'exam_date', 'daily_hours', 'plan_data', 'created_at']
        read_only_fields = ['id', 'subject', 'created_at']


class SubjectSerializer(serializers.ModelSerializer):
    exam_pattern = ExamPatternSerializer(read_only=True)
    topic_count = serializers.SerializerMethodField()
    progress_summary = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = [
            'id', 'name', 'description', 'exam_date', 'syllabus_text',
            'exam_pattern', 'topic_count', 'progress_summary',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_topic_count(self, obj):
        return obj.topics.count()

    def get_progress_summary(self, obj):
        topics = obj.topics.all()
        total = topics.count()
        if total == 0:
            return {'total': 0, 'not_started': 0, 'weak': 0, 'strong': 0, 'avg_confidence': 0}
        not_started = topics.filter(status='not_started').count()
        weak = topics.filter(status='weak').count()
        strong = topics.filter(status='strong').count()
        confidences = list(topics.values_list('confidence', flat=True))
        avg_confidence = sum(confidences) // len(confidences) if confidences else 0
        return {
            'total': total,
            'not_started': not_started,
            'weak': weak,
            'strong': strong,
            'avg_confidence': avg_confidence,
        }


class SubjectDetailSerializer(SubjectSerializer):
    topics = TopicSerializer(many=True, read_only=True)

    class Meta(SubjectSerializer.Meta):
        fields = SubjectSerializer.Meta.fields + ['topics']
