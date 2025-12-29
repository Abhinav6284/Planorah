from django.contrib import admin
from .models import Plan


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'price_inr', 'validity_days', 'roadmap_limit', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'display_name']
    readonly_fields = ['created_at', 'updated_at']

