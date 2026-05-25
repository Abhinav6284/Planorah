"""
BehaviorAggregationService — Converts raw data into behavioral context.
Deterministic, reusable, centralized. NOT scattered across views.

Reuses existing models: ExecutionTask, FocusSession, UserStats, Streak.
"""

from datetime import timedelta
from collections import Counter

from django.db.models import Avg, Count, Sum, Q
from django.utils import timezone

from intelligence.constants import THRESHOLDS


class BehaviorAggregationService:
    """Aggregates raw user activity data into behavioral context."""

    def __init__(self, user, days=14):
        self.user = user
        self.days = days
        self._cache = {}
        self._now = timezone.now()
        self._cutoff = self._now - timedelta(days=days)
        self._prev_cutoff = self._now - timedelta(days=days * 2)

    def get_behavioral_context(self):
        """Main method: returns complete behavioral context dict."""
        if 'context' in self._cache:
            return self._cache['context']

        session_stats = self._get_session_stats()
        task_stats = self._get_task_stats()
        streak_info = self._get_streak_info()

        active_days = self._get_active_days()
        total_days = self.days

        context = {
            # Activity
            'active_days': active_days,
            'total_days': total_days,
            'active_days_ratio': round(active_days / max(total_days, 1), 2),

            # Sessions
            'avg_session_duration': session_stats['avg_duration'],
            'total_focus_minutes': session_stats['total_minutes'],
            'sessions_count': session_stats['count'],
            'session_intensity': session_stats['intensity'],

            # Tasks
            'completion_rate': task_stats['completion_rate'],
            'skip_rate': task_stats['skip_rate'],
            'recent_completed': task_stats['completed'],
            'recent_skipped': task_stats['skipped'],
            'recent_total': task_stats['total'],

            # Behavior signals
            'preferred_hours': self._get_preferred_hours(),
            'execution_velocity': self._get_execution_velocity(
                task_stats['completed'], active_days
            ),
            'hard_task_avoidance': task_stats['hard_skip_rate'] >= THRESHOLDS['hard_avoidance_threshold'],
            'hard_skip_rate': task_stats['hard_skip_rate'],
            'consistency_trend': self._get_consistency_trend(),
            'inactivity_gaps': self._get_inactivity_gaps(),

            # Distributions
            'task_type_distribution': task_stats['type_distribution'],
            'difficulty_distribution': task_stats['difficulty_distribution'],

            # Streaks
            'current_streak': streak_info['current'],
            'longest_streak': streak_info['longest'],
        }

        self._cache['context'] = context
        return context

    # --- Internal data fetchers (cached) ---

    def _get_sessions(self):
        """Cached query of FocusSession for the analysis period."""
        if 'sessions' not in self._cache:
            from dashboard.models import FocusSession
            self._cache['sessions'] = list(
                FocusSession.objects.filter(
                    user=self.user,
                    started_at__gte=self._cutoff,
                ).order_by('-started_at')[:100]
            )
        return self._cache['sessions']

    def _get_prev_sessions(self):
        """Cached query of FocusSession for the previous period."""
        if 'prev_sessions' not in self._cache:
            from dashboard.models import FocusSession
            self._cache['prev_sessions'] = list(
                FocusSession.objects.filter(
                    user=self.user,
                    started_at__gte=self._prev_cutoff,
                    started_at__lt=self._cutoff,
                ).order_by('-started_at')[:100]
            )
        return self._cache['prev_sessions']

    def _get_tasks(self):
        """Cached query of ExecutionTask for the analysis period."""
        if 'tasks' not in self._cache:
            from dashboard.models import ExecutionTask
            self._cache['tasks'] = list(
                ExecutionTask.objects.filter(
                    user=self.user,
                    created_at__gte=self._cutoff,
                ).order_by('-created_at')[:200]
            )
        return self._cache['tasks']

    # --- Computed metrics ---

    def _get_active_days(self):
        """Count distinct days with sessions or completed tasks."""
        if 'active_days' in self._cache:
            return self._cache['active_days']

        active_dates = set()

        for session in self._get_sessions():
            if session.started_at:
                active_dates.add(session.started_at.date())

        for task in self._get_tasks():
            if task.status == 'completed' and task.completed_at:
                active_dates.add(task.completed_at.date())

        result = len(active_dates)
        self._cache['active_days'] = result
        return result

    def _get_session_stats(self):
        """Aggregate session duration, count, intensity."""
        if 'session_stats' in self._cache:
            return self._cache['session_stats']

        sessions = self._get_sessions()
        completed_sessions = [s for s in sessions if s.status == 'completed']

        durations = []
        planned_durations = []
        for s in completed_sessions:
            actual = s.actual_minutes or 0
            planned = s.planned_minutes or 25
            if actual > 0:
                durations.append(actual)
                planned_durations.append(planned)

        avg_duration = round(sum(durations) / max(len(durations), 1), 1)
        total_minutes = sum(durations)

        # Session intensity: actual vs planned ratio
        if planned_durations:
            total_planned = sum(planned_durations)
            intensity = round(sum(durations) / max(total_planned, 1), 2)
        else:
            intensity = 0.0

        result = {
            'avg_duration': avg_duration,
            'total_minutes': total_minutes,
            'count': len(sessions),
            'completed_count': len(completed_sessions),
            'intensity': intensity,
            'long_sessions': sum(1 for d in durations if d >= THRESHOLDS['long_session_minutes']),
        }
        self._cache['session_stats'] = result
        return result

    def _get_task_stats(self):
        """Aggregate task completion, skip, and difficulty stats."""
        if 'task_stats' in self._cache:
            return self._cache['task_stats']

        tasks = self._get_tasks()
        total = len(tasks)
        completed = sum(1 for t in tasks if t.status == 'completed')
        skipped = sum(1 for t in tasks if t.status == 'skipped')
        denominator = max(completed + skipped, 1)

        # Difficulty breakdown
        diff_dist = {}
        for difficulty in ['easy', 'medium', 'hard']:
            diff_tasks = [t for t in tasks if t.difficulty == difficulty]
            diff_total = len(diff_tasks)
            diff_completed = sum(1 for t in diff_tasks if t.status == 'completed')
            diff_skipped = sum(1 for t in diff_tasks if t.status == 'skipped')
            diff_dist[difficulty] = {
                'total': diff_total,
                'completed': diff_completed,
                'skipped': diff_skipped,
            }

        # Hard skip rate
        hard_info = diff_dist.get('hard', {})
        hard_total = hard_info.get('total', 0)
        hard_skipped = hard_info.get('skipped', 0)
        hard_skip_rate = round(
            (hard_skipped / max(hard_total, 1)) * 100, 1
        )

        # Type distribution
        type_counter = Counter(t.task_type for t in tasks)

        result = {
            'total': total,
            'completed': completed,
            'skipped': skipped,
            'completion_rate': round((completed / denominator) * 100, 1),
            'skip_rate': round((skipped / denominator) * 100, 1),
            'hard_skip_rate': hard_skip_rate,
            'difficulty_distribution': diff_dist,
            'type_distribution': dict(type_counter),
        }
        self._cache['task_stats'] = result
        return result

    def _get_preferred_hours(self):
        """Determine preferred study hours from session start times."""
        if 'preferred_hours' in self._cache:
            return self._cache['preferred_hours']

        sessions = self._get_sessions()
        hours = [s.started_at.hour for s in sessions if s.started_at]

        if not hours:
            self._cache['preferred_hours'] = 'Mixed'
            return 'Mixed'

        buckets = {'Morning': 0, 'Afternoon': 0, 'Evening': 0, 'Night': 0}
        for hour in hours:
            if 5 <= hour < 12:
                buckets['Morning'] += 1
            elif 12 <= hour < 17:
                buckets['Afternoon'] += 1
            elif 17 <= hour < 21:
                buckets['Evening'] += 1
            else:
                buckets['Night'] += 1

        result = max(buckets, key=buckets.get)
        self._cache['preferred_hours'] = result
        return result

    def _get_consistency_trend(self):
        """Compare recent half vs previous half active day counts."""
        if 'consistency_trend' in self._cache:
            return self._cache['consistency_trend']

        mid = self._now - timedelta(days=self.days // 2)

        sessions = self._get_sessions()
        recent_dates = {
            s.started_at.date() for s in sessions
            if s.started_at and s.started_at >= mid
        }
        earlier_dates = {
            s.started_at.date() for s in sessions
            if s.started_at and s.started_at < mid
        }

        # Also count from prev period for comparison
        prev_sessions = self._get_prev_sessions()
        prev_dates = {
            s.started_at.date() for s in prev_sessions if s.started_at
        }

        recent_count = len(recent_dates)
        earlier_count = len(earlier_dates) or len(prev_dates) // 2

        if recent_count >= earlier_count + 2:
            result = 'improving'
        elif recent_count + 2 <= earlier_count:
            result = 'declining'
        else:
            result = 'stable'

        self._cache['consistency_trend'] = result
        return result

    def _get_inactivity_gaps(self):
        """Find gaps between active days (in number of days)."""
        if 'inactivity_gaps' in self._cache:
            return self._cache['inactivity_gaps']

        active_dates = set()
        for session in self._get_sessions():
            if session.started_at:
                active_dates.add(session.started_at.date())
        for task in self._get_tasks():
            if task.status == 'completed' and task.completed_at:
                active_dates.add(task.completed_at.date())

        if len(active_dates) < 2:
            self._cache['inactivity_gaps'] = []
            return []

        sorted_dates = sorted(active_dates)
        gaps = []
        for i in range(1, len(sorted_dates)):
            gap = (sorted_dates[i] - sorted_dates[i - 1]).days
            if gap > 1:
                gaps.append(gap)

        self._cache['inactivity_gaps'] = gaps
        return gaps

    def _get_execution_velocity(self, completed, active_days):
        """Tasks completed per active day."""
        if active_days == 0:
            return 0.0
        return round(completed / active_days, 2)

    def _get_streak_info(self):
        """Get current and longest streak from UserStats or Streak model."""
        if 'streak_info' in self._cache:
            return self._cache['streak_info']

        from dashboard.models import UserStats

        stats = UserStats.objects.filter(user=self.user).first()
        if stats:
            result = {
                'current': stats.current_streak or 0,
                'longest': stats.longest_streak or 0,
            }
        else:
            result = {'current': 0, 'longest': 0}

        self._cache['streak_info'] = result
        return result
