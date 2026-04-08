from django.urls import path
from saas_admin import views

app_name = "saas_admin"

urlpatterns = [
    # Dashboard overview
    path("", views.dashboard, name="dashboard"),

    # User management
    path("users/", views.users_list, name="users_list"),
    path("users/<int:user_id>/", views.user_detail, name="user_detail"),
    path("users/<int:user_id>/action/", views.user_action, name="user_action"),

    # Subscription management
    path("subscriptions/", views.subscriptions_list, name="subscriptions_list"),
    path("subscriptions/<int:sub_id>/action/", views.subscription_action, name="subscription_action"),

    # Revenue analytics
    path("revenue/", views.revenue, name="revenue"),

    # Product analytics
    path("analytics/", views.analytics, name="analytics"),

    # Feature flags
    path("flags/", views.feature_flags, name="feature_flags"),
    path("flags/<int:flag_id>/toggle/", views.toggle_flag, name="toggle_flag"),
    path("flags/create/", views.create_flag, name="create_flag"),

    # Admin action logs
    path("logs/", views.admin_logs, name="admin_logs"),
]
