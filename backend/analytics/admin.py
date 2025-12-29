from django.contrib import admin
from .models import UserProgress, RoadmapProgress, DailyActivity, UsageLog


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'current_streak', 'longest_streak', 'total_tasks_completed', 'last_active_at']
    search_fields = ['user__username']
    readonly_fields = ['last_active_at']
    raw_id_fields = ['user']


@admin.register(RoadmapProgress)
class RoadmapProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'roadmap', 'completion_percentage', 'is_completed', 'started_at']
    list_filter = ['is_completed']
    search_fields = ['user__username', 'roadmap__title']
    readonly_fields = ['started_at', 'completed_at', 'last_activity_at']
    raw_id_fields = ['user', 'roadmap']


@admin.register(DailyActivity)
class DailyActivityAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'tasks_completed', 'minutes_active', 'login_count']
    list_filter = ['date']
    search_fields = ['user__username']
    raw_id_fields = ['user']


@admin.register(UsageLog)
class UsageLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'resource_type', 'created_at']
    list_filter = ['action']
    search_fields = ['user__username']
    readonly_fields = ['created_at']
    raw_id_fields = ['user', 'subscription']

