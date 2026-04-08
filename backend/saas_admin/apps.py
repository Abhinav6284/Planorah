from django.apps import AppConfig


class SaasAdminConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "saas_admin"
    verbose_name = "SaaS Admin Panel"
