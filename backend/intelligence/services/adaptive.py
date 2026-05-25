"""
AdaptiveRoadmapEngine — Automatically generate roadmap adaptation recommendations.
Adaptations are recommendations first. All changes are logged and reversible.
"""

from intelligence.constants import THRESHOLDS
from intelligence.models import AdaptiveChange


class AdaptiveRoadmapEngine:
    """Generate and manage roadmap adaptation recommendations."""

    def __init__(self, user, metrics=None, risks=None, loops=None, context=None):
        self.user = user
        self.metrics = metrics or {}
        self.risks = risks or {}
        self.loops = loops or []
        self.context = context or {}

    def generate_adaptations(self):
        """Generate adaptation recommendations based on behavioral intelligence."""
        adaptations = []

        if self._should_reduce_workload():
            adaptations.append(self._workload_reduction())
        if self._should_increase_challenge():
            adaptations.append(self._challenge_increase())
        if self._should_inject_easy_wins():
            adaptations.append(self._easy_win_injection())
        if self._should_rebalance():
            adaptations.append(self._theory_to_practical_rebalance())

        return [a for a in adaptations if a is not None]

    # --- Condition checks ---

    def _should_reduce_workload(self):
        """Check: burnout high + momentum collapsing."""
        burnout = self.metrics.get('burnout_risk', 0)
        momentum = self.metrics.get('momentum_score', 50)
        burnout_pred = self.risks.get('burnout', {})

        return (
            burnout >= THRESHOLDS['burnout_high']
            or momentum < THRESHOLDS['momentum_low']
            or burnout_pred.get('risk_level') in ('high', 'critical')
        )

    def _should_increase_challenge(self):
        """Check: momentum high + consistency strong."""
        momentum = self.metrics.get('momentum_score', 50)
        consistency = self.metrics.get('consistency_score', 0)
        burnout = self.metrics.get('burnout_risk', 0)

        return (
            momentum >= THRESHOLDS['momentum_strong']
            and consistency >= 60
            and burnout < THRESHOLDS['burnout_moderate']
        )

    def _should_inject_easy_wins(self):
        """Check: user disengaging (high dropoff risk, low momentum)."""
        dropoff = self.metrics.get('dropoff_risk', 0)
        momentum = self.metrics.get('momentum_score', 50)
        completion_rate = self.context.get('completion_rate', 50)

        return (
            dropoff >= THRESHOLDS['dropoff_moderate']
            or (momentum < THRESHOLDS['momentum_moderate'] and completion_rate < 50)
        )

    def _should_rebalance(self):
        """Check: theory-type tasks being skipped more than practical ones."""
        type_dist = self.context.get('task_type_distribution', {})
        diff_dist = self.context.get('difficulty_distribution', {})

        # Check if learning tasks are being skipped at higher rate than average
        skip_rate = self.context.get('skip_rate', 0)
        hard_skip = self.context.get('hard_skip_rate', 0)

        return hard_skip >= 45 and skip_rate >= THRESHOLDS['skip_rate_warning']

    # --- Adaptation generators ---

    def _workload_reduction(self):
        """Generate workload reduction recommendation."""
        burnout = self.metrics.get('burnout_risk', 0)
        momentum = self.metrics.get('momentum_score', 0)

        suggested = [
            'Reduce this week\'s task count by 25-30%.',
            'Shorten tasks that exceed 45 minutes into smaller blocks.',
            'Insert one recovery day between intensive milestones.',
            'Cap focus sessions at 30 minutes until momentum stabilizes.',
        ]

        confidence = min(90, 40 + int(burnout * 0.4) + max(0, 50 - int(momentum)) // 2)

        return {
            'change_type': 'workload_reduction',
            'description': (
                'Burnout risk is elevated and momentum is weakening. '
                'Reducing workload pressure should prevent cognitive overload '
                'and allow natural recovery.'
            ),
            'suggested_changes': suggested,
            'trigger_metrics': {
                'burnout_risk': burnout,
                'momentum_score': momentum,
            },
            'confidence': confidence,
        }

    def _challenge_increase(self):
        """Generate challenge increase recommendation."""
        momentum = self.metrics.get('momentum_score', 0)
        consistency = self.metrics.get('consistency_score', 0)

        suggested = [
            'Add one stretch task to the current milestone.',
            'Tighten task deadlines by 1-2 days for the next block.',
            'Increase the ratio of hard-to-easy tasks slightly.',
            'Consider advancing to the next milestone early if current one feels routine.',
        ]

        confidence = min(85, 30 + int(momentum * 0.3) + int(consistency * 0.2))

        return {
            'change_type': 'challenge_increase',
            'description': (
                'Your momentum is strong and consistency is solid. '
                'Increasing challenge slightly will keep you in the growth zone '
                'and prevent stagnation.'
            ),
            'suggested_changes': suggested,
            'trigger_metrics': {
                'momentum_score': momentum,
                'consistency_score': consistency,
            },
            'confidence': confidence,
        }

    def _easy_win_injection(self):
        """Generate easy win task recommendations."""
        dropoff = self.metrics.get('dropoff_risk', 0)
        momentum = self.metrics.get('momentum_score', 0)

        suggested = [
            'Add a 10-minute quick-win task at the start of each day.',
            'Front-load one completed action before tackling harder work.',
            'Break the next hard task into 3 visible micro-steps.',
            'Insert a review/celebrate-progress task to rebuild confidence.',
        ]

        confidence = min(80, 35 + int(dropoff * 0.3) + max(0, 50 - int(momentum)) // 3)

        return {
            'change_type': 'easy_win_injection',
            'description': (
                'Engagement is declining and momentum is fragile. '
                'Quick wins rebuild confidence and re-establish the completion habit.'
            ),
            'suggested_changes': suggested,
            'trigger_metrics': {
                'dropoff_risk': dropoff,
                'momentum_score': momentum,
            },
            'confidence': confidence,
        }

    def _theory_to_practical_rebalance(self):
        """Rebalance theory vs practical tasks."""
        hard_skip = self.context.get('hard_skip_rate', 0)
        skip_rate = self.context.get('skip_rate', 0)

        suggested = [
            'Replace one theory task with a hands-on practice task.',
            'Add a mini-project after every 3 theory blocks.',
            'Convert passive reading tasks into active exercises.',
            'Create output-based tasks instead of input-based ones.',
        ]

        confidence = min(80, 30 + int(hard_skip * 0.4) + int(skip_rate * 0.2))

        return {
            'change_type': 'theory_practical_rebalance',
            'description': (
                'Difficult and theory-heavy tasks are being skipped at a high rate. '
                'Increasing practical, hands-on work should improve completion rates.'
            ),
            'suggested_changes': suggested,
            'trigger_metrics': {
                'hard_skip_rate': hard_skip,
                'skip_rate': skip_rate,
            },
            'confidence': confidence,
        }

    def save_adaptations(self, adaptations):
        """Save adaptation recommendations to AdaptiveChange model."""
        saved = []
        for adaptation in adaptations:
            change = AdaptiveChange.objects.create(
                user=self.user,
                change_type=adaptation['change_type'],
                description=adaptation['description'],
                suggested_changes=adaptation.get('suggested_changes', []),
                trigger_metrics=adaptation.get('trigger_metrics', {}),
                confidence=adaptation.get('confidence', 0),
            )
            saved.append(change)
        return saved
