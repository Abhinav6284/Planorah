"""
BehavioralInterpreter — AI Strategic Interpretation Layer.

LLM does NOT compute metrics. LLM ONLY explains, strategizes, and communicates naturally.
All metrics are pre-computed and passed as structured input.
Falls back to rule-based interpretation when AI is unavailable.
"""

import json
import logging
import os

import requests
from django.conf import settings

from intelligence.constants import INSIGHT_TYPES, THRESHOLDS

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY') or getattr(settings, 'GEMINI_API_KEY', None)
GEMINI_MODEL = os.getenv('GEMINI_LLM_MODEL', 'gemini-2.5-flash')


class BehavioralInterpreter:
    """Convert behavioral intelligence into emotionally intelligent guidance via Gemini."""

    def interpret(self, intelligence_payload):
        """
        Send structured intelligence to Gemini for interpretation.
        Falls back to rule-based if Gemini is unavailable.
        """
        try:
            return self._gemini_interpret(intelligence_payload)
        except Exception as exc:
            logger.warning("Gemini interpretation failed: %s. Using rule-based fallback.", exc)
            return self._rule_based_fallback(intelligence_payload)

    def _gemini_interpret(self, payload):
        """Call Gemini to generate emotionally intelligent insights."""
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured")

        prompt = self._build_prompt(payload)

        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
        )

        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.5,
                    "topP": 0.9,
                    "maxOutputTokens": 1200,
                },
            },
            timeout=30,
        )
        response.raise_for_status()

        # Extract text from Gemini response
        candidates = response.json().get("candidates", [])
        if not candidates:
            raise ValueError("Empty Gemini response")

        parts = candidates[0].get("content", {}).get("parts", [])
        text = (parts[0].get("text", "") if parts else "").strip()

        if not text:
            raise ValueError("Empty Gemini text")

        # Parse JSON from response
        json_start = text.find("{")
        json_end = text.rfind("}")
        if json_start == -1 or json_end == -1:
            raise ValueError("No JSON in Gemini response")

        parsed = json.loads(text[json_start:json_end + 1])
        return self._normalize_ai_response(parsed, payload)

    def _build_prompt(self, payload):
        """Build structured prompt for Gemini with strict rules."""
        metrics = payload.get('metrics', {})
        loops = payload.get('loops', [])
        risks = payload.get('risks', {})
        identity = payload.get('identity', {})
        projections = payload.get('projections', {})
        adaptations = payload.get('adaptations', [])
        context = payload.get('context', {})

        return f"""You are Planorah's behavioral intelligence interpreter.
You receive pre-computed behavioral data and convert it into emotionally intelligent guidance.

CRITICAL RULES:
- You do NOT compute any metrics. All numbers are already calculated.
- Use ONLY the provided data. Do NOT hallucinate analytics.
- Output STRICT JSON only. No markdown, no text outside JSON.
- Use evolving, emotionally aware language — NOT generic advice.
- Reference the user's actual behavioral patterns.
- Language should feel observant and adaptive, not dashboard-like.

BEHAVIORAL DATA:
{json.dumps({
    'metrics': metrics,
    'detected_loops': [l.get('description', '') for l in loops[:3]],
    'risk_predictions': {{
        'burnout': risks.get('burnout', {{}}).get('risk_level', 'unknown'),
        'dropoff': risks.get('dropoff', {{}}).get('risk_level', 'unknown'),
    }},
    'identity': identity.get('display_name', 'Unknown'),
    'preferred_hours': context.get('preferred_hours', 'Mixed'),
    'consistency_trend': context.get('consistency_trend', 'stable'),
    'active_days': context.get('active_days', 0),
    'completion_rate': context.get('completion_rate', 0),
    'adaptations_needed': len(adaptations) > 0,
}, indent=2)}

Return ONLY valid JSON with this structure:
{{
    "insights": [
        {{
            "type": "behavioral|momentum|prediction|roadmap|identity|loop",
            "title": "Max 70 chars. Sharp, specific.",
            "description": "1-2 sentences. Explains WHY. Max 180 chars.",
            "confidence": 75,
            "priority": "critical|high|medium|low",
            "strategy": "One actionable tactic. Max 120 chars.",
            "cta_label": "Dynamic CTA like 'Prevent Burnout' / 'Lock Momentum' / 'Rebalance Plan'",
            "tone": "encouraging|cautioning|celebrating|neutral"
        }}
    ],
    "overall_narrative": "2-3 sentence behavioral summary. Max 250 chars.",
    "identity_message": "Short message about their behavioral identity. Max 120 chars."
}}

Generate 3-5 insights covering the most important behavioral signals.
Be the mentor they never had, not a dashboard."""

    def _normalize_ai_response(self, parsed, payload):
        """Normalize and validate AI response."""
        insights = []
        raw_insights = parsed.get('insights', [])

        for raw in raw_insights[:5]:
            if not isinstance(raw, dict):
                continue
            insights.append({
                'type': str(raw.get('type', 'behavioral')).strip(),
                'title': str(raw.get('title', 'Behavioral pattern detected')).strip()[:200],
                'description': str(raw.get('description', '')).strip()[:500],
                'confidence': max(0, min(100, int(raw.get('confidence', 60)))),
                'priority': str(raw.get('priority', 'medium')).strip().lower(),
                'strategy': str(raw.get('strategy', '')).strip()[:300],
                'cta_label': str(raw.get('cta_label', 'View Strategy')).strip()[:100],
                'tone': str(raw.get('tone', 'neutral')).strip().lower(),
            })

        if not insights:
            return self._rule_based_fallback(payload)

        return {
            'insights': insights,
            'overall_narrative': str(parsed.get('overall_narrative', '')).strip()[:500],
            'identity_message': str(parsed.get('identity_message', '')).strip()[:200],
            'source': 'ai',
        }

    def _rule_based_fallback(self, payload):
        """Generate insights without AI when Gemini is unavailable."""
        metrics = payload.get('metrics', {})
        loops = payload.get('loops', [])
        risks = payload.get('risks', {})
        identity = payload.get('identity', {})
        context = payload.get('context', {})

        insights = []

        momentum = metrics.get('momentum_score', 50)
        burnout = metrics.get('burnout_risk', 0)
        dropoff = metrics.get('dropoff_risk', 0)
        procrastination = metrics.get('procrastination_index', 0)

        # Momentum insight
        if momentum >= THRESHOLDS['momentum_strong']:
            insights.append({
                'type': 'momentum',
                'title': 'You are in a high-consistency window',
                'description': (
                    'Execution is stabilizing. Protect this pattern instead of '
                    'increasing ambition too quickly.'
                ),
                'confidence': min(85, 55 + int(momentum * 0.3)),
                'priority': 'medium',
                'strategy': 'Maintain current rhythm — add one stretch task, not a full extra workload.',
                'cta_label': 'Lock Momentum',
                'tone': 'celebrating',
            })
        elif momentum < THRESHOLDS['momentum_low']:
            insights.append({
                'type': 'momentum',
                'title': 'Momentum needs rebuilding',
                'description': (
                    'Your execution rhythm is fragile. Focus on completing '
                    'one small task per day to restart the momentum cycle.'
                ),
                'confidence': max(50, 80 - int(momentum)),
                'priority': 'high',
                'strategy': 'Start each day with a 10-minute quick win before harder work.',
                'cta_label': 'Rebuild Momentum',
                'tone': 'encouraging',
            })

        # Burnout insight
        burnout_pred = risks.get('burnout', {})
        if burnout >= THRESHOLDS['burnout_high']:
            insights.append({
                'type': 'prediction',
                'title': 'Burnout risk is climbing',
                'description': (
                    f'Your recent pattern suggests load is outrunning recovery. '
                    f'{burnout_pred.get("timeline", "Act soon")}.'
                ),
                'confidence': min(85, int(burnout)),
                'priority': 'critical' if burnout >= THRESHOLDS['burnout_critical'] else 'high',
                'strategy': 'Reduce session length to 25 minutes and skip one low-priority task today.',
                'cta_label': 'Prevent Burnout',
                'tone': 'cautioning',
            })

        # Loop insight
        if loops:
            top_loop = loops[0]
            insights.append({
                'type': 'loop',
                'title': f'{top_loop.get("pattern_type", "Pattern").replace("_", " ").title()} detected',
                'description': top_loop.get('description', 'A behavioral loop was detected in your execution pattern.')[:180],
                'confidence': top_loop.get('confidence', 60),
                'priority': 'high',
                'strategy': 'Break the cycle by changing one variable — session length, task order, or difficulty.',
                'cta_label': 'Break the Loop',
                'tone': 'cautioning',
            })

        # Identity insight
        if identity:
            insights.append({
                'type': 'identity',
                'title': f'You are a {identity.get("display_name", "Learner")}',
                'description': identity.get('description', 'Your behavioral identity reflects how you execute.')[:180],
                'confidence': identity.get('confidence', 50),
                'priority': 'low',
                'strategy': 'Lean into your strengths while addressing your execution gaps.',
                'cta_label': 'View Identity',
                'tone': 'encouraging',
            })

        # Dropoff insight
        if dropoff >= THRESHOLDS['dropoff_high']:
            insights.append({
                'type': 'roadmap',
                'title': 'This roadmap is at risk of being abandoned',
                'description': (
                    'Declining engagement and rising skip patterns suggest '
                    'the current pacing needs adjustment.'
                ),
                'confidence': min(80, int(dropoff)),
                'priority': 'high',
                'strategy': 'Simplify the next milestone — break it into 3 visible micro-goals.',
                'cta_label': 'Rebalance Plan',
                'tone': 'cautioning',
            })

        # Ensure at least one insight
        if not insights:
            insights.append({
                'type': 'behavioral',
                'title': 'Your execution pattern is still forming',
                'description': 'Keep building consistency — the system needs a few more days to model your behavior.',
                'confidence': 40,
                'priority': 'medium',
                'strategy': 'Complete one task today to strengthen your behavioral signal.',
                'cta_label': 'Start Now',
                'tone': 'encouraging',
            })

        # Build narrative
        narrative = self._build_narrative(metrics, identity, context)

        return {
            'insights': insights[:5],
            'overall_narrative': narrative,
            'identity_message': (
                f'Your current execution style is '
                f'{identity.get("display_name", "evolving")}. '
                f'{identity.get("description", "")}'
            )[:200],
            'source': 'rule_based',
        }

    def _build_narrative(self, metrics, identity, context):
        """Build a 2-3 sentence behavioral summary."""
        momentum = metrics.get('momentum_score', 50)
        burnout = metrics.get('burnout_risk', 0)
        trend = context.get('consistency_trend', 'stable')
        active_days = context.get('active_days', 0)
        identity_name = identity.get('display_name', 'learner')

        parts = []

        if momentum >= 60:
            parts.append(f'Your momentum is strong at {momentum:.0f}/100.')
        elif momentum >= 35:
            parts.append(f'Your momentum is moderate at {momentum:.0f}/100.')
        else:
            parts.append(f'Your momentum is low at {momentum:.0f}/100.')

        if trend == 'improving':
            parts.append('Consistency is trending upward.')
        elif trend == 'declining':
            parts.append('Consistency has been declining — focus on small wins.')

        if burnout >= 65:
            parts.append('Burnout risk needs attention.')
        elif active_days >= 5:
            parts.append(f'{active_days} active days shows solid engagement.')

        return ' '.join(parts[:3])
