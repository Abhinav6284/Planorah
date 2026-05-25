"""
Intelligence Orchestrator — The main pipeline that ties all engines together.
This is the single entry point for computing behavioral intelligence.
"""

import logging
from datetime import date

from django.utils import timezone

from intelligence.models import BehavioralInsight, DailyBehaviorSnapshot
from .aggregation import BehaviorAggregationService
from .metrics import BehaviorMetricsEngine
from .loops import BehaviorLoopDetector
from .risk import RiskPredictionEngine
from .adaptive import AdaptiveRoadmapEngine
from .projection import FutureProjectionEngine
from .identity import IdentityClassificationEngine
from .interpreter import BehavioralInterpreter

logger = logging.getLogger(__name__)


class IntelligenceOrchestrator:
    """
    Orchestrates the full behavioral intelligence pipeline:
    Aggregation → Metrics → Loops → Risks → Adaptations → Projection → Identity → Interpretation
    """

    def __init__(self, user):
        self.user = user

    def compute_full_intelligence(self):
        """
        Run the complete behavioral intelligence pipeline.
        Returns the full intelligence payload for the frontend.
        """
        # Phase 2: Aggregate behavioral context
        aggregator = BehaviorAggregationService(self.user, days=14)
        context = aggregator.get_behavioral_context()

        # Phase 3: Compute behavioral metrics
        metrics_engine = BehaviorMetricsEngine(self.user, context=context)
        metrics = metrics_engine.compute_all_metrics()

        # Phase 4: Detect behavioral loops
        loop_detector = BehaviorLoopDetector(self.user, context=context, metrics=metrics)
        loops = loop_detector.detect_all_loops()

        # Phase 5: Predict risks
        risk_engine = RiskPredictionEngine(
            self.user, metrics=metrics, loops=loops, context=context
        )
        risks = risk_engine.predict_all_risks()

        # Phase 6: Generate adaptive recommendations
        adaptive_engine = AdaptiveRoadmapEngine(
            self.user, metrics=metrics, risks=risks, loops=loops, context=context
        )
        adaptations = adaptive_engine.generate_adaptations()

        # Phase 7: Project future outcomes
        projection_engine = FutureProjectionEngine(
            self.user, metrics=metrics, context=context
        )
        projections = projection_engine.generate_projections()

        # Phase 8: Classify behavioral identity
        identity_engine = IdentityClassificationEngine(
            self.user, metrics=metrics, context=context, loops=loops
        )
        identity = identity_engine.classify()
        identity_evolution = identity_engine.get_identity_evolution()

        # Phase 9: AI interpretation
        interpreter = BehavioralInterpreter()
        interpretation = interpreter.interpret({
            'metrics': metrics,
            'loops': loops,
            'risks': risks,
            'identity': identity,
            'projections': projections,
            'adaptations': adaptations,
            'context': context,
        })

        # Save daily snapshot
        self._save_daily_snapshot(metrics, context, identity)

        # Save detected loops
        if loops:
            loop_detector.save_detected_loops(loops)

        # Save insights
        self._save_insights(interpretation.get('insights', []))

        # Save adaptations
        if adaptations:
            adaptive_engine.save_adaptations(adaptations)

        # Build full payload
        payload = {
            'metrics': metrics,
            'context': {
                'active_days': context.get('active_days', 0),
                'total_days': context.get('total_days', 14),
                'preferred_hours': context.get('preferred_hours', 'Mixed'),
                'consistency_trend': context.get('consistency_trend', 'stable'),
                'execution_velocity': context.get('execution_velocity', 0),
                'avg_session_duration': context.get('avg_session_duration', 0),
                'completion_rate': context.get('completion_rate', 0),
                'skip_rate': context.get('skip_rate', 0),
                'current_streak': context.get('current_streak', 0),
            },
            'loops': loops,
            'risks': risks,
            'adaptations': adaptations,
            'projections': projections,
            'identity': identity,
            'identity_evolution': identity_evolution[:10],
            'insights': interpretation.get('insights', []),
            'overall_narrative': interpretation.get('overall_narrative', ''),
            'identity_message': interpretation.get('identity_message', ''),
            'source': interpretation.get('source', 'rule_based'),
            'generated_at': timezone.now().isoformat(),
        }

        return payload

    def _save_daily_snapshot(self, metrics, context, identity):
        """Save today's behavioral snapshot for longitudinal tracking."""
        today = date.today()
        try:
            snapshot, created = DailyBehaviorSnapshot.objects.update_or_create(
                user=self.user,
                date=today,
                defaults={
                    'momentum_score': metrics.get('momentum_score', 0),
                    'burnout_risk': metrics.get('burnout_risk', 0),
                    'consistency_score': metrics.get('consistency_score', 0),
                    'dropoff_risk': metrics.get('dropoff_risk', 0),
                    'procrastination_index': metrics.get('procrastination_index', 0),
                    'recovery_speed': metrics.get('recovery_speed', 0),
                    'active_minutes': context.get('total_focus_minutes', 0),
                    'tasks_completed': context.get('recent_completed', 0),
                    'tasks_skipped': context.get('recent_skipped', 0),
                    'sessions_count': context.get('sessions_count', 0),
                    'identity_type': identity.get('identity', ''),
                    'raw_metrics': metrics,
                },
            )
        except Exception as exc:
            logger.warning("Failed to save daily snapshot: %s", exc)

    def _save_insights(self, insights):
        """Save generated insights to the database."""
        # Deactivate old insights for this user (keep last 50)
        active_count = BehavioralInsight.objects.filter(
            user=self.user, is_active=True
        ).count()
        if active_count > 50:
            old_ids = (
                BehavioralInsight.objects
                .filter(user=self.user, is_active=True)
                .order_by('-created_at')
                .values_list('id', flat=True)[50:]
            )
            BehavioralInsight.objects.filter(id__in=list(old_ids)).update(is_active=False)

        # Save new insights
        for insight_data in insights[:5]:
            try:
                BehavioralInsight.objects.create(
                    user=self.user,
                    insight_type=insight_data.get('type', 'behavioral'),
                    title=insight_data.get('title', '')[:200],
                    description=insight_data.get('description', ''),
                    confidence=insight_data.get('confidence', 0),
                    priority=insight_data.get('priority', 'medium'),
                    strategy=insight_data.get('strategy', ''),
                    cta_label=insight_data.get('cta_label', ''),
                    tone=insight_data.get('tone', 'neutral'),
                    context_data=insight_data,
                )
            except Exception as exc:
                logger.warning("Failed to save insight: %s", exc)
