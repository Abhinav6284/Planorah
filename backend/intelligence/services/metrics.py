"""
BehaviorMetricsEngine — Core intelligence layer.
Computes behavioral scores using weighted heuristic scoring.
All formulas use centralized weights from constants.py.
"""

from intelligence.constants import (
    BURNOUT_WEIGHTS,
    MOMENTUM_WEIGHTS,
    DROPOFF_WEIGHTS,
    THRESHOLDS,
)
from .aggregation import BehaviorAggregationService


class BehaviorMetricsEngine:
    """Computes behavioral intelligence scores (0-100 scale)."""

    def __init__(self, user, context=None):
        self.user = user
        if context is None:
            self.context = BehaviorAggregationService(user).get_behavioral_context()
        else:
            self.context = context

    def compute_all_metrics(self):
        """Compute all behavioral metrics. Returns dict with all scores."""
        return {
            'momentum_score': self.compute_momentum(),
            'burnout_risk': self.compute_burnout_risk(),
            'dropoff_risk': self.compute_dropoff_risk(),
            'recovery_speed': self.compute_recovery_speed(),
            'procrastination_index': self.compute_procrastination_index(),
            'consistency_score': self.compute_consistency_score(),
            'execution_velocity': self.context.get('execution_velocity', 0),
            'completion_rate': self.context.get('completion_rate', 0),
            'skip_rate': self.context.get('skip_rate', 0),
        }

    def compute_momentum(self):
        """
        0-100 score. Higher = more likely to continue executing.
        Formula: consistency(0.30) + active_days(0.20) + completion_rate(0.35) - skip_penalty(0.15)
        """
        ctx = self.context
        w = MOMENTUM_WEIGHTS

        # Consistency component (0-100): streak contribution + trend bonus
        streak = min(ctx.get('current_streak', 0), 14)
        streak_score = (streak / 14) * 100
        trend_bonus = {
            'improving': 15,
            'stable': 0,
            'declining': -15,
        }.get(ctx.get('consistency_trend', 'stable'), 0)
        consistency_component = self._clamp(streak_score + trend_bonus)

        # Active days component (0-100): ratio of active days in period
        active_ratio = ctx.get('active_days_ratio', 0)
        active_component = self._clamp(active_ratio * 100)

        # Completion rate component (already 0-100)
        completion_component = ctx.get('completion_rate', 0)

        # Skip penalty component (higher skip = lower momentum)
        skip_rate = ctx.get('skip_rate', 0)
        skip_penalty_component = min(skip_rate, 100)

        score = (
            consistency_component * w['consistency']
            + active_component * w['active_days']
            + completion_component * w['completion_rate']
            - skip_penalty_component * w['skip_penalty']
        )

        return self._clamp(score)

    def compute_burnout_risk(self):
        """
        0-100 score. Higher = more likely to burn out.
        Formula: long_sessions(0.30) + skip_spikes(0.25) + falling_consistency(0.25) + session_intensity(0.20)
        """
        ctx = self.context
        w = BURNOUT_WEIGHTS

        # Long sessions component: proportion of extended sessions
        sessions_count = ctx.get('sessions_count', 0)
        avg_duration = ctx.get('avg_session_duration', 0)

        if avg_duration >= THRESHOLDS['long_session_minutes']:
            long_session_score = 90
        elif avg_duration >= THRESHOLDS['optimal_session_minutes_max']:
            long_session_score = 50
        elif avg_duration >= THRESHOLDS['optimal_session_minutes_min']:
            long_session_score = 15
        else:
            long_session_score = 5

        # Skip spikes: recent skip rate signals overwhelm
        skip_rate = ctx.get('skip_rate', 0)
        if skip_rate >= THRESHOLDS['skip_rate_critical']:
            skip_spike_score = 90
        elif skip_rate >= THRESHOLDS['skip_rate_warning']:
            skip_spike_score = 55
        elif skip_rate >= THRESHOLDS['skip_rate_normal']:
            skip_spike_score = 25
        else:
            skip_spike_score = 5

        # Falling consistency
        trend = ctx.get('consistency_trend', 'stable')
        if trend == 'declining':
            consistency_fall_score = 80
        elif trend == 'stable':
            consistency_fall_score = 20
        else:
            consistency_fall_score = 5

        # Session intensity (overwork indicator)
        intensity = ctx.get('session_intensity', 0)
        if intensity >= 1.5:
            intensity_score = 85
        elif intensity >= 1.2:
            intensity_score = 55
        elif intensity >= 0.8:
            intensity_score = 20
        else:
            intensity_score = 10

        score = (
            long_session_score * w['long_sessions']
            + skip_spike_score * w['skip_spikes']
            + consistency_fall_score * w['falling_consistency']
            + intensity_score * w['session_intensity']
        )

        return self._clamp(score)

    def compute_dropoff_risk(self):
        """
        0-100 score. Higher = more likely to abandon roadmap.
        Based on: inactivity, rising skips, weak momentum, low engagement.
        """
        ctx = self.context
        w = DROPOFF_WEIGHTS

        # Inactivity component
        active_ratio = ctx.get('active_days_ratio', 0)
        inactivity_score = self._clamp((1 - active_ratio) * 100)

        gaps = ctx.get('inactivity_gaps', [])
        max_gap = max(gaps) if gaps else 0
        if max_gap >= THRESHOLDS['inactivity_days_critical']:
            inactivity_score = max(inactivity_score, 85)
        elif max_gap >= THRESHOLDS['inactivity_days_warning']:
            inactivity_score = max(inactivity_score, 60)

        # Rising skips
        skip_rate = ctx.get('skip_rate', 0)
        skip_score = min(skip_rate * 1.5, 100)

        # Weak momentum (inverse of momentum)
        momentum = self.compute_momentum()
        weak_momentum_score = self._clamp(100 - momentum)

        # Low engagement: few sessions, few tasks
        active_days = ctx.get('active_days', 0)
        if active_days <= 1:
            engagement_score = 90
        elif active_days <= 3:
            engagement_score = 60
        elif active_days <= 5:
            engagement_score = 30
        else:
            engagement_score = 10

        score = (
            inactivity_score * w['inactivity']
            + skip_score * w['rising_skips']
            + weak_momentum_score * w['weak_momentum']
            + engagement_score * w['low_engagement']
        )

        return self._clamp(score)

    def compute_recovery_speed(self):
        """
        0-100 score. How quickly user resumes after inactivity gaps.
        Higher = faster recovery.
        """
        gaps = self.context.get('inactivity_gaps', [])

        if not gaps:
            # No gaps = great consistency or not enough data
            active_days = self.context.get('active_days', 0)
            if active_days >= 5:
                return 85  # Consistently active, no gaps to recover from
            return 50  # Not enough data

        avg_gap = sum(gaps) / len(gaps)
        max_gap = max(gaps)

        # Shorter average gap = faster recovery
        if avg_gap <= THRESHOLDS['recovery_speed_fast']:
            base_score = 85
        elif avg_gap <= THRESHOLDS['recovery_speed_threshold_days']:
            base_score = 60
        else:
            base_score = max(20, 80 - (avg_gap * 8))

        # Penalty for very long max gap
        if max_gap >= THRESHOLDS['inactivity_days_critical']:
            base_score -= 20

        # Bonus: if trend is improving, recovery is happening
        if self.context.get('consistency_trend') == 'improving':
            base_score += 10

        return self._clamp(base_score)

    def compute_procrastination_index(self):
        """
        0-100 score. Avoidance of difficult work.
        Based on: hard task avoidance, skip patterns, difficulty avoidance.
        """
        ctx = self.context
        hard_skip_rate = ctx.get('hard_skip_rate', 0)
        overall_skip_rate = ctx.get('skip_rate', 0)

        diff_dist = ctx.get('difficulty_distribution', {})

        # Compare hard vs easy skip rates
        easy_info = diff_dist.get('easy', {})
        hard_info = diff_dist.get('hard', {})
        easy_total = easy_info.get('total', 0)
        easy_skipped = easy_info.get('skipped', 0)
        easy_skip_rate = (easy_skipped / max(easy_total, 1)) * 100

        # Avoidance differential: how much more are hard tasks skipped vs easy
        avoidance_diff = max(0, hard_skip_rate - easy_skip_rate)

        # Procrastination formula
        score = (
            hard_skip_rate * 0.45
            + avoidance_diff * 0.35
            + overall_skip_rate * 0.20
        )

        return self._clamp(score)

    def compute_consistency_score(self):
        """
        0-100 score. How consistent the execution pattern is.
        Based on: active_days ratio, streak, consistency trend.
        """
        ctx = self.context

        active_ratio = ctx.get('active_days_ratio', 0)
        streak = min(ctx.get('current_streak', 0), 14)
        trend = ctx.get('consistency_trend', 'stable')

        # Base: active days ratio
        base = active_ratio * 60

        # Streak bonus
        streak_bonus = min(streak * 2, 25)

        # Trend adjustment
        trend_adj = {
            'improving': 10,
            'stable': 5,
            'declining': -10,
        }.get(trend, 0)

        return self._clamp(base + streak_bonus + trend_adj)

    @staticmethod
    def _clamp(value, min_val=0, max_val=100):
        """Clamp a value to the specified range."""
        return max(min_val, min(max_val, round(float(value), 1)))
