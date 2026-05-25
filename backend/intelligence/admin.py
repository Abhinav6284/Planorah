from django.contrib import admin
from .models import (
    BehaviorEvent,
    DailyBehaviorSnapshot,
    BehavioralInsight,
    BehaviorPattern,
    AdaptiveChange,
)


@admin.register(BehaviorEvent)
class BehaviorEventAdmin(admin.ModelAdmin):
    list_display = ('user', 'event_type', 'created_at')
    list_filter = ('event_type', 'created_at')
    search_fields = ('user__username', 'user__email', 'event_type')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(DailyBehaviorSnapshot)
class DailyBehaviorSnapshotAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'date', 'momentum_score', 'burnout_risk',
        'consistency_score', 'tasks_completed', 'identity_type',
    )
    list_filter = ('date', 'identity_type')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('id', 'created_at')
    ordering = ('-date',)


@admin.register(BehavioralInsight)
class BehavioralInsightAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'insight_type', 'title', 'priority',
        'confidence', 'is_active', 'created_at',
    )
    list_filter = ('insight_type', 'priority', 'is_active', 'tone')
    search_fields = ('user__username', 'title', 'description')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(BehaviorPattern)
class BehaviorPatternAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'pattern_type', 'occurrences',
        'is_active', 'first_detected', 'last_detected',
    )
    list_filter = ('pattern_type', 'is_active')
    search_fields = ('user__username', 'description')
    readonly_fields = ('id', 'first_detected', 'last_detected')
    ordering = ('-last_detected',)


@admin.register(AdaptiveChange)
class AdaptiveChangeAdmin(admin.ModelAdmin):
    list_display = (
        'user', 'change_type', 'confidence',
        'applied', 'reverted', 'created_at',
    )
    list_filter = ('change_type', 'applied', 'reverted')
    search_fields = ('user__username', 'description')
    readonly_fields = ('id', 'created_at', 'applied_at')
    ordering = ('-created_at',)
