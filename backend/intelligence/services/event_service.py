"""
BehaviorEventService — Central event tracking.
ALL behavioral events route through this service. Nothing is tracked elsewhere.
"""

import logging

from django.utils import timezone

from intelligence.constants import EVENT_TYPE_VALUES, EventType
from intelligence.models import BehaviorEvent

logger = logging.getLogger(__name__)


class BehaviorEventService:
    """Central reusable service for behavioral event tracking."""

    @staticmethod
    def track_event(user, event_type, metadata=None):
        """
        Record a single behavioral event.
        Everything routes through here.
        """
        if event_type not in EVENT_TYPE_VALUES:
            logger.warning("Unknown event type: %s", event_type)
            return None

        event = BehaviorEvent.objects.create(
            user=user,
            event_type=event_type,
            metadata=metadata or {},
        )
        return event

    @staticmethod
    def track_task_event(user, task, event_type):
        """Track a task-related event with full task context."""
        metadata = {
            'task_id': str(task.id),
            'task_title': task.title,
            'task_type': task.task_type,
            'difficulty': task.difficulty,
            'status': task.status,
            'estimated_minutes': task.estimated_minutes,
            'priority': task.priority,
        }
        # Include milestone info if available
        task_metadata = task.metadata or {}
        if task_metadata.get('milestone_id'):
            metadata['milestone_id'] = str(task_metadata['milestone_id'])
        if task_metadata.get('roadmap_id'):
            metadata['roadmap_id'] = str(task_metadata['roadmap_id'])

        return BehaviorEventService.track_event(user, event_type, metadata)

    @staticmethod
    def track_session_event(user, session, event_type):
        """Track a focus session event with session context."""
        metadata = {
            'session_id': str(session.id),
            'planned_minutes': session.planned_minutes,
            'actual_minutes': session.actual_minutes or 0,
            'status': session.status,
        }
        if session.task_id:
            metadata['task_id'] = str(session.task_id)
        if session.started_at:
            metadata['started_hour'] = session.started_at.hour

        return BehaviorEventService.track_event(user, event_type, metadata)

    @staticmethod
    def track_roadmap_event(user, roadmap, event_type):
        """Track a roadmap-related event with roadmap context."""
        metadata = {
            'roadmap_id': str(roadmap.id),
            'roadmap_title': roadmap.title,
        }
        if hasattr(roadmap, 'difficulty_level'):
            metadata['difficulty'] = roadmap.difficulty_level or ''
        if hasattr(roadmap, 'category'):
            metadata['category'] = roadmap.category or ''

        return BehaviorEventService.track_event(user, event_type, metadata)

    @staticmethod
    def get_recent_events(user, days=14, event_types=None):
        """Query recent behavioral events for a user."""
        cutoff = timezone.now() - timezone.timedelta(days=days)
        qs = BehaviorEvent.objects.filter(user=user, created_at__gte=cutoff)
        if event_types:
            qs = qs.filter(event_type__in=event_types)
        return qs.order_by('-created_at')

    @staticmethod
    def get_event_sequence(user, days=14):
        """
        Get event sequence for pattern analysis.
        Returns list of (event_type, created_at, metadata) tuples.
        """
        cutoff = timezone.now() - timezone.timedelta(days=days)
        events = (
            BehaviorEvent.objects
            .filter(user=user, created_at__gte=cutoff)
            .order_by('created_at')
            .values_list('event_type', 'created_at', 'metadata')
        )
        return list(events)

    @staticmethod
    def get_event_counts(user, days=14):
        """Get event counts by type for quick aggregation."""
        cutoff = timezone.now() - timezone.timedelta(days=days)
        from django.db.models import Count
        counts = (
            BehaviorEvent.objects
            .filter(user=user, created_at__gte=cutoff)
            .values('event_type')
            .annotate(count=Count('id'))
        )
        return {item['event_type']: item['count'] for item in counts}
