"""
IdentityClassificationEngine — Create evolving behavioral identities.
Rule-based classification using metrics, context, and loop data.
"""

from intelligence.constants import IDENTITY_TYPES


class IdentityClassificationEngine:
    """Assign and evolve behavioral identities based on patterns."""

    def __init__(self, user, metrics=None, context=None, loops=None):
        self.user = user
        self.metrics = metrics or {}
        self.context = context or {}
        self.loops = loops or []

    def classify(self):
        """
        Determine user's current behavioral identity using rule-based classification.
        Returns dict with identity key, display_name, confidence, and description.
        """
        # Extract metrics
        consistency = self.metrics.get('consistency_score', 0)
        momentum = self.metrics.get('momentum_score', 0)
        recovery = self.metrics.get('recovery_speed', 50)
        burnout = self.metrics.get('burnout_risk', 0)
        procrastination = self.metrics.get('procrastination_index', 0)
        skip_rate = self.context.get('skip_rate', 0)
        completion_rate = self.context.get('completion_rate', 0)
        avg_session = self.context.get('avg_session_duration', 0)
        preferred = self.context.get('preferred_hours', 'Mixed')
        active_days = self.context.get('active_days', 0)
        trend = self.context.get('consistency_trend', 'stable')

        # Check for loops
        has_crash = any(l.get('pattern_type') == 'motivation_crash' for l in self.loops)
        has_avoidance = any(l.get('pattern_type') == 'avoidance' for l in self.loops)

        # Rule-based classification (ordered by specificity)

        # 1. Consistency Architect — highly consistent, low skips
        if consistency >= 75 and skip_rate < 15 and completion_rate >= 70:
            return self._build_result('consistency_architect', 88)

        # 2. Deep Worker — long sessions, high completion
        if avg_session >= 60 and completion_rate >= 70 and burnout < 60:
            return self._build_result('deep_worker', 80)

        # 3. Recovery Fighter — bounces back from gaps
        if recovery >= 70 and active_days >= 3 and trend in ('improving', 'stable'):
            gaps = self.context.get('inactivity_gaps', [])
            if gaps and max(gaps) >= 3:
                return self._build_result('recovery_fighter', 75)

        # 4. Sprint Master — high burst activity
        if avg_session >= 40 and active_days <= 5 and completion_rate >= 60:
            velocity = self.context.get('execution_velocity', 0)
            if velocity >= 2.0:
                return self._build_result('sprint_master', 72)

        # 5. Chaos Starter — high energy, scattered execution
        if skip_rate >= 40 or has_avoidance:
            if active_days >= 3:
                return self._build_result('chaos_starter', 70)

        # 6. Night Owl / Early Bird — time-based identity
        if preferred == 'Night' and consistency >= 40:
            return self._build_result('night_owl', 65)
        if preferred == 'Morning' and consistency >= 40:
            return self._build_result('early_bird', 65)

        # 7. Momentum Builder — improving trend
        if trend == 'improving' and momentum >= 40:
            return self._build_result('momentum_builder', 68)

        # 8. Steady Climber — moderate but consistent
        if trend in ('stable', 'improving') and consistency >= 40 and momentum >= 30:
            return self._build_result('steady_climber', 60)

        # Default: Momentum Builder (everyone starts here)
        return self._build_result('momentum_builder', 45)

    def get_identity_evolution(self):
        """Track how identity has changed over time from daily snapshots."""
        from intelligence.models import DailyBehaviorSnapshot

        snapshots = (
            DailyBehaviorSnapshot.objects
            .filter(user=self.user)
            .exclude(identity_type='')
            .order_by('-date')
            .values('date', 'identity_type')[:30]
        )

        evolution = []
        for snap in snapshots:
            identity_key = snap['identity_type']
            identity_info = IDENTITY_TYPES.get(identity_key, {})
            evolution.append({
                'date': snap['date'].isoformat(),
                'identity': identity_key,
                'display_name': identity_info.get('display', identity_key.replace('_', ' ').title()),
            })

        return evolution

    def _build_result(self, identity_key, confidence):
        """Build a standardized identity result dict."""
        info = IDENTITY_TYPES.get(identity_key, {})
        return {
            'identity': identity_key,
            'display_name': info.get('display', identity_key.replace('_', ' ').title()),
            'confidence': confidence,
            'description': info.get('description', ''),
        }
