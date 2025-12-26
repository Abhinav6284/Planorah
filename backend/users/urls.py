from django.urls import path
from . import views


urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('verify-otp/', views.verify_otp, name='verify-otp'),
    path('login/', views.login_user, name='login'),
    path('profile/', views.get_user_profile, name='user-profile'),
    path('resend-otp/', views.resend_otp, name='resend_otp'),
    path("request-password-reset/", views.request_password_reset,
         name="request_password_reset"),
    path("verify-reset-otp/", views.verify_reset_otp, name="verify_reset_otp"),
    path("reset-password/", views.reset_password, name="reset_password"),
    path('logout/', views.logout_view, name='logout'),
    path('update-profile/', views.update_user_profile, name='update-profile'),
    # Google OAuth
    path('google/login/', views.google_oauth_login, name='google-oauth-login'),
    # GitHub OAuth
    path('github/login/', views.github_oauth_login, name='github-oauth-login'),
    # Statistics
    path('statistics/', views.get_user_statistics, name='user-statistics'),
]


