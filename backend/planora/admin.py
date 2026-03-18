from django.contrib import admin
from .models import Subject, ExamPattern, Topic, GeneratedNotes, StudyGuide, StudyPlan


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'exam_date', 'created_at')
    list_filter = ('exam_date',)
    search_fields = ('name', 'user__username')


@admin.register(ExamPattern)
class ExamPatternAdmin(admin.ModelAdmin):
    list_display = ('subject', 'total_marks', 'duration_minutes')


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'subject', 'importance', 'depth', 'status', 'confidence', 'order')
    list_filter = ('importance', 'depth', 'status')
    search_fields = ('name', 'subject__name')


@admin.register(GeneratedNotes)
class GeneratedNotesAdmin(admin.ModelAdmin):
    list_display = ('topic', 'created_at', 'updated_at')


@admin.register(StudyGuide)
class StudyGuideAdmin(admin.ModelAdmin):
    list_display = ('topic', 'created_at', 'updated_at')


@admin.register(StudyPlan)
class StudyPlanAdmin(admin.ModelAdmin):
    list_display = ('subject', 'exam_date', 'daily_hours', 'created_at')
