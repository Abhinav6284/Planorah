from django.contrib import admin
from .models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = [
        "user", "plan", "status", "start_date", "end_date",
        "days_remaining", "roadmaps_used", "projects_used", "resumes_used",
    ]
    list_filter = ["status", "plan"]
    search_fields = ["user__username", "user__email"]
    readonly_fields = ["created_at", "updated_at"]
    raw_id_fields = ["user", "plan"]
    date_hierarchy = "created_at"
    actions = ["cancel_selected"]

    @admin.action(description="Cancel selected subscriptions")
    def cancel_selected(self, request, queryset):
        updated = queryset.update(status="cancelled")
        self.message_user(request, f"{updated} subscription(s) cancelled.")
