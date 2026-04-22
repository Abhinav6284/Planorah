from django.contrib import admin
from .models import SessionRequest, Notification


@admin.register(SessionRequest)
class SessionRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'topic_tags', 'month_year', 'scheduled_at', 'created_at']
    list_filter = ['status', 'month_year']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['id', 'user', 'created_at', 'month_year', 'confirmed_at']
    fields = [
        'id', 'user', 'topic_tags', 'description',
        'status', 'month_year', 'scheduled_at', 'meeting_link',
        'confirmed_at', 'admin_notes', 'created_at',
    ]
    ordering = ['-created_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'message', 'is_read', 'created_at']
    list_filter = ['is_read']
    readonly_fields = ['id', 'user', 'session', 'message', 'created_at']
