"""
REST API views for the React Admin Panel.
All endpoints require JWT authentication AND is_staff=True.
URL prefix: /api/admin/
"""
from decimal import Decimal
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication

from saas_admin import services
from saas_admin.models import FeatureFlag, AdminLog
from users.models import CustomUser
from subscriptions.models import Subscription
from billing.models import Payment
from plans.models import Plan


def staff_required(fn):
    """Decorator that wraps a view to require is_staff=True with JWT auth."""
    @api_view(['GET', 'POST', 'DELETE', 'PATCH'])
    @authentication_classes([JWTAuthentication])
    @permission_classes([IsAuthenticated])
    def wrapper(request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({'detail': 'Staff access required.'}, status=status.HTTP_403_FORBIDDEN)
        return fn(request, *args, **kwargs)
    return wrapper


# ─── Auth helper ─────────────────────────────────────────────────────────────

@api_view(['GET', 'PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def me(request):
    """Return or update current admin user info."""
    if not request.user.is_staff:
        return Response({'detail': 'Staff access required.'}, status=status.HTTP_403_FORBIDDEN)
    user = request.user

    if request.method == 'PATCH':
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name  = request.data.get('last_name',  user.last_name)
        user.email      = request.data.get('email',      user.email)
        user.save(update_fields=['first_name', 'last_name', 'email'])

    return Response({
        'id':       user.id,
        'name':     f'{user.first_name} {user.last_name}'.strip() or user.username,
        'email':    user.email,
        'role':     'superadmin' if user.is_superuser else 'admin',
        'username': user.username,
    })


# ─── Dashboard / KPI Stats ───────────────────────────────────────────────────

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def stats(request):
    """Overview KPI metrics for the dashboard."""
    if not request.user.is_staff:
        return Response({'detail': 'Staff access required.'}, status=status.HTTP_403_FORBIDDEN)
    metrics = services.get_overview_metrics()
    return Response(metrics)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def analytics(request):
    """Chart data: signups, DAU, revenue, subscription growth."""
    if not request.user.is_staff:
        return Response({'detail': 'Staff access required.'}, status=status.HTTP_403_FORBIDDEN)
    months = int(request.GET.get('months', 12))
    days = int(request.GET.get('days', 30))

    revenue_chart = services.get_revenue_chart_data(months=months)
    signup_chart = services.get_signup_chart_data(days=days)
    dau_chart = services.get_dau_chart_data(days=days)
    sub_growth = services.get_subscription_growth_data(months=months)
    revenue_metrics = services.get_revenue_metrics()
    product_insights = services.get_product_insights()

    return Response({
        'revenue_chart': revenue_chart,
        'signup_chart': signup_chart,
        'dau_chart': dau_chart,
        'sub_growth': sub_growth,
        'mrr': revenue_metrics['mrr'],
        'arr': revenue_metrics['arr'],
        'total_revenue': revenue_metrics['total_revenue'],
        'churn_rate': revenue_metrics['churn_rate'],
        'conversion_rate': revenue_metrics['conversion_rate'],
        'plan_breakdown': product_insights['plan_breakdown'],
    })


# ─── User Management ─────────────────────────────────────────────────────────

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def users_list(request):
    """Paginated list of all users with optional search/filter."""
    if not request.user.is_staff:
        return Response({'detail': 'Staff access required.'}, status=status.HTTP_403_FORBIDDEN)

    search = request.GET.get('q', '').strip()
    status_filter = request.GET.get('status', '')
    plan_filter = request.GET.get('plan', '')
    page = max(1, int(request.GET.get('page', 1)))
    page_size = max(1, int(request.GET.get('page_size', 20)))

    qs = services.get_users_queryset(search, status_filter, plan_filter)
    total = qs.count()
    offset = (page - 1) * page_size
    users = qs[offset: offset + page_size]

    results = []
    for u in users:
        current_plan = services.get_user_current_plan(u)
        try:
            xp = u.profile.xp_points
            country = getattr(u.profile, 'country', '') or ''
        except Exception:
            xp = 0
            country = ''
        results.append({
            'id': u.id,
            'name': f'{u.first_name} {u.last_name}'.strip() or u.username,
            'email': u.email,
            'username': u.username,
            'status': u.status,
            'is_active': u.is_active,
            'is_staff': u.is_staff,
            'plan': current_plan,
            'xp': xp,
            'country': country,
            'joined_at': u.created_at.strftime('%Y-%m-%d') if u.created_at else '',
            'last_login': u.last_login.strftime('%Y-%m-%d') if u.last_login else 'Never',
        })

    return Response({
        'results': results,
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': (total + page_size - 1) // page_size,
    })


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def user_detail(request, user_id):
    """Full profile for a single user."""
    if not request.user.is_staff:
        return Response({'detail': 'Staff access required.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        detail = services.get_user_detail(user_id)
    except CustomUser.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    u = detail['user']
    try:
        xp = u.profile.xp_points
        streak = u.profile.streak_count
        country = getattr(u.profile, 'country', '') or ''
    except Exception:
        xp = 0
        streak = 0
        country = ''

    subs = []
    for s in detail['subscriptions']:
        subs.append({
            'id': s.id,
            'plan': s.plan.display_name,
            'status': s.status,
            'start_date': s.start_date.strftime('%Y-%m-%d') if s.start_date else '',
            'end_date': s.end_date.strftime('%Y-%m-%d') if s.end_date else '',
            'days_remaining': s.days_remaining if hasattr(s, 'days_remaining') else 0,
        })

    payments = []
    for p in detail['payments']:
        payments.append({
            'id': p.id,
            'amount': float(p.amount),
            'status': p.status,
            'date': p.created_at.strftime('%Y-%m-%d') if p.created_at else '',
            'plan': p.plan.display_name if p.plan else '',
        })

    return Response({
        'id': u.id,
        'name': f'{u.first_name} {u.last_name}'.strip() or u.username,
        'email': u.email,
        'username': u.username,
        'status': u.status,
        'is_active': u.is_active,
        'is_staff': u.is_staff,
        'plan': services.get_user_current_plan(u),
        'xp': xp,
        'streak': streak,
        'country': country,
        'joined_at': u.created_at.strftime('%Y-%m-%d') if u.created_at else '',
        'last_login': u.last_login.strftime('%Y-%m-%d') if u.last_login else 'Never',
        'total_paid': detail['total_paid'],
        'subscriptions': subs,
        'payments': payments,
    })


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def user_action(request, user_id):
    """Suspend, enable, or delete a user."""
    if not request.user.is_staff:
        return Response({'detail': 'Staff access required.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        user = CustomUser.objects.get(pk=user_id)
    except CustomUser.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    action = request.data.get('action')
    ip = services.get_ip(request)

    if action == 'suspend':
        services.disable_user(user, request.user, ip)
        return Response({'detail': f'User {user.email} suspended.'})
    elif action == 'enable':
        services.enable_user(user, request.user, ip)
        return Response({'detail': f'User {user.email} re-enabled.'})
    elif action == 'delete':
        email = user.email
        services.delete_user(user, request.user, ip)
        return Response({'detail': f'User {email} deleted.'})
    else:
        return Response({'detail': 'Unknown action.'}, status=status.HTTP_400_BAD_REQUEST)


# ─── Subscription Management ─────────────────────────────────────────────────

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def subscriptions_list(request):
    """Paginated list of all subscriptions."""
    if not request.user.is_staff:
        return Response({'detail': 'Staff access required.'}, status=status.HTTP_403_FORBIDDEN)

    status_filter = request.GET.get('status', '')
    plan_filter = request.GET.get('plan', '')
    search = request.GET.get('q', '').strip()
    page = max(1, int(request.GET.get('page', 1)))
    page_size = max(1, int(request.GET.get('page_size', 20)))

    qs = services.get_subscriptions_queryset(status_filter, plan_filter, search)
    total = qs.count()
    offset = (page - 1) * page_size
    subs = qs[offset: offset + page_size]

    now = timezone.now()
    results = []
    for s in subs:
        # Collect recent payments for this subscription's user
        payment_history = []
        recent_payments = Payment.objects.filter(
            user=s.user, plan=s.plan
        ).order_by('-created_at')[:5]
        for p in recent_payments:
            payment_history.append({
                'id': p.id,
                'date': p.created_at.strftime('%Y-%m-%d') if p.created_at else '',
                'amount': float(p.amount),
                'status': p.status,
            })

        results.append({
            'id': s.id,
            'user_name': f'{s.user.first_name} {s.user.last_name}'.strip() or s.user.username,
            'user_email': s.user.email,
            'plan': s.plan.display_name,
            'plan_key': s.plan.name,
            'status': s.status,
            'billing_cycle': 'monthly' if s.plan.validity_days <= 31 else 'annual',
            'amount': round(float(s.plan.price_inr) / s.plan.validity_days * 30, 2) if s.plan.validity_days > 0 else 0,
            'start_date': s.start_date.strftime('%Y-%m-%d') if s.start_date else '',
            'end_date': s.end_date.strftime('%Y-%m-%d') if s.end_date else '',
            'next_billing_date': s.end_date.strftime('%Y-%m-%d') if s.end_date else '',
            'mrr': round(float(s.plan.price_inr) / s.plan.validity_days * 30, 2) if s.plan.validity_days > 0 else 0,
            'payment_history': payment_history,
        })

    # Summary counts
    active_count = Subscription.objects.filter(status='active', end_date__gte=now).count()
    canceled_count = Subscription.objects.filter(status='cancelled').count()
    grace_count = Subscription.objects.filter(status='grace').count()

    # MRR
    active_subs = Subscription.objects.filter(status='active', end_date__gte=now).select_related('plan')
    mrr = 0.0
    for sub in active_subs:
        if sub.plan.validity_days > 0:
            mrr += float(sub.plan.price_inr) / sub.plan.validity_days * 30

    return Response({
        'results': results,
        'total': total,
        'page': page,
        'page_size': page_size,
        'total_pages': (total + page_size - 1) // page_size,
        'summary': {
            'active': active_count,
            'cancelled': canceled_count,
            'grace': grace_count,
            'mrr': round(mrr, 2),
            'arr': round(mrr * 12, 2),
        },
    })


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def subscription_action(request, sub_id):
    """Cancel or extend a subscription."""
    if not request.user.is_staff:
        return Response({'detail': 'Staff access required.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        sub = Subscription.objects.select_related('user', 'plan').get(pk=sub_id)
    except Subscription.DoesNotExist:
        return Response({'detail': 'Subscription not found.'}, status=status.HTTP_404_NOT_FOUND)

    action = request.data.get('action')
    ip = services.get_ip(request)

    if action == 'cancel':
        services.cancel_subscription(sub, request.user, ip)
        return Response({'detail': f'Subscription #{sub.id} cancelled.'})
    elif action == 'extend':
        days = int(request.data.get('days', 30))
        services.extend_subscription(sub, days, request.user, ip)
        return Response({'detail': f'Subscription #{sub.id} extended by {days} days.'})
    else:
        return Response({'detail': 'Unknown action.'}, status=status.HTTP_400_BAD_REQUEST)


# ─── Feature Flags ────────────────────────────────────────────────────────────

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def feature_flags(request):
    """List all feature flags."""
    if not request.user.is_staff:
        return Response({'detail': 'Staff access required.'}, status=status.HTTP_403_FORBIDDEN)
    flags = FeatureFlag.objects.order_by('key')
    results = []
    for f in flags:
        results.append({
            'id': f.id,
            'key': f.key,
            'label': f.name,
            'description': f.description,
            'enabled': f.is_enabled,
            'updated_at': f.updated_at.strftime('%Y-%m-%d %H:%M') if f.updated_at else '',
            'updated_by': f.updated_by.email if f.updated_by else None,
        })
    return Response({'results': results})


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def toggle_feature_flag(request, flag_id):
    """Toggle a feature flag on/off."""
    if not request.user.is_staff:
        return Response({'detail': 'Staff access required.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        flag = FeatureFlag.objects.get(pk=flag_id)
    except FeatureFlag.DoesNotExist:
        return Response({'detail': 'Flag not found.'}, status=status.HTTP_404_NOT_FOUND)
    ip = services.get_ip(request)
    services.toggle_feature_flag(flag, request.user, ip)
    return Response({'id': flag.id, 'key': flag.key, 'enabled': flag.is_enabled})


# ─── Admin Activity Logs ──────────────────────────────────────────────────────

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def activity_logs(request):
    """Recent admin activity log."""
    if not request.user.is_staff:
        return Response({'detail': 'Staff access required.'}, status=status.HTTP_403_FORBIDDEN)
    action_filter = request.GET.get('action', '')
    limit = int(request.GET.get('limit', 20))
    qs = services.get_admin_logs(action_filter)[:limit]
    results = []
    for log in qs:
        results.append({
            'id': log.id,
            'action': log.action,
            'action_display': log.get_action_display(),
            'admin': log.admin.email if log.admin else 'System',
            'target_user': log.target_user.email if log.target_user else None,
            'detail': log.detail,
            'created_at': log.created_at.strftime('%Y-%m-%d %H:%M') if log.created_at else '',
        })
    return Response({'results': results})
