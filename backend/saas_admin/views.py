"""
Views for the Planorah SaaS Admin Panel at /saas-admin/.
All views require is_staff=True (enforced by StaffOnlyMiddleware).
"""
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.core.paginator import Paginator
from django.views.decorators.http import require_POST
from django.http import JsonResponse
import json

from users.models import CustomUser
from subscriptions.models import Subscription
from plans.models import Plan
from saas_admin import services
from saas_admin.models import FeatureFlag, AdminLog


# ─────────────────────────────────────────────────────────────────────────────
# Dashboard Overview
# ─────────────────────────────────────────────────────────────────────────────

@staff_member_required(login_url="/admin/login/")
def dashboard(request):
    metrics = services.get_overview_metrics()
    signup_chart = services.get_signup_chart_data(days=30)
    revenue_chart = services.get_revenue_chart_data(months=12)

    # Recent users (last 10)
    recent_users = CustomUser.objects.select_related("profile").order_by("-created_at")[:8]
    for u in recent_users:
        u.current_plan = services.get_user_current_plan(u)

    # Recent payments
    from billing.models import Payment
    recent_payments = Payment.objects.filter(status="completed").select_related(
        "user", "plan"
    ).order_by("-created_at")[:8]

    return render(request, "saas_admin/dashboard.html", {
        "metrics": metrics,
        "signup_chart": json.dumps(signup_chart),
        "revenue_chart": json.dumps(revenue_chart),
        "recent_users": recent_users,
        "recent_payments": recent_payments,
        "page_title": "Dashboard",
        "active_nav": "dashboard",
    })


# ─────────────────────────────────────────────────────────────────────────────
# User Management
# ─────────────────────────────────────────────────────────────────────────────

@staff_member_required(login_url="/admin/login/")
def users_list(request):
    search = request.GET.get("q", "").strip()
    status_filter = request.GET.get("status", "")
    plan_filter = request.GET.get("plan", "")

    qs = services.get_users_queryset(search, status_filter, plan_filter)

    paginator = Paginator(qs, 25)
    page_obj = paginator.get_page(request.GET.get("page", 1))

    # Annotate each user with their current plan
    for u in page_obj:
        u.current_plan = services.get_user_current_plan(u)

    plans = Plan.objects.filter(is_active=True).order_by("price_inr")

    return render(request, "saas_admin/users.html", {
        "page_obj": page_obj,
        "search": search,
        "status_filter": status_filter,
        "plan_filter": plan_filter,
        "plans": plans,
        "total_count": qs.count(),
        "page_title": "User Management",
        "active_nav": "users",
    })


@staff_member_required(login_url="/admin/login/")
def user_detail(request, user_id):
    detail = services.get_user_detail(user_id)
    return render(request, "saas_admin/user_detail.html", {
        **detail,
        "page_title": f"User — {detail['user'].email}",
        "active_nav": "users",
    })


@staff_member_required(login_url="/admin/login/")
@require_POST
def user_action(request, user_id):
    """Handle all user-level actions via POST."""
    user = get_object_or_404(CustomUser, pk=user_id)
    action = request.POST.get("action")
    ip = services.get_ip(request)

    if action == "disable":
        services.disable_user(user, request.user, ip)
        messages.success(request, f"User {user.email} has been suspended.")

    elif action == "enable":
        services.enable_user(user, request.user, ip)
        messages.success(request, f"User {user.email} has been re-enabled.")

    elif action == "delete":
        email = user.email
        services.delete_user(user, request.user, ip)
        messages.warning(request, f"User {email} permanently deleted.")
        return redirect("saas_admin:users_list")

    elif action == "assign_plan":
        plan_id = request.POST.get("plan_id")
        plan = get_object_or_404(Plan, pk=plan_id)
        services.assign_plan_to_user(user, plan, request.user, ip)
        messages.success(request, f"Plan '{plan.display_name}' assigned to {user.email}.")

    elif action == "grant_trial":
        plan_id = request.POST.get("plan_id")
        trial_days = int(request.POST.get("trial_days", 14))
        plan = get_object_or_404(Plan, pk=plan_id)
        services.grant_trial(user, plan, trial_days, request.user, ip)
        messages.success(request, f"{trial_days}-day trial granted for {user.email}.")

    elif action == "reset_progress":
        services.reset_user_progress(user, request.user, ip)
        messages.info(request, f"Progress reset for {user.email}.")

    return redirect("saas_admin:user_detail", user_id=user_id)


# ─────────────────────────────────────────────────────────────────────────────
# Subscription Management
# ─────────────────────────────────────────────────────────────────────────────

@staff_member_required(login_url="/admin/login/")
def subscriptions_list(request):
    status_filter = request.GET.get("status", "")
    plan_filter = request.GET.get("plan", "")
    search = request.GET.get("q", "").strip()

    qs = services.get_subscriptions_queryset(status_filter, plan_filter, search)
    paginator = Paginator(qs, 25)
    page_obj = paginator.get_page(request.GET.get("page", 1))

    plans = Plan.objects.filter(is_active=True).order_by("price_inr")

    # Summary counts
    from django.utils import timezone
    now = timezone.now()
    counts = {
        "active": Subscription.objects.filter(status="active", end_date__gte=now).count(),
        "grace": Subscription.objects.filter(status="grace").count(),
        "expired": Subscription.objects.filter(status="expired").count(),
        "cancelled": Subscription.objects.filter(status="cancelled").count(),
    }

    return render(request, "saas_admin/subscriptions.html", {
        "page_obj": page_obj,
        "status_filter": status_filter,
        "plan_filter": plan_filter,
        "search": search,
        "plans": plans,
        "counts": counts,
        "total_count": qs.count(),
        "page_title": "Subscriptions",
        "active_nav": "subscriptions",
    })


@staff_member_required(login_url="/admin/login/")
@require_POST
def subscription_action(request, sub_id):
    sub = get_object_or_404(Subscription, pk=sub_id)
    action = request.POST.get("action")
    ip = services.get_ip(request)

    if action == "cancel":
        services.cancel_subscription(sub, request.user, ip)
        messages.warning(request, f"Subscription #{sub.id} cancelled.")

    elif action == "extend":
        days = int(request.POST.get("days", 30))
        services.extend_subscription(sub, days, request.user, ip)
        messages.success(request, f"Subscription #{sub.id} extended by {days} days.")

    return redirect("saas_admin:subscriptions_list")


# ─────────────────────────────────────────────────────────────────────────────
# Revenue Analytics
# ─────────────────────────────────────────────────────────────────────────────

@staff_member_required(login_url="/admin/login/")
def revenue(request):
    metrics = services.get_revenue_metrics()
    revenue_chart = services.get_revenue_chart_data(months=12)
    sub_chart = services.get_subscription_growth_data(months=12)

    return render(request, "saas_admin/revenue.html", {
        **metrics,
        "revenue_chart": json.dumps(revenue_chart),
        "sub_chart": json.dumps(sub_chart),
        "page_title": "Revenue Analytics",
        "active_nav": "revenue",
    })


# ─────────────────────────────────────────────────────────────────────────────
# Product Analytics
# ─────────────────────────────────────────────────────────────────────────────

@staff_member_required(login_url="/admin/login/")
def analytics(request):
    signup_chart = services.get_signup_chart_data(days=30)
    dau_chart = services.get_dau_chart_data(days=30)
    insights = services.get_product_insights()

    return render(request, "saas_admin/analytics.html", {
        **insights,
        "signup_chart": json.dumps(signup_chart),
        "dau_chart": json.dumps(dau_chart),
        "page_title": "Product Analytics",
        "active_nav": "analytics",
    })


# ─────────────────────────────────────────────────────────────────────────────
# Feature Flags
# ─────────────────────────────────────────────────────────────────────────────

@staff_member_required(login_url="/admin/login/")
def feature_flags(request):
    flags = FeatureFlag.objects.select_related("updated_by").order_by("key")
    return render(request, "saas_admin/feature_flags.html", {
        "flags": flags,
        "page_title": "Feature Flags",
        "active_nav": "flags",
    })


@staff_member_required(login_url="/admin/login/")
@require_POST
def toggle_flag(request, flag_id):
    flag = get_object_or_404(FeatureFlag, pk=flag_id)
    ip = services.get_ip(request)
    services.toggle_feature_flag(flag, request.user, ip)
    state = "enabled" if flag.is_enabled else "disabled"
    messages.success(request, f"Flag '{flag.key}' is now {state}.")
    return redirect("saas_admin:feature_flags")


@staff_member_required(login_url="/admin/login/")
@require_POST
def create_flag(request):
    key = request.POST.get("key", "").strip()
    name = request.POST.get("name", "").strip()
    description = request.POST.get("description", "").strip()
    if key and name:
        FeatureFlag.objects.get_or_create(
            key=key,
            defaults={"name": name, "description": description, "updated_by": request.user},
        )
        messages.success(request, f"Feature flag '{key}' created.")
    return redirect("saas_admin:feature_flags")


# ─────────────────────────────────────────────────────────────────────────────
# Admin Logs
# ─────────────────────────────────────────────────────────────────────────────

@staff_member_required(login_url="/admin/login/")
def admin_logs(request):
    action_filter = request.GET.get("action", "")
    qs = services.get_admin_logs(action_filter)
    paginator = Paginator(qs, 50)
    page_obj = paginator.get_page(request.GET.get("page", 1))

    return render(request, "saas_admin/logs.html", {
        "page_obj": page_obj,
        "action_filter": action_filter,
        "action_choices": AdminLog.ACTION_CHOICES,
        "page_title": "Admin Action Logs",
        "active_nav": "logs",
    })
