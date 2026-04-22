from django.contrib import admin
from .models import Plan


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = [
        "display_name", "price_inr", "validity_days",
        "roadmap_limit", "has_project_management", "resume_full",
        "ats_scan_limit", "has_portfolio_live", "is_active",
    ]
    list_filter = ["is_active", "has_portfolio_live", "has_project_management"]
    search_fields = ["name", "display_name"]
    readonly_fields = ["created_at", "updated_at"]
    list_editable = ["is_active"]
    ordering = ["price_inr"]
