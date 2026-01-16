from django.contrib import admin
from .models import LifecycleEvent, RealityIntake


@admin.register(LifecycleEvent)
class LifecycleEventAdmin(admin.ModelAdmin):
    list_display = ('user', 'event_type', 'timestamp')
    list_filter = ('event_type', 'timestamp')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('user', 'event_type', 'timestamp', 'data')  # Immutable
    ordering = ('-timestamp',)
    
    def has_add_permission(self, request):
        # Events should only be created programmatically
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Events are immutable - cannot be deleted
        return False


@admin.register(RealityIntake)
class RealityIntakeAdmin(admin.ModelAdmin):
    list_display = ('user', 'target_role', 'target_timeline_months', 'reality_gap_score', 'intake_locked', 'created_at')
    list_filter = ('intake_locked', 'education_level', 'target_role')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('reality_gap_score', 'locked_at', 'created_at', 'updated_at')
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Education & Background', {
            'fields': ('education_level', 'branch_domain', 'current_skills')
        }),
        ('Commitment', {
            'fields': ('weekly_hours',)
        }),
        ('Goal', {
            'fields': ('target_role', 'target_timeline_months')
        }),
        ('Metrics', {
            'fields': ('reality_gap_score',)
        }),
        ('Lock Status', {
            'fields': ('intake_locked', 'locked_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
