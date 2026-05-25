"""
RiskPredictionEngine — Predict future failure states.
Uses threshold logic, weighted scoring, and velocity estimation.
"""

from intelligence.constants import THRESHOLDS


class RiskPredictionEngine:
    """Predict burnout, dropoff, roadmap friction, and readiness."""

    def __init__(self, user, metrics=None, loops=None, context=None):
        self.user = user
        self.metrics = metrics or {}
        self.loops = loops or []
        self.context = context or {}

    def predict_all_risks(self):
        """Run all risk predictions. Returns dict of predictions."""
        return {
            'burnout': self._predict_burnout(),
            'dropoff': self._predict_dropoff(),
            'roadmap_friction': self._predict_roadmap_friction(),
            'readiness': self._predict_readiness(),
        }

    def _predict_burnout(self):
        """Predict if user is entering overload state."""
        burnout_risk = self.metrics.get('burnout_risk', 0)
        momentum = self.metrics.get('momentum_score', 50)
        consistency = self.context.get('consistency_trend', 'stable')

        # Check if motivation crash loop is active
        has_crash_loop = any(
            l.get('pattern_type') == 'motivation_crash' for l in self.loops
        )

        probability = burnout_risk
        if has_crash_loop:
            probability = min(100, probability + 15)
        if consistency == 'declining':
            probability = min(100, probability + 10)

        # Determine risk level
        if probability >= THRESHOLDS['burnout_critical']:
            risk_level = 'critical'
            timeline = '2-3 days without intervention'
            reasoning = (
                'Cognitive load is exceeding recovery capacity. '
                'Multiple burnout signals are converging.'
            )
        elif probability >= THRESHOLDS['burnout_high']:
            risk_level = 'high'
            timeline = '5-7 days if pace continues'
            reasoning = (
                'Session intensity and skip patterns suggest overload is building. '
                'Reducing pressure this week is important.'
            )
        elif probability >= THRESHOLDS['burnout_moderate']:
            risk_level = 'moderate'
            timeline = '1-2 weeks at current pace'
            reasoning = (
                'Some stress signals are present but manageable. '
                'Monitor session length and skip rate.'
            )
        else:
            risk_level = 'low'
            timeline = 'Not expected in near term'
            reasoning = 'Current workload appears sustainable.'

        return {
            'risk_level': risk_level,
            'probability': round(probability, 1),
            'reasoning': reasoning,
            'timeline': timeline,
        }

    def _predict_dropoff(self):
        """Predict if user will abandon roadmap."""
        dropoff_risk = self.metrics.get('dropoff_risk', 0)
        momentum = self.metrics.get('momentum_score', 50)
        active_days = self.context.get('active_days', 0)

        has_avoidance = any(
            l.get('pattern_type') == 'avoidance' for l in self.loops
        )

        probability = dropoff_risk
        if has_avoidance:
            probability = min(100, probability + 10)
        if momentum < THRESHOLDS['momentum_low']:
            probability = min(100, probability + 10)

        if probability >= THRESHOLDS['dropoff_critical']:
            risk_level = 'critical'
            timeline = '3-5 days without re-engagement'
            reasoning = (
                'Extremely low engagement combined with avoidance patterns. '
                'User is at high risk of abandoning the roadmap entirely.'
            )
        elif probability >= THRESHOLDS['dropoff_high']:
            risk_level = 'high'
            timeline = '1-2 weeks without intervention'
            reasoning = (
                'Declining activity and rising skip rates suggest the roadmap '
                'is losing relevance. Simplification may help.'
            )
        elif probability >= THRESHOLDS['dropoff_moderate']:
            risk_level = 'moderate'
            timeline = '2-3 weeks if trend continues'
            reasoning = (
                'Some disengagement signals but not critical. '
                'Quick wins and shorter milestones could stabilize.'
            )
        else:
            risk_level = 'low'
            timeline = 'Not expected in near term'
            reasoning = 'Engagement patterns are healthy.'

        return {
            'risk_level': risk_level,
            'probability': round(probability, 1),
            'reasoning': reasoning,
            'timeline': timeline,
        }

    def _predict_roadmap_friction(self):
        """Predict if roadmap pacing is incompatible with user behavior."""
        avg_session = self.context.get('avg_session_duration', 0)
        completion_rate = self.context.get('completion_rate', 50)
        hard_skip_rate = self.context.get('hard_skip_rate', 0)
        procrastination = self.metrics.get('procrastination_index', 0)

        friction_score = 0
        friction_reasons = []

        # Session duration vs task estimates mismatch
        if avg_session < 15 and completion_rate < 50:
            friction_score += 30
            friction_reasons.append('Sessions are too short to complete assigned tasks.')

        # Hard task avoidance = friction
        if hard_skip_rate >= 40:
            friction_score += 25
            friction_reasons.append('Difficult tasks are creating friction — pacing needs adjustment.')

        # High procrastination index
        if procrastination >= 50:
            friction_score += 20
            friction_reasons.append('Task difficulty ramp is outpacing current capability.')

        # Low completion rate
        if completion_rate < 40:
            friction_score += 25
            friction_reasons.append('Overall completion rate is low — roadmap may be too ambitious.')

        friction_score = min(100, friction_score)

        if friction_score >= 60:
            level = 'high'
        elif friction_score >= 35:
            level = 'moderate'
        else:
            level = 'low'

        return {
            'friction_level': level,
            'score': round(friction_score, 1),
            'reasons': friction_reasons if friction_reasons else ['Roadmap pacing appears compatible.'],
        }

    def _predict_readiness(self):
        """Estimate readiness timeline based on velocity and remaining work."""
        velocity = self.context.get('execution_velocity', 0)
        active_days = self.context.get('active_days', 0)
        total_days = self.context.get('total_days', 14)
        completion_rate = self.context.get('completion_rate', 0)
        momentum = self.metrics.get('momentum_score', 50)

        if velocity <= 0 or active_days <= 0:
            return {
                'estimated_completion': 'Insufficient data',
                'confidence': 15,
                'scenario': (
                    'Not enough execution data to project a timeline. '
                    'Start completing tasks consistently to unlock projections.'
                ),
            }

        # Estimate remaining tasks (approximate)
        recent_total = self.context.get('recent_total', 0)
        recent_completed = self.context.get('recent_completed', 0)
        remaining_estimate = max(0, recent_total - recent_completed)

        if remaining_estimate == 0:
            return {
                'estimated_completion': 'Current milestone nearly complete',
                'confidence': 70,
                'scenario': 'At current velocity, the active milestone should complete soon.',
            }

        # Days needed at current velocity
        days_needed = remaining_estimate / max(velocity, 0.1)
        # Adjust for active day ratio
        calendar_days = days_needed / max(active_days / total_days, 0.1)

        if calendar_days <= 7:
            estimate = '1 week'
            confidence = min(75, 50 + int(momentum * 0.3))
        elif calendar_days <= 14:
            estimate = '2 weeks'
            confidence = min(65, 40 + int(momentum * 0.25))
        elif calendar_days <= 30:
            estimate = '3-4 weeks'
            confidence = min(55, 30 + int(momentum * 0.2))
        else:
            estimate = f'{int(calendar_days // 7)} weeks'
            confidence = 25

        return {
            'estimated_completion': estimate,
            'confidence': confidence,
            'scenario': (
                f'At {velocity:.1f} tasks/active day with '
                f'{completion_rate:.0f}% completion rate, '
                f'estimated completion in ~{estimate}.'
            ),
        }
