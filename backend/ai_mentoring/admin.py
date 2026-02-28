from django.contrib import admin
from .models import StudentSession


@admin.register(StudentSession)
class StudentSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'context_source',
                    'emotional_tone', 'confidence_level', 'created_at')
    list_filter = ('context_source', 'emotional_tone', 'created_at')
    search_fields = ('user__email', 'context_source', 'student_goal')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)
