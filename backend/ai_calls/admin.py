from django.contrib import admin
from .models import AICallLog


@admin.register(AICallLog)
class AICallLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'provider', 'trigger', 'status',
                    'call_id', 'phone_number', 'created_at')
    list_filter = ('provider', 'trigger', 'status')
    search_fields = ('user__email', 'user__username',
                     'call_id', 'phone_number')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
