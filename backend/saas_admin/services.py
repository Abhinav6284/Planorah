"""
Services layer for SaaS Admin Panel.
All analytics, aggregation, and business logic lives here — never raw ORM in views.
"""
from decimal import Decimal
from datetime import timedelta, date

from django.db.models import Count, Sum, Q, Avg
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone

from users.models import CustomUser, UserProfile, StreakLog
from subscriptions.models import Subscription
from billing.models import Payment
from plans.models import Plan


# ─────────────────────────────────────────────────────────────────────────────
# Overview / Dashboard Metrics
# ─────────────────────────────────────────────────────────────────────────────

def get_overview_metrics() -> dict:
    """Return high-level numbers for the dashboard header cards."""
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_users = CustomUser.objects.filter(is_active=True).count()

    active_users = (
        StreakLog.objects.filter(activity_date__gte=week_ago.date())
        .values("user")
        .distinct()
        .count()
    )

    total_roadmaps = _safe_count("roadmap_ai.models", "Roadmap")
    tasks_completed = _safe_count_filter(
        "dashboard.models", "ExecutionTask", {"status": "completed"}
    )

    active_subs = Subscription.objects.filter(
        status="active", end_date__gte=now
    ).select_related("plan")

    active_subscriptions = active_subs.count()

    mrr = Decimal("0.00")
    for sub in active_subs:
        if sub.plan.validity_days > 0:
            mrr += Decimal(str(sub.plan.price_inr)) / Decimal(str(sub.plan.validity_days)) * 30

    total_revenue = (
        Payment.objects.filter(status="completed").aggregate(t=Sum("amount"))["t"]
        or Decimal("0.00")
    )

    new_users_month = CustomUser.objects.filter(created_at__gte=month_start).count()

    # User growth vs last month
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)
    last_month_users = CustomUser.objects.filter(
        created_at__gte=last_month_start, created_at__lt=month_start
    ).count()
    user_growth_pct = _pct_change(last_month_users, new_users_month)

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_roadmaps": total_roadmaps,
        "tasks_completed": tasks_completed,
        "active_subscriptions": active_subscriptions,
        "mrr": round(float(mrr), 2),
        "total_revenue": round(float(total_revenue), 2),
        "new_users_month": new_users_month,
        "user_growth_pct": user_growth_pct,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Chart Data
# ─────────────────────────────────────────────────────────────────────────────

def get_signup_chart_data(days: int = 30) -> dict:
    """Daily user sign-ups for a line chart."""
    cutoff = (timezone.now() - timedelta(days=days)).date()
    qs = (
        CustomUser.objects.filter(created_at__date__gte=cutoff)
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )
    data = {str(r["day"]): r["count"] for r in qs}
    labels = []
    values = []
    for i in range(days):
        d = str((timezone.now() - timedelta(days=days - 1 - i)).date())
        labels.append(d[5:])  # MM-DD
        values.append(data.get(d, 0))
    return {"labels": labels, "values": values}


def get_dau_chart_data(days: int = 30) -> dict:
    """Daily Active Users derived from StreakLog activity dates."""
    cutoff = (timezone.now() - timedelta(days=days)).date()
    qs = (
        StreakLog.objects.filter(activity_date__gte=cutoff)
        .values("activity_date")
        .annotate(count=Count("user", distinct=True))
        .order_by("activity_date")
    )
    data = {str(r["activity_date"]): r["count"] for r in qs}
    labels, values = [], []
    for i in range(days):
        d = str((timezone.now() - timedelta(days=days - 1 - i)).date())
        labels.append(d[5:])
        values.append(data.get(d, 0))
    return {"labels": labels, "values": values}


def get_revenue_chart_data(months: int = 12) -> dict:
    """Monthly revenue (completed payments) for a bar chart."""
    cutoff = timezone.now() - timedelta(days=months * 31)
    qs = (
        Payment.objects.filter(status="completed", created_at__gte=cutoff)
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(total=Sum("amount"))
        .order_by("month")
    )
    data = {r["month"].strftime("%Y-%m"): float(r["total"]) for r in qs}
    labels, values = [], []
    for i in range(months):
        month = timezone.now().replace(day=1) - timedelta(days=(months - 1 - i) * 30)
        key = month.strftime("%Y-%m")
        labels.append(month.strftime("%b %Y"))
        values.append(data.get(key, 0))
    return {"labels": labels, "values": values}


def get_subscription_growth_data(months: int = 12) -> dict:
    """New subscriptions per month."""
    cutoff = timezone.now() - timedelta(days=months * 31)
    qs = (
        Subscription.objects.filter(created_at__gte=cutoff)
        .annotate(month=TruncMonth("created_at"))
        .values("month")
        .annotate(count=Count("id"))
        .order_by("month")
    )
    data = {r["month"].strftime("%Y-%m"): r["count"] for r in qs}
    labels, values = [], []
    for i in range(months):
        month = timezone.now().replace(day=1) - timedelta(days=(months - 1 - i) * 30)
        key = month.strftime("%Y-%m")
        labels.append(month.strftime("%b %Y"))
        values.append(data.get(key, 0))
    return {"labels": labels, "values": values}


# ─────────────────────────────────────────────────────────────────────────────
# User Management
# ─────────────────────────────────────────────────────────────────────────────

def get_users_queryset(search: str = "", status: str = "", plan_key: str = ""):
    """
    Return an annotated queryset of CustomUser with subscription info.
    Supports search (name/email), status filter, and plan filter.
    """
    qs = CustomUser.objects.select_related("profile").prefetch_related(
        "subscriptions__plan"
    )

    if search:
        qs = qs.filter(
            Q(email__icontains=search)
            | Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
            | Q(username__icontains=search)
        )

    if status == "active":
        qs = qs.filter(status="active", is_active=True)
    elif status == "suspended":
        qs = qs.filter(status="suspended")
    elif status == "pending":
        qs = qs.filter(status="pending")

    if plan_key:
        subscribed_ids = Subscription.objects.filter(
            plan__name=plan_key, status="active"
        ).values_list("user_id", flat=True)
        qs = qs.filter(id__in=subscribed_ids)

    return qs.order_by("-created_at")


def get_user_detail(user_id: int) -> dict:
    """Return full profile + subscription + payment history for one user."""
    user = (
        CustomUser.objects.select_related("profile")
        .prefetch_related("subscriptions__plan", "payments__plan")
        .get(pk=user_id)
    )
    subscriptions = list(user.subscriptions.all().order_by("-created_at"))
    payments = list(user.payments.all().order_by("-created_at")[:20])
    active_sub = next((s for s in subscriptions if s.status == "active"), None)

    total_paid = sum(float(p.amount) for p in user.payments.filter(status="completed"))

    return {
        "user": user,
        "subscriptions": subscriptions,
        "payments": payments,
        "active_sub": active_sub,
        "total_paid": round(total_paid, 2),
        "plans": Plan.objects.filter(is_active=True).order_by("price_inr"),
    }


def get_user_current_plan(user) -> str:
    """Return plan display name for a user, or 'Free' if none."""
    sub = Subscription.objects.filter(user=user, status="active").select_related("plan").first()
    if sub:
        return sub.plan.display_name
    return "Free"


# ─────────────────────────────────────────────────────────────────────────────
# Subscription Management
# ─────────────────────────────────────────────────────────────────────────────

def get_subscriptions_queryset(status: str = "", plan_key: str = "", search: str = ""):
    """Paginated subscriptions list with filters."""
    qs = Subscription.objects.select_related("user", "plan").order_by("-created_at")

    if status:
        qs = qs.filter(status=status)
    if plan_key:
        qs = qs.filter(plan__name=plan_key)
    if search:
        qs = qs.filter(
            Q(user__email__icontains=search) | Q(user__username__icontains=search)
        )
    return qs


# ─────────────────────────────────────────────────────────────────────────────
# Revenue Analytics
# ─────────────────────────────────────────────────────────────────────────────

def get_revenue_metrics() -> dict:
    """MRR, ARR, total revenue, churn rate, conversion rate."""
    now = timezone.now()

    # MRR
    active_subs = Subscription.objects.filter(
        status="active", end_date__gte=now
    ).select_related("plan")
    mrr = Decimal("0.00")
    for sub in active_subs:
        if sub.plan.validity_days > 0:
            mrr += Decimal(str(sub.plan.price_inr)) / Decimal(str(sub.plan.validity_days)) * 30

    arr = mrr * 12

    # Total revenue
    total_revenue = (
        Payment.objects.filter(status="completed").aggregate(t=Sum("amount"))["t"]
        or Decimal("0.00")
    )

    # Revenue this month
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    revenue_this_month = (
        Payment.objects.filter(status="completed", created_at__gte=month_start)
        .aggregate(t=Sum("amount"))["t"]
        or Decimal("0.00")
    )

    # Churn rate: subscriptions cancelled this month / active at start of month
    cancelled_this_month = Subscription.objects.filter(
        status="cancelled", updated_at__gte=month_start
    ).count()
    active_at_start = Subscription.objects.filter(
        created_at__lt=month_start, status__in=["active", "grace"]
    ).count()
    churn_rate = (
        round(cancelled_this_month / active_at_start * 100, 1)
        if active_at_start > 0
        else 0.0
    )

    # Conversion rate: users with at least one paid subscription / total users
    paid_user_ids = Subscription.objects.values_list("user_id", flat=True).distinct()
    total_users = CustomUser.objects.filter(is_active=True).count()
    conversion_rate = (
        round(paid_user_ids.count() / total_users * 100, 1) if total_users > 0 else 0.0
    )

    # Revenue by plan
    revenue_by_plan = (
        Payment.objects.filter(status="completed")
        .values("plan__display_name")
        .annotate(total=Sum("amount"), count=Count("id"))
        .order_by("-total")
    )

    # Recent payments
    recent_payments = Payment.objects.filter(status="completed").select_related(
        "user", "plan"
    ).order_by("-created_at")[:20]

    return {
        "mrr": round(float(mrr), 2),
        "arr": round(float(arr), 2),
        "total_revenue": round(float(total_revenue), 2),
        "revenue_this_month": round(float(revenue_this_month), 2),
        "churn_rate": churn_rate,
        "conversion_rate": conversion_rate,
        "revenue_by_plan": list(revenue_by_plan),
        "recent_payments": recent_payments,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Product Insights
# ─────────────────────────────────────────────────────────────────────────────

def get_product_insights() -> dict:
    """Top users, drop-off users, roadmaps per user breakdown."""
    # Top users by XP
    top_users = (
        UserProfile.objects.select_related("user")
        .order_by("-xp_points")[:10]
    )

    # Drop-off: users with no StreakLog in last 14 days who previously had activity
    two_weeks_ago = (timezone.now() - timedelta(days=14)).date()
    active_user_ids = StreakLog.objects.filter(
        activity_date__gte=two_weeks_ago
    ).values_list("user_id", flat=True)

    ever_active_ids = StreakLog.objects.values_list("user_id", flat=True).distinct()

    dropout_users = CustomUser.objects.filter(
        id__in=ever_active_ids, is_active=True
    ).exclude(id__in=active_user_ids).select_related("profile")[:20]

    # Roadmap count distribution
    roadmap_stats = _safe_roadmap_stats()

    # Subscription plan breakdown
    plan_breakdown = (
        Subscription.objects.filter(status="active")
        .values("plan__display_name", "plan__name")
        .annotate(count=Count("id"))
        .order_by("-count")
    )

    return {
        "top_users": top_users,
        "dropout_users": dropout_users,
        "roadmap_stats": roadmap_stats,
        "plan_breakdown": list(plan_breakdown),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Admin Actions
# ─────────────────────────────────────────────────────────────────────────────

def assign_plan_to_user(user, plan, admin_user, request_ip=None) -> Subscription:
    """
    Immediately assign a plan to a user.
    Cancels any existing active subscription first.
    Creates payment record (manual, ₹0) + new Subscription.
    """
    from datetime import timedelta
    from django.utils import timezone

    # Cancel existing active subscriptions
    Subscription.objects.filter(user=user, status__in=["active", "grace"]).update(
        status="cancelled"
    )

    # Create new subscription
    now = timezone.now()
    sub = Subscription.objects.create(
        user=user,
        plan=plan,
        status="active",
        start_date=now,
        end_date=now + timedelta(days=plan.validity_days),
    )

    _log_action(
        admin=admin_user,
        action="plan_assigned",
        target_user=user,
        detail=f"Plan '{plan.display_name}' manually assigned.",
        metadata={"plan_id": plan.id, "subscription_id": sub.id},
        ip=request_ip,
    )
    return sub


def cancel_subscription(sub, admin_user, request_ip=None):
    """Cancel a subscription immediately."""
    sub.status = "cancelled"
    sub.save(update_fields=["status", "updated_at"])
    _log_action(
        admin=admin_user,
        action="subscription_cancelled",
        target_user=sub.user,
        detail=f"Subscription #{sub.id} ({sub.plan.display_name}) cancelled.",
        ip=request_ip,
    )


def extend_subscription(sub, days: int, admin_user, request_ip=None):
    """Extend a subscription's end_date by N days."""
    from datetime import timedelta
    sub.end_date += timedelta(days=days)
    if sub.grace_end_date:
        sub.grace_end_date += timedelta(days=days)
    sub.status = "active"
    sub.save(update_fields=["end_date", "grace_end_date", "status", "updated_at"])
    _log_action(
        admin=admin_user,
        action="subscription_extended",
        target_user=sub.user,
        detail=f"Subscription #{sub.id} extended by {days} days.",
        metadata={"days": days},
        ip=request_ip,
    )


def grant_trial(user, plan, trial_days: int, admin_user, request_ip=None) -> Subscription:
    """Give a user a free trial subscription."""
    from datetime import timedelta
    from django.utils import timezone

    Subscription.objects.filter(user=user, status__in=["active", "grace"]).update(
        status="cancelled"
    )

    now = timezone.now()
    sub = Subscription.objects.create(
        user=user,
        plan=plan,
        status="active",
        start_date=now,
        end_date=now + timedelta(days=trial_days),
    )
    _log_action(
        admin=admin_user,
        action="trial_granted",
        target_user=user,
        detail=f"{trial_days}-day trial on '{plan.display_name}' granted.",
        metadata={"plan_id": plan.id, "trial_days": trial_days},
        ip=request_ip,
    )
    return sub


def disable_user(user, admin_user, request_ip=None):
    user.status = "suspended"
    user.is_active = False
    user.save(update_fields=["status", "is_active", "updated_at"])
    _log_action(admin_user, "user_disabled", user, f"User {user.email} suspended.", ip=request_ip)


def enable_user(user, admin_user, request_ip=None):
    user.status = "active"
    user.is_active = True
    user.save(update_fields=["status", "is_active", "updated_at"])
    _log_action(admin_user, "user_enabled", user, f"User {user.email} re-enabled.", ip=request_ip)


def delete_user(user, admin_user, request_ip=None):
    from users.models import DeletedUser
    email = user.email
    _log_action(admin_user, "user_deleted", None, f"User {email} permanently deleted.", ip=request_ip)
    DeletedUser.objects.get_or_create(email=email)
    user.delete()


def reset_user_progress(user, admin_user, request_ip=None):
    """Reset XP, streak and task usage for a user."""
    try:
        profile = user.profile
        profile.xp_points = 0
        profile.streak_count = 0
        profile.last_study_date = None
        profile.save(update_fields=["xp_points", "streak_count", "last_study_date"])
    except Exception:
        pass
    _log_action(admin_user, "progress_reset", user, f"Progress reset for {user.email}.", ip=request_ip)


# ─────────────────────────────────────────────────────────────────────────────
# Feature Flags
# ─────────────────────────────────────────────────────────────────────────────

def toggle_feature_flag(flag, admin_user, request_ip=None):
    flag.is_enabled = not flag.is_enabled
    flag.updated_by = admin_user
    flag.save(update_fields=["is_enabled", "updated_at", "updated_by"])
    state = "enabled" if flag.is_enabled else "disabled"
    _log_action(
        admin_user,
        "flag_toggled",
        None,
        f"Feature flag '{flag.key}' {state}.",
        metadata={"flag_id": flag.id, "new_state": flag.is_enabled},
        ip=request_ip,
    )


def is_feature_enabled(key: str) -> bool:
    """Check if a feature flag is enabled. Used in application code."""
    from saas_admin.models import FeatureFlag
    try:
        return FeatureFlag.objects.get(key=key).is_enabled
    except FeatureFlag.DoesNotExist:
        return False


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────

def _log_action(admin, action, target_user=None, detail="", metadata=None, ip=None):
    from saas_admin.models import AdminLog
    AdminLog.objects.create(
        admin=admin,
        action=action,
        target_user=target_user,
        detail=detail,
        metadata=metadata or {},
        ip_address=ip,
    )


def _pct_change(old: float, new: float) -> float:
    if old == 0:
        return 100.0 if new > 0 else 0.0
    return round((new - old) / old * 100, 1)


def _safe_count(module_path: str, model_name: str) -> int:
    try:
        import importlib
        mod = importlib.import_module(module_path)
        return getattr(mod, model_name).objects.count()
    except Exception:
        return 0


def _safe_count_filter(module_path: str, model_name: str, filters: dict) -> int:
    try:
        import importlib
        mod = importlib.import_module(module_path)
        return getattr(mod, model_name).objects.filter(**filters).count()
    except Exception:
        return 0


def _safe_roadmap_stats() -> list:
    try:
        from roadmap_ai.models import Roadmap
        from django.db.models import Count
        return list(
            Roadmap.objects.values("user__email", "user__username")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )
    except Exception:
        return []


def get_admin_logs(action_filter: str = ""):
    from saas_admin.models import AdminLog
    qs = AdminLog.objects.select_related("admin", "target_user").order_by("-created_at")
    if action_filter:
        qs = qs.filter(action=action_filter)
    return qs


def get_ip(request) -> str:
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")
