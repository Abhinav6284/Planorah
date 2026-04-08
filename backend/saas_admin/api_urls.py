from django.urls import path
from saas_admin import api_views

urlpatterns = [
    # Auth
    path('me/', api_views.me, name='admin_api_me'),

    # Dashboard stats
    path('stats/', api_views.stats, name='admin_api_stats'),
    path('analytics/', api_views.analytics, name='admin_api_analytics'),

    # Users
    path('users/', api_views.users_list, name='admin_api_users'),
    path('users/<int:user_id>/', api_views.user_detail, name='admin_api_user_detail'),
    path('users/<int:user_id>/action/', api_views.user_action, name='admin_api_user_action'),

    # Subscriptions
    path('subscriptions/', api_views.subscriptions_list, name='admin_api_subscriptions'),
    path('subscriptions/<int:sub_id>/action/', api_views.subscription_action, name='admin_api_subscription_action'),

    # Feature flags
    path('flags/', api_views.feature_flags, name='admin_api_flags'),
    path('flags/<int:flag_id>/toggle/', api_views.toggle_feature_flag, name='admin_api_flag_toggle'),

    # Activity logs
    path('logs/', api_views.activity_logs, name='admin_api_logs'),
]
