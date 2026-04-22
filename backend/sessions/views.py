from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from subscriptions.models import Subscription
from .models import SessionRequest, Notification
from .serializers import (
    SessionRequestCreateSerializer,
    SessionRequestListSerializer,
    NotificationSerializer,
)


def _get_active_subscription(user):
    return Subscription.get_active_subscription(user)


def _sessions_used_this_month(user, month_year):
    return SessionRequest.objects.filter(
        user=user,
        month_year=month_year,
    ).exclude(status=SessionRequest.STATUS_CANCELLED).count()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_session(request):
    subscription = _get_active_subscription(request.user)
    if subscription is None:
        return Response(
            {'error': 'No active subscription found.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    if subscription.plan.sessions_per_month == 0:
        return Response(
            {'error': 'Your plan does not include 1:1 sessions. Upgrade to Pro or Elite.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    month_year = datetime.now().strftime('%Y-%m')
    used = _sessions_used_this_month(request.user, month_year)
    if used >= subscription.plan.sessions_per_month:
        return Response(
            {'error': 'You have used all your sessions for this month. Upgrade for more.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    serializer = SessionRequestCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    session = serializer.save(
        user=request.user,
        month_year=month_year,
        status=SessionRequest.STATUS_REQUESTED,
    )
    return Response(SessionRequestListSerializer(session).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_sessions(request):
    sessions = SessionRequest.objects.filter(user=request.user)
    return Response(SessionRequestListSerializer(sessions, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def remaining_sessions(request):
    subscription = _get_active_subscription(request.user)
    limit = subscription.plan.sessions_per_month if subscription else 0
    month_year = datetime.now().strftime('%Y-%m')
    used = _sessions_used_this_month(request.user, month_year)
    return Response({
        'used': used,
        'limit': limit,
        'remaining': max(0, limit - used),
        'month': month_year,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    notifications = Notification.objects.filter(user=request.user, is_read=False)
    return Response(NotificationSerializer(notifications, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    try:
        notification = Notification.objects.get(id=pk, user=request.user)
    except Notification.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    notification.is_read = True
    notification.save(update_fields=['is_read'])
    return Response({'status': 'marked as read'})
