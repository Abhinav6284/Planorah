from rest_framework import serializers
from .models import InterviewSession, InterviewMessage

class InterviewMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewMessage
        fields = ['id', 'sender', 'content', 'feedback', 'created_at']

class InterviewSessionSerializer(serializers.ModelSerializer):
    messages = InterviewMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = InterviewSession
        fields = ['id', 'job_role', 'topic', 'created_at', 'is_active', 'messages']
