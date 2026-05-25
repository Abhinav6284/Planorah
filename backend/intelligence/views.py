"""
Behavioral Intelligence API views.
All endpoints follow the existing project pattern: function-based views with decorators.
"""

import logging
from datetime import datetime, timezone as dt_timezone

from django.core.cache import cache
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .constants import EVENT_TYPE_VALUES
from .models import AdaptiveChange, BehavioralInsight, BehaviorPattern, DailyBehaviorSnapshot
from .serializers import (
    AdaptiveChangeSerializer,
    BehavioralInsightSerializer,
    BehaviorPatternSerializer,
    DailyBehaviorSnapshotSerializer,
)
from .services.event_service import BehaviorEventService
from .services.orchestrator import IntelligenceOrchestrator

logger = logging.getLogger(__name__)

# Cache TTL: 15 minutes for intelligence payload
INTELLIGENCE_CACHE_TTL = 60 * 15


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def behavioral_intelligence(request):
    """
    Main endpoint: compute full behavioral intelligence payload.
    GET /api/intelligence/behavioral/

    Cached for 15 minutes per user to avoid expensive recomputation.
    Pass ?refresh=true to force recomputation.
    """
    user = request.user
    force_refresh = request.query_params.get('refresh', '').lower() == 'true'
    cache_key = f"intelligence:behavioral:{user.id}"

    if not force_refresh:
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

    try:
        orchestrator = IntelligenceOrchestrator(user)
        payload = orchestrator.compute_full_intelligence()
        cache.set(cache_key, payload, INTELLIGENCE_CACHE_TTL)
        return Response(payload)
    except Exception as exc:
        logger.error("Intelligence computation failed for user %s: %s", user.id, exc)
        return Response(
            {"error": "Failed to compute behavioral intelligence", "detail": str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def insight_list(request):
    """
    List active behavioral insights.
    GET /api/intelligence/insights/
    """
    insights = BehavioralInsight.objects.filter(
        user=request.user, is_active=True
    ).order_by('-created_at')[:20]
    serializer = BehavioralInsightSerializer(insights, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def insight_dismiss(request, pk):
    """
    Dismiss an insight.
    POST /api/intelligence/insights/<uuid:pk>/dismiss/
    """
    try:
        insight = BehavioralInsight.objects.get(id=pk, user=request.user)
    except BehavioralInsight.DoesNotExist:
        return Response({"error": "Insight not found"}, status=status.HTTP_404_NOT_FOUND)

    insight.is_active = False
    insight.dismissed_at = timezone.now()
    insight.save(update_fields=['is_active', 'dismissed_at'])
    return Response({"status": "dismissed"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adaptation_list(request):
    """
    List pending adaptations.
    GET /api/intelligence/adaptations/
    """
    adaptations = AdaptiveChange.objects.filter(
        user=request.user, applied=False, reverted=False
    ).order_by('-created_at')[:10]
    serializer = AdaptiveChangeSerializer(adaptations, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adaptation_apply(request, pk):
    """
    Apply an adaptation.
    POST /api/intelligence/adaptations/<uuid:pk>/apply/
    """
    try:
        change = AdaptiveChange.objects.get(id=pk, user=request.user)
    except AdaptiveChange.DoesNotExist:
        return Response({"error": "Adaptation not found"}, status=status.HTTP_404_NOT_FOUND)

    if change.applied:
        return Response({"error": "Already applied"}, status=status.HTTP_400_BAD_REQUEST)

    change.applied = True
    change.applied_at = timezone.now()
    change.save(update_fields=['applied', 'applied_at'])

    # Invalidate intelligence cache
    cache.delete(f"intelligence:behavioral:{request.user.id}")

    return Response({"status": "applied", "id": str(change.id)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adaptation_revert(request, pk):
    """
    Revert a previously applied adaptation.
    POST /api/intelligence/adaptations/<uuid:pk>/revert/
    """
    try:
        change = AdaptiveChange.objects.get(id=pk, user=request.user)
    except AdaptiveChange.DoesNotExist:
        return Response({"error": "Adaptation not found"}, status=status.HTTP_404_NOT_FOUND)

    if not change.applied:
        return Response({"error": "Not yet applied"}, status=status.HTTP_400_BAD_REQUEST)

    change.reverted = True
    change.save(update_fields=['reverted'])

    cache.delete(f"intelligence:behavioral:{request.user.id}")
    return Response({"status": "reverted", "id": str(change.id)})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_event(request):
    """
    Track a behavioral event from the frontend.
    POST /api/intelligence/events/

    Body: {"event_type": "...", "metadata": {...}}
    """
    event_type = request.data.get('event_type', '')
    metadata = request.data.get('metadata', {})

    if event_type not in EVENT_TYPE_VALUES:
        return Response(
            {"error": f"Invalid event type: {event_type}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    event = BehaviorEventService.track_event(request.user, event_type, metadata)
    if event:
        return Response({"status": "tracked", "id": str(event.id)}, status=status.HTTP_201_CREATED)
    return Response({"error": "Failed to track event"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def behavior_snapshots(request):
    """
    Get behavior snapshot history.
    GET /api/intelligence/snapshots/?days=30
    """
    days = int(request.query_params.get('days', 30))
    days = min(days, 90)

    snapshots = DailyBehaviorSnapshot.objects.filter(
        user=request.user,
    ).order_by('-date')[:days]

    serializer = DailyBehaviorSnapshotSerializer(snapshots, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def behavior_patterns(request):
    """
    Get detected behavioral patterns/loops.
    GET /api/intelligence/patterns/
    """
    patterns = BehaviorPattern.objects.filter(
        user=request.user, is_active=True
    ).order_by('-last_detected')[:10]

    serializer = BehaviorPatternSerializer(patterns, many=True)
    return Response(serializer.data)
