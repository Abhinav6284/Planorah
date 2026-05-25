"""
BehaviorLoopDetector — Detect repeated behavioral cycles.
Operates on event sequences. Uses reusable detection rules.
This is Planorah's biggest moat.
"""

import logging

from django.utils import timezone

from intelligence.constants import PATTERN_TYPES, THRESHOLDS, EventType
from intelligence.models import BehaviorPattern
from .event_service import BehaviorEventService

logger = logging.getLogger(__name__)


class BehaviorLoopDetector:
    """Detect recurring behavioral loops from user activity data."""

    def __init__(self, user, context=None, metrics=None):
        self.user = user
        self.context = context or {}
        self.metrics = metrics or {}

    def detect_all_loops(self):
        """Run all loop detectors. Returns list of detected loop dicts."""
        detectors = [
            self._detect_motivation_crash_loop,
            self._detect_avoidance_loop,
            self._detect_planning_addiction_loop,
            self._detect_fake_productivity_loop,
        ]

        loops = []
        for detector in detectors:
            try:
                result = detector()
                if result:
                    loops.append(result)
            except Exception as exc:
                logger.warning("Loop detector %s failed: %s", detector.__name__, exc)

        return loops

    def save_detected_loops(self, loops):
        """Save or update detected loops in BehaviorPattern model."""
        for loop in loops:
            pattern, created = BehaviorPattern.objects.get_or_create(
                user=self.user,
                pattern_type=loop['pattern_type'],
                is_active=True,
                defaults={
                    'description': loop['description'],
                    'detection_data': loop.get('evidence', {}),
                    'occurrences': 1,
                },
            )
            if not created:
                pattern.occurrences += 1
                pattern.description = loop['description']
                pattern.detection_data = loop.get('evidence', {})
                pattern.save(update_fields=[
                    'occurrences', 'description', 'detection_data', 'last_detected',
                ])

    def _detect_motivation_crash_loop(self):
        """
        Motivation Crash Loop:
        High effort → overload → burnout → inactivity → restart

        Detection: Look for inactivity gaps preceded by high activity periods.
        If this pattern repeats >= 2 times, flag as loop.
        """
        gaps = self.context.get('inactivity_gaps', [])
        burnout = self.metrics.get('burnout_risk', 0)
        sessions_count = self.context.get('sessions_count', 0)

        # Need at least some data
        if sessions_count < 3:
            return None

        # Count significant gaps (>= 2 days)
        significant_gaps = [g for g in gaps if g >= 2]

        if len(significant_gaps) >= 2 and burnout >= THRESHOLDS['burnout_moderate']:
            return {
                'pattern_type': 'motivation_crash',
                'description': (
                    'Your execution pattern shows repeated cycles of high effort '
                    'followed by burnout and inactivity gaps. This suggests cognitive '
                    'overload is interrupting your momentum.'
                ),
                'evidence': {
                    'inactivity_gaps': significant_gaps,
                    'burnout_risk': burnout,
                    'sessions_count': sessions_count,
                    'gap_count': len(significant_gaps),
                },
                'confidence': min(85, 50 + len(significant_gaps) * 10 + (burnout - 50)),
            }

        # Single gap with high burnout is a warning
        if len(significant_gaps) >= 1 and burnout >= THRESHOLDS['burnout_high']:
            return {
                'pattern_type': 'motivation_crash',
                'description': (
                    'High effort followed by an inactivity gap — early signs of a '
                    'motivation crash cycle. Reducing session intensity may prevent it.'
                ),
                'evidence': {
                    'inactivity_gaps': significant_gaps,
                    'burnout_risk': burnout,
                },
                'confidence': min(65, 40 + burnout // 3),
            }

        return None

    def _detect_avoidance_loop(self):
        """
        Avoidance Loop:
        Hard task opened → task skipped → easier task completed

        Detection: Hard tasks skipped significantly more than easy tasks.
        """
        diff_dist = self.context.get('difficulty_distribution', {})
        hard = diff_dist.get('hard', {})
        easy = diff_dist.get('easy', {})

        hard_total = hard.get('total', 0)
        hard_skipped = hard.get('skipped', 0)
        easy_total = easy.get('total', 0)
        easy_skipped = easy.get('skipped', 0)

        if hard_total < 2:
            return None

        hard_skip_rate = (hard_skipped / max(hard_total, 1)) * 100
        easy_skip_rate = (easy_skipped / max(easy_total, 1)) * 100

        skip_diff = hard_skip_rate - easy_skip_rate

        if skip_diff >= THRESHOLDS['avoidance_skip_diff'] and hard_skip_rate >= 40:
            easy_completed = easy.get('completed', 0)
            return {
                'pattern_type': 'avoidance',
                'description': (
                    f'Hard tasks are being skipped {hard_skip_rate:.0f}% of the time '
                    f'while easy tasks are completed more often. This suggests difficulty '
                    f'avoidance — try breaking hard tasks into smaller steps.'
                ),
                'evidence': {
                    'hard_skip_rate': round(hard_skip_rate, 1),
                    'easy_skip_rate': round(easy_skip_rate, 1),
                    'hard_total': hard_total,
                    'hard_skipped': hard_skipped,
                    'easy_completed': easy_completed,
                    'skip_differential': round(skip_diff, 1),
                },
                'confidence': min(90, 50 + int(skip_diff)),
            }

        return None

    def _detect_planning_addiction_loop(self):
        """
        Planning Addiction Loop:
        Roadmap edits/switches → low execution

        Detection: High roadmap events relative to task completion.
        """
        event_counts = BehaviorEventService.get_event_counts(self.user, days=14)

        roadmap_events = (
            event_counts.get(EventType.ROADMAP_OPENED, 0)
            + event_counts.get(EventType.ROADMAP_SWITCHED, 0)
            + event_counts.get(EventType.ROADMAP_PROGRESS_UPDATED, 0)
        )
        task_completions = event_counts.get(EventType.TASK_COMPLETED, 0)

        # Also use context data as fallback
        completed = self.context.get('recent_completed', 0)
        task_completions = max(task_completions, completed)

        if roadmap_events < 3:
            return None

        if task_completions == 0 and roadmap_events >= 3:
            ratio = float('inf')
        else:
            ratio = roadmap_events / max(task_completions, 1)

        threshold = THRESHOLDS['planning_addiction_ratio']

        if ratio >= threshold and roadmap_events >= 4:
            return {
                'pattern_type': 'planning_addiction',
                'description': (
                    'You have interacted with roadmaps ' + str(roadmap_events) + ' times but only '
                    'completed ' + str(task_completions) + ' tasks. Planning feels productive, '
                    'but execution is where real progress happens.'
                ),
                'evidence': {
                    'roadmap_events': roadmap_events,
                    'task_completions': task_completions,
                    'ratio': round(ratio, 1) if ratio != float('inf') else 'inf',
                },
                'confidence': min(80, 45 + roadmap_events * 4),
            }

        return None

    def _detect_fake_productivity_loop(self):
        """
        Fake Productivity Loop:
        High app usage (sessions) → low meaningful completion

        Detection: Many sessions but low task completion rate.
        """
        sessions_count = self.context.get('sessions_count', 0)
        completed = self.context.get('recent_completed', 0)
        completion_rate = self.context.get('completion_rate', 0)

        session_threshold = THRESHOLDS['fake_productivity_session_threshold']
        completion_threshold = THRESHOLDS['fake_productivity_completion_threshold']

        if sessions_count < session_threshold:
            return None

        if completion_rate <= completion_threshold and sessions_count >= session_threshold:
            return {
                'pattern_type': 'fake_productivity',
                'description': (
                    'You have logged ' + str(sessions_count) + ' focus sessions but your completion '
                    'rate is only ' + format(completion_rate, '.0f') + '%. Sessions feel productive, but '
                    'tasks are not being finished. Try shorter, outcome-focused sessions.'
                ),
                'evidence': {
                    'sessions_count': sessions_count,
                    'tasks_completed': completed,
                    'completion_rate': completion_rate,
                },
                'confidence': min(80, 40 + sessions_count * 3),
            }

        return None
