from django.contrib import admin
from saas_admin.models import FeatureFlag, AdminLog


@admin.register(FeatureFlag)
class FeatureFlagAdmin(admin.ModelAdmin):
    list_display = ("key", "name", "is_enabled", "updated_by", "updated_at")
    list_filter = ("is_enabled",)
    search_fields = ("key", "name", "description")
    readonly_fields = ("created_at", "updated_at")


@admin.register(AdminLog)
class AdminLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "admin", "action", "target_user", "ip_address")
    list_filter = ("action",)
    search_fields = ("admin__email", "target_user__email", "detail")
    readonly_fields = ("admin", "action", "target_user", "detail", "metadata", "ip_address", "created_at")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
