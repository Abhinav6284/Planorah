from django.contrib import admin
from .models import Portfolio, PortfolioProject, PortfolioAnalytics


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ['user', 'slug', 'status', 'custom_subdomain', 'created_at']
    list_filter = ['status']
    search_fields = ['user__username', 'slug', 'custom_subdomain']
    readonly_fields = ['created_at', 'updated_at', 'last_status_change']
    raw_id_fields = ['user']


@admin.register(PortfolioProject)
class PortfolioProjectAdmin(admin.ModelAdmin):
    list_display = ['portfolio', 'project', 'order', 'is_featured', 'is_visible']
    list_filter = ['is_featured', 'is_visible']
    raw_id_fields = ['portfolio', 'project']


@admin.register(PortfolioAnalytics)
class PortfolioAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['portfolio', 'date', 'page_views', 'unique_visitors']
    list_filter = ['date']
    raw_id_fields = ['portfolio']

