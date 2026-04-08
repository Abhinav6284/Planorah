from django.contrib import admin
from .models import Plan


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = [
        "display_name", "price_inr", "validity_days",
        "roadmap_limit", "project_limit_max", "resume_limit",
        "ats_scan_limit", "portfolio_analytics", "custom_subdomain", "is_active",
    ]
    list_filter = ["is_active", "portfolio_analytics", "custom_subdomain"]
    search_fields = ["name", "display_name"]
    readonly_fields = ["created_at", "updated_at"]
    list_editable = ["is_active"]
    ordering = ["price_inr"]
