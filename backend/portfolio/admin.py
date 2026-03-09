from django.contrib import admin
from .models import Portfolio, PortfolioProject, PortfolioAnalytics, PortfolioEvent


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ['user', 'slug', 'status', 'is_published', 'custom_subdomain', 'created_at']
    list_filter = ['status', 'is_published', 'availability_status']
    search_fields = ['user__username', 'slug', 'custom_subdomain']
    readonly_fields = ['created_at', 'updated_at', 'last_status_change', 'published_at']
    raw_id_fields = ['user']


@admin.register(PortfolioProject)
class PortfolioProjectAdmin(admin.ModelAdmin):
    list_display = ['portfolio', 'project', 'student_project', 'order', 'is_featured', 'is_visible']
    list_filter = ['is_featured', 'is_visible']
    raw_id_fields = ['portfolio', 'project', 'student_project']


@admin.register(PortfolioAnalytics)
class PortfolioAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['portfolio', 'date', 'page_views', 'unique_visitors']
    list_filter = ['date']
    raw_id_fields = ['portfolio']


@admin.register(PortfolioEvent)
class PortfolioEventAdmin(admin.ModelAdmin):
    list_display = ['portfolio', 'event_type', 'created_at']
    list_filter = ['event_type', 'created_at']
    search_fields = ['portfolio__user__username', 'portfolio__slug']
    raw_id_fields = ['portfolio']

