"""
FutureProjectionEngine — Simulate future execution outcomes.
Three paths: current, optimized, burnout.
"""


class FutureProjectionEngine:
    """Project future execution outcomes based on current behavioral trajectory."""

    def __init__(self, user, metrics=None, context=None):
        self.user = user
        self.metrics = metrics or {}
        self.context = context or {}

    def generate_projections(self):
        """Generate three future path projections."""
        return {
            'current_path': self._project_current_path(),
            'optimized_path': self._project_optimized_path(),
            'burnout_path': self._project_burnout_path(),
        }

    def _project_current_path(self):
        """What happens if behavior stays the same."""
        velocity = self.context.get('execution_velocity', 0)
        completion_rate = self.context.get('completion_rate', 0)
        momentum = self.metrics.get('momentum_score', 50)
        consistency = self.context.get('consistency_trend', 'stable')
        active_ratio = self.context.get('active_days_ratio', 0)

        if velocity <= 0:
            return {
                'title': 'Stalled Progress',
                'completion_estimate': 'Unclear',
                'probability': 20,
                'description': (
                    'At current execution rate, progress is effectively stalled. '
                    'Without regular task completion, roadmap goals will not be met.'
                ),
                'risks': [
                    'Goals will drift further away',
                    'Motivation will continue declining',
                    'Skills won\'t improve without practice',
                ],
            }

        # Estimate timeline
        if momentum >= 60 and consistency != 'declining':
            estimate = '3-4 weeks to milestone completion'
            prob = min(65, 40 + int(momentum * 0.3))
            desc = (
                f'At {velocity:.1f} tasks/day with {completion_rate:.0f}% completion, '
                f'you\'ll maintain steady progress. This path is sustainable but not optimized.'
            )
            risks = ['Progress may plateau without challenge increase', 'Burnout possible if intensity rises']
        elif momentum >= 40:
            estimate = '5-7 weeks to milestone completion'
            prob = min(50, 25 + int(momentum * 0.3))
            desc = (
                f'Current pace shows mixed signals. '
                f'Completion rate of {completion_rate:.0f}% means some tasks are slipping through.'
            )
            risks = ['Inconsistency could derail progress', 'Hard tasks may accumulate']
        else:
            estimate = '8+ weeks or incomplete'
            prob = max(15, int(momentum * 0.4))
            desc = (
                'Weak momentum and low velocity suggest this roadmap is at risk of abandonment '
                'unless execution patterns change.'
            )
            risks = ['High probability of roadmap abandonment', 'Skill gaps will widen']

        return {
            'title': 'Current Path',
            'completion_estimate': estimate,
            'probability': prob,
            'description': desc,
            'risks': risks,
        }

    def _project_optimized_path(self):
        """What happens if consistency improves by 20-30%."""
        velocity = self.context.get('execution_velocity', 0)
        momentum = self.metrics.get('momentum_score', 50)
        active_ratio = self.context.get('active_days_ratio', 0)

        # Assume 25% improvement
        optimized_velocity = velocity * 1.25
        optimized_active_ratio = min(1.0, active_ratio * 1.3)

        if optimized_velocity > 0:
            improvement_factor = optimized_velocity / max(velocity, 0.1)
            if momentum >= 50:
                estimate = '2-3 weeks to milestone completion'
                prob = min(80, 55 + int(momentum * 0.3))
            elif momentum >= 30:
                estimate = '3-5 weeks to milestone completion'
                prob = min(65, 35 + int(momentum * 0.3))
            else:
                estimate = '4-6 weeks to milestone completion'
                prob = min(50, 25 + int(momentum * 0.3))
        else:
            estimate = '4-6 weeks with consistent daily effort'
            prob = 35

        return {
            'title': 'Optimized Path',
            'completion_estimate': estimate,
            'probability': prob,
            'description': (
                'With 25% more consistency — adding 1-2 active days per week '
                'and maintaining shorter, focused sessions — your trajectory '
                'improves significantly. Small behavioral changes compound fast.'
            ),
            'improvements_needed': [
                'Add 1-2 more active days per week',
                'Maintain session focus under 40 minutes',
                'Complete hard tasks early in sessions',
                'Track daily progress to sustain awareness',
            ],
        }

    def _project_burnout_path(self):
        """What happens if overload continues."""
        burnout_risk = self.metrics.get('burnout_risk', 0)
        momentum = self.metrics.get('momentum_score', 50)

        if burnout_risk >= 70:
            estimate = '1-2 weeks before significant disengagement'
            prob = min(80, 50 + int(burnout_risk * 0.4))
            desc = (
                'Current intensity is unsustainable. If this pace continues, '
                'a prolonged inactivity period is likely within 1-2 weeks, '
                'followed by potential roadmap abandonment.'
            )
        elif burnout_risk >= 45:
            estimate = '3-4 weeks before burnout effects appear'
            prob = min(60, 30 + int(burnout_risk * 0.35))
            desc = (
                'Moderate overload signals detected. Without reducing session '
                'intensity or workload, fatigue will accumulate and performance '
                'will decline over the next month.'
            )
        else:
            estimate = 'Burnout is not imminent'
            prob = max(10, int(burnout_risk * 0.4))
            desc = (
                'Current workload appears manageable. However, monitoring '
                'session intensity and skip patterns remains important.'
            )

        return {
            'title': 'Burnout Path',
            'completion_estimate': estimate,
            'probability': prob,
            'description': desc,
            'consequences': [
                'Extended inactivity period (5-14 days)',
                'Loss of streak and momentum gains',
                'Potential roadmap abandonment',
                'Longer recovery time after burnout',
            ],
        }
