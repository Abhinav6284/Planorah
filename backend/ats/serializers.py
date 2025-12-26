from rest_framework import serializers
from .models import ATSAnalysis

class ATSAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ATSAnalysis
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'match_score', 'missing_keywords', 'strength_areas', 'improvement_areas', 'summary_feedback']
