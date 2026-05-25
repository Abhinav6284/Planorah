import json
import os
from datetime import datetime, timezone, timedelta

import requests
from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from dotenv import load_dotenv
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone as dj_timezone

from ats.models import ATSAnalysis
from resume.models import Resume
from users.models import UserProfile

from .ai_service import generate_coach_recommendation, generate_exam_plan
from .models import DailySummary, Task, ExecutionTask, FocusSession, UserStats, XPLog, Streak, ExamPlan

# Behavioral Intelligence System integration
def _track_behavior_event(user, event_type, metadata=None):
    """Silently track a behavioral event — never disrupts existing flows."""
    try:
        from intelligence.services.event_service import BehaviorEventService
        BehaviorEventService.track_event(user, event_type, metadata)
    except Exception:
        pass
from .serializers import (
    DailySummarySerializer,
    TaskSerializer,
    ExecutionTaskSerializer,
    FocusSessionSerializer,
    UserStatsSerializer,
    ExamPlanSerializer,
)

# NOTE: dashboard.Task is a legacy quick-task model (distinct from tasks.Task).


load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or getattr(
    settings, "GEMINI_API_KEY", None)
GEMINI_MODEL = "gemini-2.5-flash"


def _safe_onboarding_data(raw_data):
    if isinstance(raw_data, dict):
        return raw_data
    if isinstance(raw_data, str):
        try:
            parsed = json.loads(raw_data)
            return parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            return {}
    return {}


def _serialize_onboarding_snapshot(user):
    profile = UserProfile.objects.filter(user=user).first()
    if not profile:
        return {
            "has_profile": False,
            "education_stage": None,
            "weekly_hours": 0,
            "validation_mode": "mixed",
            "onboarding_data": {},
            "goal_statement": "",
            "target_role": "",
            "field_of_study": "",
            "readiness_score": 0,
            "onboarding_complete": False,
        }

    return {
        "has_profile": True,
        "education_stage": profile.education_stage or "not_set",
        "weekly_hours": profile.weekly_hours or 0,
        "validation_mode": profile.validation_mode or "mixed",
        "goal_statement": profile.goal_statement or "",
        "goal_type": profile.goal_type or "",
        "target_role": profile.target_role or "",
        "field_of_study": profile.field_of_study or "",
        "readiness_score": profile.readiness_score or 0,
        "onboarding_complete": bool(profile.onboarding_complete),
        "onboarding_data": _safe_onboarding_data(profile.onboarding_data),
    }


def _humanize_value(value):
    if value is None:
        return ""
    text = str(value).strip()
    if not text:
        return ""
    return text.replace("_", " ").replace("-", " ").title()


def _compact_text(value, max_len=60):
    text = str(value or "").strip()
    if not text:
        return ""
    return f"{text[:max_len]}..." if len(text) > max_len else text


def _list_preview(values, max_items=3, max_len=50):
    if not isinstance(values, list):
        return ""
    cleaned = [str(item).strip() for item in values if str(item).strip()]
    if not cleaned:
        return ""
    preview = ", ".join(cleaned[:max_items])
    return f"{preview[:max_len]}..." if len(preview) > max_len else preview


def _build_onboarding_highlights(snapshot):
    highlights = []
    onboarding_data = snapshot.get("onboarding_data") or {}
    stage = snapshot.get("education_stage") or "not_set"

    weekly_hours = snapshot.get("weekly_hours", 0)
    if weekly_hours:
        highlights.append(f"Weekly commitment: {weekly_hours} hrs")

    validation_mode = _humanize_value(snapshot.get("validation_mode", "mixed"))
    if validation_mode:
        highlights.append(f"Validation: {validation_mode}")

    if stage == "class_9_10":
        current_class = onboarding_data.get("class_9_10_current_class")
        board = onboarding_data.get("class_9_10_board")
        study_time = onboarding_data.get("daily_study_time")
        confusion_areas = _list_preview(
            onboarding_data.get("confusion_areas"), max_items=2)
        if current_class:
            highlights.append(f"Current class: {current_class}")
        if board:
            highlights.append(f"Board: {_humanize_value(board)}")
        if study_time:
            highlights.append(
                f"Daily study time: {_humanize_value(study_time)}")
        if confusion_areas:
            highlights.append(f"Needs support in: {confusion_areas}")

    elif stage == "class_11_12":
        current_class = onboarding_data.get("class_11_12_current_class")
        stream = onboarding_data.get("class_11_12_stream")
        exam_focus = onboarding_data.get("class_11_12_exam_focus")
        subjects_enjoyed = _list_preview(onboarding_data.get(
            "class_11_12_subjects_enjoyed"), max_items=2)
        help_needed = _compact_text(onboarding_data.get(
            "class_11_12_help_needed"), max_len=55)
        if current_class:
            highlights.append(f"Current class: {current_class}")
        if stream:
            highlights.append(f"Stream: {_humanize_value(stream)}")
        if exam_focus:
            highlights.append(f"Exam focus: {_humanize_value(exam_focus)}")
        if subjects_enjoyed:
            highlights.append(f"Enjoys: {subjects_enjoyed}")
        if help_needed:
            highlights.append(f"Help area: {help_needed}")

    elif stage == "undergraduate":
        degree = onboarding_data.get("ug_degree")
        year = onboarding_data.get("ug_year")
        aiming_for = onboarding_data.get("ug_aiming_for")
        skills = _list_preview(onboarding_data.get("ug_skills"), max_items=3)
        if degree:
            highlights.append(f"Degree: {degree}")
        if year:
            highlights.append(f"Year: {year}")
        if aiming_for:
            highlights.append(f"Goal path: {_humanize_value(aiming_for)}")
        if skills:
            highlights.append(f"Skills: {skills}")

    elif stage in ("postgraduate", "phd_research"):
        specialization = onboarding_data.get("pg_specialization")
        intent = onboarding_data.get("pg_intent")
        if specialization:
            highlights.append(f"Specialization: {specialization}")
        if intent:
            highlights.append(f"Intent: {_compact_text(intent, max_len=60)}")

    elif stage == "professional":
        goal_statement = snapshot.get("goal_statement")
        target_role = snapshot.get("target_role")
        field_of_study = snapshot.get("field_of_study")
        if target_role:
            highlights.append(f"Target role: {target_role}")
        if field_of_study:
            highlights.append(f"Domain: {field_of_study}")
        if goal_statement:
            highlights.append(
                f"Goal: {_compact_text(goal_statement, max_len=55)}")

    # Keep response compact for widget rendering.
    return [item for item in highlights if item][:6]


def _clamp_score(value, minimum=0, maximum=100):
    return max(minimum, min(maximum, int(round(value))))


def _safe_percentage(numerator, denominator):
    if denominator <= 0:
        return 0
    return round((numerator / denominator) * 100)


def _label_from_map(value, mapping):
    return mapping.get(value, _humanize_value(value)) if value else ""


def _extract_emotional_onboarding_answers(snapshot):
    onboarding_data = snapshot.get("onboarding_data") or {}

    pressure_label = _label_from_map(onboarding_data.get("pressure_response"), {
        "overthink": "tends to overthink under pressure",
        "panic_but_act": "acts even when pressure spikes",
        "shut_down": "shuts down under pressure",
        "stay_calm": "stays calm under pressure",
    })
    mock_response = _label_from_map(onboarding_data.get("mock_test_response"), {
        "try_harder": "pushes harder when work gets difficult",
        "check_soln": "looks for guided explanations when blocked",
        "feel_stressed": "stress rises when work gets difficult",
        "avoid": "avoids difficult work for a while",
    })
    effort_gap = _label_from_map(onboarding_data.get("dream_vs_effort"), {
        "aligned": "ambition and effort feel aligned",
        "needs_work": "ambition is ahead of current execution",
        "far_apart": "goal ambition is much higher than current execution",
    })
    time_preference = _label_from_map(onboarding_data.get("daily_time"), {
        "less_1hr": "has under 1 hour per day",
        "1_2hrs": "works best in 1 to 2 hour windows",
        "2_4hrs": "can sustain 2 to 4 focused hours",
        "4plus": "has high daily time availability",
    })

    signals = [
        pressure_label,
        mock_response,
        effort_gap,
        time_preference,
    ]
    return [signal for signal in signals if signal]


def _resolve_active_hours(session_hours):
    if not session_hours:
        return "Mixed"

    buckets = {
        "Morning": 0,
        "Afternoon": 0,
        "Evening": 0,
        "Night": 0,
    }
    for hour in session_hours:
        if 5 <= hour < 12:
            buckets["Morning"] += 1
        elif 12 <= hour < 17:
            buckets["Afternoon"] += 1
        elif 17 <= hour < 21:
            buckets["Evening"] += 1
        else:
            buckets["Night"] += 1

    return max(buckets, key=buckets.get)


def _build_behavioral_context(user, snapshot):
    from roadmap_ai.models import Roadmap

    now = dj_timezone.now()
    recent_cutoff = now - timedelta(days=14)
    previous_cutoff = now - timedelta(days=28)
    profile = UserProfile.objects.filter(user=user).first()
    execution_stats = UserStats.objects.filter(user=user).first()

    recent_tasks_qs = ExecutionTask.objects.filter(user=user, created_at__gte=recent_cutoff)
    previous_tasks_qs = ExecutionTask.objects.filter(
        user=user,
        created_at__lt=recent_cutoff,
        created_at__gte=previous_cutoff,
    )

    recent_sessions = list(FocusSession.objects.filter(user=user, started_at__gte=recent_cutoff).order_by('-started_at')[:40])
    previous_sessions = list(FocusSession.objects.filter(
        user=user,
        started_at__lt=recent_cutoff,
        started_at__gte=previous_cutoff,
    ).order_by('-started_at')[:40])

    recent_completed = recent_tasks_qs.filter(status='completed').count()
    recent_skipped = recent_tasks_qs.filter(status='skipped').count()
    recent_total = recent_tasks_qs.count()
    previous_completed = previous_tasks_qs.filter(status='completed').count()

    recent_completion_rate = _safe_percentage(recent_completed, max(1, recent_completed + recent_skipped))

    avg_session_minutes = 0
    session_lengths = []
    active_hours = []
    for session in recent_sessions:
        minutes = int(session.actual_minutes or session.planned_minutes or 0)
        if minutes > 0:
            session_lengths.append(minutes)
        if session.started_at:
            active_hours.append(session.started_at.hour)
    if session_lengths:
        avg_session_minutes = round(sum(session_lengths) / len(session_lengths))

    recent_active_days = {
        session.started_at.date().isoformat()
        for session in recent_sessions
        if session.started_at
    }
    previous_active_days = {
        session.started_at.date().isoformat()
        for session in previous_sessions
        if session.started_at
    }

    if len(recent_active_days) >= len(previous_active_days) + 2:
        consistency_trend = 'rising'
    elif len(recent_active_days) + 2 <= len(previous_active_days):
        consistency_trend = 'falling'
    else:
        consistency_trend = 'stable'

    long_recent_tasks = list(recent_tasks_qs.filter(estimated_minutes__gte=45))
    short_recent_tasks = list(recent_tasks_qs.filter(estimated_minutes__lt=45))
    long_skip_rate = _safe_percentage(
        sum(1 for task in long_recent_tasks if task.status == 'skipped'),
        len(long_recent_tasks),
    )
    short_skip_rate = _safe_percentage(
        sum(1 for task in short_recent_tasks if task.status == 'skipped'),
        len(short_recent_tasks),
    )

    hard_tasks = list(recent_tasks_qs.filter(difficulty='hard'))
    hard_skip_rate = _safe_percentage(
        sum(1 for task in hard_tasks if task.status == 'skipped'),
        len(hard_tasks),
    )

    current_streak = int(
        getattr(execution_stats, 'current_streak', 0)
        or getattr(profile, 'streak_count', 0)
        or 0
    )
    consistency_score = float(getattr(profile, 'consistency_score', 0.0) or 0.0)
    latest_roadmap = Roadmap.objects.filter(user=user).order_by('-updated_at').first()
    roadmap_type = _humanize_value(getattr(latest_roadmap, 'category', '') or snapshot.get('goal_type') or 'general')
    roadmap_difficulty = _humanize_value(getattr(latest_roadmap, 'difficulty_level', '') or '')

    emotional_answers = _extract_emotional_onboarding_answers(snapshot)
    stress_signal = any('stress' in answer or 'pressure' in answer or 'shuts down' in answer for answer in emotional_answers)

    momentum_score = _clamp_score(
        current_streak * 7
        + recent_completion_rate * 0.35
        + len(recent_active_days) * 4
        + consistency_score * 0.25
        - recent_skipped * 3
    )
    burnout_risk = _clamp_score(
        (20 if stress_signal else 0)
        + (15 if avg_session_minutes >= 50 else 6 if avg_session_minutes >= 35 else 0)
        + (16 if consistency_trend == 'falling' else 0)
        + (14 if snapshot.get('weekly_hours', 0) >= 20 else 0)
        + max(0, recent_skipped - recent_completed) * 4
    )
    dropoff_risk = _clamp_score(
        55
        - current_streak * 4
        + recent_skipped * 5
        + (18 if consistency_trend == 'falling' else 0)
        + (10 if len(recent_active_days) <= 2 else 0)
        - min(recent_completed, 6) * 3
    )
    recovery_speed = _clamp_score(
        50 + ((recent_completed - previous_completed) * 10) + ((len(recent_active_days) - len(previous_active_days)) * 8)
    )
    procrastination_index = _clamp_score((long_skip_rate * 0.55) + (hard_skip_rate * 0.45))

    behavioral_loops = []
    if long_skip_rate >= short_skip_rate + 20 and long_skip_rate >= 40:
        behavioral_loops.append('Long tasks are creating friction; shorter execution blocks should improve completion.')
    if hard_skip_rate >= 45:
        behavioral_loops.append('Difficult work is triggering avoidance, so challenge needs better ramping.')
    if _resolve_active_hours(active_hours) == 'Night' and recent_completed >= 3:
        behavioral_loops.append('Late-evening work is currently your most reliable execution window.')
    if current_streak >= 3 and consistency_trend == 'rising':
        behavioral_loops.append('Small wins are rebuilding discipline and increasing recovery speed.')
    if not behavioral_loops:
        behavioral_loops.append('Your current pattern is mixed, so the system should optimize for clarity before intensity.')

    return {
        'behavioral_inputs': {
            'streaks': current_streak,
            'completed_tasks': recent_completed,
            'skipped_tasks': recent_skipped,
            'roadmap_type': roadmap_type,
            'roadmap_difficulty': roadmap_difficulty,
            'active_hours': _resolve_active_hours(active_hours),
            'consistency_trend': consistency_trend,
            'emotional_onboarding_answers': emotional_answers,
            'session_duration': avg_session_minutes,
            'user_goals': snapshot.get('goal_statement') or snapshot.get('target_role') or 'Not set',
        },
        'behavioral_metrics': {
            'momentum_score': momentum_score,
            'burnout_risk': burnout_risk,
            'dropoff_risk': dropoff_risk,
            'recovery_speed': recovery_speed,
            'procrastination_index': procrastination_index,
            'completion_rate': recent_completion_rate,
            'consistency_score': _clamp_score(consistency_score),
        },
        'behavioral_loops': behavioral_loops[:4],
    }


def _build_rule_based_guidance(snapshot, behavior=None):
    behavior = behavior or {
        'behavioral_inputs': {},
        'behavioral_metrics': {},
        'behavioral_loops': [],
    }
    inputs = behavior.get('behavioral_inputs') or {}
    metrics = behavior.get('behavioral_metrics') or {}
    loops = behavior.get('behavioral_loops') or []

    if not snapshot.get("has_profile"):
        return {
            "identity_tag": "New User",
            "summary": "Complete onboarding to unlock a personalized weekly strategy tailored to your stage, goal, and pace.",
            "today_action": "Open your onboarding and fill in your education stage and goal statement.",
            "action_points": [
                "Finish your onboarding details with education stage and goal.",
                "Set a realistic weekly commitment you can sustain.",
                "Choose a validation mode that matches your workflow.",
            ],
            "strengths": ["You've taken the first step by signing up."],
            "risks": ["Without a goal statement, the AI cannot personalise your plan."],
            "pros": ["Planorah adapts entirely to your inputs."],
            "cons": ["Onboarding is incomplete — insights will be generic until you finish."],
            "week_plan": [
                {"slot": "Day 1", "focus": "Complete onboarding profile", "hours": 1},
                {"slot": "Day 2-3", "focus": "Set your first weekly goal", "hours": 1},
            ],
            "reflection_prompt": "What outcome do you want in the next 30 days?",
            "priority_focus": "Finish onboarding",
            "identity_type": "Explorer",
            "insight_card": {
                "type": "Identity Insight",
                "title": "Your behavior model is still forming",
                "description": "Planorah needs onboarding signals before it can predict execution risks or adapt your roadmap.",
                "action_label": "Complete onboarding",
                "confidence": 28,
            },
            "prediction": {
                "title": "Prediction pending",
                "description": "Once onboarding is complete, the engine will start modeling your execution risks and momentum.",
                "confidence": 24,
            },
            "strategy": {
                "headline": "Start with identity before optimization",
                "tactics": [
                    "Finish onboarding so the system knows your goal, pace, and pressure pattern.",
                    "Set one weekly target you can actually finish.",
                    "Create your first roadmap so future adaptations have structure.",
                ],
            },
            "roadmap_adaptation": {
                "status": "waiting_for_signal",
                "reason": "There is not enough behavioral data to safely adapt the roadmap yet.",
                "changes": [
                    "Keep the initial roadmap short and simple.",
                    "Delay aggressive pacing until the first week of activity is recorded.",
                ],
            },
            "future_self": {
                "current_path": "Generic planning without behavioral signal.",
                "optimized_path": "A personalized execution system after onboarding is complete.",
            },
            "behavioral_loops": loops,
            "source": "rule_based",
        }

    stage = (snapshot.get("education_stage")
             or "professional").replace("_", " ").title()
    weekly_hours = snapshot.get("weekly_hours", 0)
    validation_mode = snapshot.get("validation_mode", "mixed").title()
    goal_statement = snapshot.get("goal_statement") or snapshot.get(
        "target_role") or "a clear short-term outcome"
    readiness = snapshot.get("readiness_score", 0)
    momentum_score = metrics.get('momentum_score', 0)
    burnout_risk = metrics.get('burnout_risk', 0)
    dropoff_risk = metrics.get('dropoff_risk', 0)
    recovery_speed = metrics.get('recovery_speed', 0)
    procrastination_index = metrics.get('procrastination_index', 0)
    active_hours = inputs.get('active_hours') or 'Mixed'
    roadmap_type = inputs.get('roadmap_type') or 'General'

    if burnout_risk >= 68:
        insight_card = {
            "type": "Prediction Insight",
            "title": "Burnout risk is starting to rise",
            "description": f"Your recent pattern suggests load is outrunning recovery. Keep sessions tighter and reduce unnecessary volume this week.",
            "action_label": "Prevent Burnout",
            "confidence": max(65, burnout_risk),
        }
        prediction = {
            "title": "7-day overload warning",
            "description": "If the current load stays unchanged, disengagement risk will increase over the next week.",
            "confidence": max(60, burnout_risk - 4),
        }
        roadmap_adaptation = {
            "status": "recommended",
            "reason": "The roadmap pace is too aggressive for the current recovery pattern.",
            "changes": [
                "Reduce this week's task count by 20-30%.",
                "Insert one lighter recovery block before the hardest milestone.",
                "Keep high-focus work under 30 minutes until momentum stabilizes.",
            ],
        }
    elif dropoff_risk >= 68:
        insight_card = {
            "type": "Roadmap Insight",
            "title": "This roadmap is likely to lose you soon",
            "description": f"Your completion and skip pattern suggests the current roadmap pacing is too heavy for your behavior loop.",
            "action_label": "Rebalance Plan",
            "confidence": max(64, dropoff_risk),
        }
        prediction = {
            "title": "Drop-off risk detected",
            "description": "Without shorter milestones, roadmap abandonment risk is elevated over the next 10 days.",
            "confidence": max(60, dropoff_risk - 3),
        }
        roadmap_adaptation = {
            "status": "recommended",
            "reason": "The user is more likely to continue if milestones become shorter and more visible.",
            "changes": [
                "Break the next milestone into smaller proof-based tasks.",
                "Move one demanding task into a later slot.",
                "Front-load one quick win inside the next roadmap block.",
            ],
        }
    elif momentum_score >= 72:
        insight_card = {
            "type": "Momentum Insight",
            "title": "You are in a high-consistency window",
            "description": f"Execution is stabilizing right now. Protect the pattern instead of increasing ambition too fast.",
            "action_label": "Lock Momentum",
            "confidence": max(62, momentum_score),
        }
        prediction = {
            "title": "Momentum can compound",
            "description": "If this rhythm holds for another week, readiness and roadmap progress should rise meaningfully.",
            "confidence": max(58, momentum_score - 6),
        }
        roadmap_adaptation = {
            "status": "light_adjustment",
            "reason": "Momentum is strong enough to increase structure, not workload shock.",
            "changes": [
                "Preserve the current session pattern instead of lengthening every task.",
                "Add one stretch task, not a full extra workload block.",
                "Keep visible progress markers in the next roadmap phase.",
            ],
        }
    else:
        insight_card = {
            "type": "Behavioral Insight",
            "title": "Your system needs less friction, not more pressure",
            "description": "The current data suggests progress improves when execution is simpler and more concrete.",
            "action_label": "Optimize Tasks",
            "confidence": max(52, 100 - procrastination_index),
        }
        prediction = {
            "title": "Consistency is still fragile",
            "description": "Without a clearer execution rhythm, results will stay uneven even if motivation spikes.",
            "confidence": 56,
        }
        roadmap_adaptation = {
            "status": "recommended",
            "reason": "Too much ambiguity is reducing reliable execution.",
            "changes": [
                "Rewrite the next roadmap task as a single visible outcome.",
                "Shorten tasks that regularly cross 45 minutes.",
                "Place practical work before passive review sessions.",
            ],
        }

    strategy_tactics = [
        f"Work in your strongest window: {active_hours.lower()} sessions are currently the best fit.",
        f"Shape the next week around {roadmap_type.lower()} progress, not random task volume.",
        loops[0] if loops else "Protect small wins because they are stabilizing your execution loop.",
    ]

    action_points = [
        f"Block {max(3, weekly_hours)} focused hours this week across 3-5 sessions.",
        f"Start with one high-impact task directly aligned to {goal_statement}.",
        f"Use {validation_mode} validation consistently so progress stays measurable.",
    ]

    if readiness < 50:
        action_points.append(
            "Reduce scope for 7 days — consistency beats intensity right now.")
    else:
        action_points.append(
            "Increase challenge slightly this week to stay in the growth zone.")

    return {
        "identity_tag": f"{stage} Learner",
        "summary": f"Based on your {stage} onboarding profile, focus on a tight execution loop this week. Your {weekly_hours}h/week commitment is your primary constraint — protect it.",
        "today_action": f"Pick one task tied directly to '{goal_statement}' and do it for 25 minutes right now.",
        "action_points": action_points,
        "strengths": [
            f"Committed to {weekly_hours} hrs/week — a realistic starting point.",
            f"{validation_mode} validation means progress will stay measurable.",
        ],
        "risks": [
            "Without a roadmap, weekly effort may not compound into visible outcomes.",
            f"At {weekly_hours}h/week, scope creep is the biggest threat to finishing anything.",
        ],
        "pros": [
            "Onboarding data is in — AI can now personalise your strategy.",
            f"{stage} stage gives you a clear identity to build from.",
        ],
        "cons": [
            "Readiness score is still low — consider creating your first roadmap.",
            "No tasks or roadmap linked yet — the plan is only as good as execution.",
        ],
        "week_plan": [
            {"slot": "Day 1-2", "focus": "Define and write down your top weekly outcome",
                "hours": max(1, weekly_hours // 3)},
            {"slot": "Day 3-4", "focus": f"Deep work session on {goal_statement}",
                "hours": max(1, weekly_hours // 3)},
            {"slot": "Day 5-7", "focus": "Review, validate, and log progress",
                "hours": max(1, weekly_hours // 4)},
        ],
        "reflection_prompt": "Which single task this week would make your goal visibly closer?",
        "priority_focus": "Consistent weekly execution",
        "identity_type": (
            "Recovery Fighter" if recovery_speed >= 68 and momentum_score < 72
            else "Consistency Architect" if momentum_score >= 72
            else "Sprint Performer" if active_hours in ("Evening", "Night")
            else "Momentum Builder"
        ),
        "insight_card": insight_card,
        "prediction": prediction,
        "strategy": {
            "headline": f"Design your week around behavioral fit, not pressure.",
            "tactics": strategy_tactics,
        },
        "roadmap_adaptation": roadmap_adaptation,
        "future_self": {
            "current_path": f"At the current pace, progress on {goal_statement} will stay inconsistent.",
            "optimized_path": "With shorter loops and adaptive pacing, readiness should climb faster and feel more sustainable.",
        },
        "behavioral_loops": loops,
        "source": "rule_based",
    }


def _extract_text_from_gemini_response(payload):
    candidates = payload.get("candidates") or []
    if not candidates:
        return ""
    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    if not parts:
        return ""
    return (parts[0].get("text") or "").strip()


def _call_gemini_for_onboarding(snapshot):
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is missing")

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    )

    prompt = f"""
You are Planorah's elite learning strategist. You deeply understand students, their stage, goals, risks and execution gaps.
Analyse the user's onboarding profile and behavioral data below and return a RICH, evolving, personalised intelligence report.

Onboarding profile:
{json.dumps(snapshot, indent=2)}

Return ONLY valid JSON with this exact structure:
{{
  "identity_tag": "A short 2-5 word label that captures who this person is right now, e.g. 'Final-Year CS Builder', 'Research-Focused Postgrad'",
  "summary": "2-3 sentence honest summary of where this person stands. Not motivational fluff. Be real. Max 280 chars.",
  "today_action": "The single most important thing they should do TODAY. Be extremely specific. Max 120 chars.",
  "priority_focus": "One short phrase - the theme for this week. Max 60 chars.",
    "identity_type": "One of: Momentum Builder, Deep Focus Learner, Sprint Performer, Recovery Fighter, Chaos Explorer, Consistency Architect",
    "insight_card": {
        "type": "Behavioral Insight | Prediction Insight | Momentum Insight | Roadmap Insight | Identity Insight",
        "title": "Sharp card title. Max 70 chars.",
        "description": "1-2 sentences that explain WHY the user is succeeding or failing. Max 180 chars.",
        "action_label": "CTA label like Optimize Tasks / Prevent Burnout / Rebalance Plan / Lock Momentum",
        "confidence": 78
    },
    "prediction": {
        "title": "Short predictive headline. Max 60 chars.",
        "description": "Specific forward-looking outcome tied to current behavior. Max 160 chars.",
        "confidence": 74
    },
    "strategy": {
        "headline": "One-line summary of the user's optimized strategy. Max 100 chars.",
        "tactics": [
            "3 specific optimization tactics based on time, task pattern, and psychology. Max 120 chars each."
        ]
    },
    "roadmap_adaptation": {
        "status": "recommended | light_adjustment | stable",
        "reason": "Why the roadmap should adapt. Max 140 chars.",
        "changes": [
            "2-3 roadmap changes the system should make automatically. Max 120 chars each."
        ]
    },
    "future_self": {
        "current_path": "What happens if current behavior continues. Max 120 chars.",
        "optimized_path": "What happens if the optimized behavior strategy is followed. Max 120 chars."
    },
    "behavioral_loops": [
        "2-4 short descriptions of behavior loops or execution patterns. Max 120 chars each."
    ],
  "action_points": [
    "3-5 concrete weekly actions. Each must be specific to their stage, goal, and hours. Max 130 chars each."
  ],
  "strengths": [
    "2-3 genuine strengths based on their profile - what they have going for them. Max 100 chars each."
  ],
  "risks": [
    "2-3 real risks or blind spots they should watch out for, given their stage and pace. Max 100 chars each."
  ],
  "pros": [
    "2-3 advantages of their current path or approach. Specific, not generic. Max 100 chars each."
  ],
  "cons": [
    "2-3 honest downsides or gaps in their current setup. Max 100 chars each."
  ],
  "week_plan": [
    {{"slot": "Day 1-2", "focus": "specific task or topic", "hours": 2}},
    {{"slot": "Day 3-4", "focus": "specific task or topic", "hours": 2}},
    {{"slot": "Day 5-7", "focus": "specific task or topic", "hours": 1}}
  ],
  "reflection_prompt": "A sharp, thought-provoking question that forces honest self-assessment. Max 160 chars."
}}

Critical rules:
- Every field must reference the user's actual data (stage, goal, weekly_hours, domain).
- Use the behavioral inputs and metrics to explain patterns, predict failure or momentum, and adapt the roadmap.
- No generic advice. No filler. No empty encouragement.
- week_plan hours must sum to <= weekly_hours.
- Be the mentor they never had, not a chatbot.
""".strip()

    response = requests.post(
        url,
        headers={"Content-Type": "application/json"},
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.6,
                "topP": 0.92,
                "maxOutputTokens": 1200,
            },
        },
        timeout=30,
    )
    response.raise_for_status()

    model_text = _extract_text_from_gemini_response(response.json())
    if not model_text:
        raise ValueError("Empty response from Gemini")

    json_start = model_text.find("{")
    json_end = model_text.rfind("}")
    if json_start == -1 or json_end == -1:
        raise ValueError("Gemini did not return JSON")

    parsed = json.loads(model_text[json_start:json_end + 1])

    def _clean_list(key, min_items=1, max_items=5):
        items = parsed.get(key, [])
        if not isinstance(items, list):
            return []
        return [str(i).strip() for i in items if str(i).strip()][:max_items]

    summary = str(parsed.get("summary", "")).strip()
    action_points = _clean_list("action_points", min_items=3, max_items=5)

    if not summary or len(action_points) < 2:
        raise ValueError("Gemini response missing required fields")

    week_plan = []
    for slot in (parsed.get("week_plan") or [])[:3]:
        if isinstance(slot, dict):
            week_plan.append({
                "slot": str(slot.get("slot", "")).strip(),
                "focus": str(slot.get("focus", "")).strip(),
                "hours": int(slot.get("hours", 1)),
            })

    return {
        "identity_tag": str(parsed.get("identity_tag", "")).strip(),
        "summary": summary,
        "today_action": str(parsed.get("today_action", "")).strip(),
        "priority_focus": str(parsed.get("priority_focus", "Weekly execution")).strip(),
        "identity_type": str(parsed.get("identity_type", parsed.get("identity_tag", ""))).strip(),
        "insight_card": {
            "type": str((parsed.get("insight_card") or {}).get("type", "Behavioral Insight")).strip(),
            "title": str((parsed.get("insight_card") or {}).get("title", "Behavior pattern detected")).strip(),
            "description": str((parsed.get("insight_card") or {}).get("description", summary)).strip(),
            "action_label": str((parsed.get("insight_card") or {}).get("action_label", "Get Strategy")).strip(),
            "confidence": _clamp_score((parsed.get("insight_card") or {}).get("confidence", 72)),
        },
        "prediction": {
            "title": str((parsed.get("prediction") or {}).get("title", "Behavior forecast")).strip(),
            "description": str((parsed.get("prediction") or {}).get("description", "Your recent behavior is shaping your next outcome.")).strip(),
            "confidence": _clamp_score((parsed.get("prediction") or {}).get("confidence", 70)),
        },
        "strategy": {
            "headline": str((parsed.get("strategy") or {}).get("headline", "Optimize around your real working pattern.")).strip(),
            "tactics": [
                str(item).strip() for item in ((parsed.get("strategy") or {}).get("tactics") or []) if str(item).strip()
            ][:4],
        },
        "roadmap_adaptation": {
            "status": str((parsed.get("roadmap_adaptation") or {}).get("status", "stable")).strip(),
            "reason": str((parsed.get("roadmap_adaptation") or {}).get("reason", "Your roadmap can stay steady for now.")).strip(),
            "changes": [
                str(item).strip() for item in ((parsed.get("roadmap_adaptation") or {}).get("changes") or []) if str(item).strip()
            ][:4],
        },
        "future_self": {
            "current_path": str((parsed.get("future_self") or {}).get("current_path", "Current behavior will keep shaping progress.")).strip(),
            "optimized_path": str((parsed.get("future_self") or {}).get("optimized_path", "Optimized behavior should improve results faster.")).strip(),
        },
        "behavioral_loops": _clean_list("behavioral_loops", max_items=4),
        "action_points": action_points,
        "strengths": _clean_list("strengths", max_items=3),
        "risks": _clean_list("risks", max_items=3),
        "pros": _clean_list("pros", max_items=3),
        "cons": _clean_list("cons", max_items=3),
        "week_plan": week_plan,
        "reflection_prompt": str(parsed.get("reflection_prompt", "What is your highest-impact next step today?")).strip(),
        "source": "ai",
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # ← ADD THIS
def get_tasks(request):
    # Filter tasks by the authenticated user
    tasks = Task.objects.filter(user=request.user)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # ← ADD THIS
def create_task(request):
    serializer = TaskSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)  # ← Save with user
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    """Get summary statistics for the dashboard"""
    try:
        from roadmap_ai.models import Roadmap

        user = request.user

        cache_key = f"dashboard_stats:{user.id}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        # User Profile Data
        try:
            profile = user.profile
            streak = profile.streak_count
            xp = profile.xp_points
            level = profile.experience_level
            role = profile.target_role
            avatar = profile.avatar.url if profile.avatar else None
            bio = profile.bio
        except Exception:
            streak = 0
            xp = 0
            level = "N/A"
            role = "N/A"
            avatar = None
            bio = None

        # Roadmap counts
        total_roadmaps = Roadmap.objects.filter(user=user).count()
        latest_roadmap = Roadmap.objects.filter(
            user=user).order_by('-created_at').first()

        # Task counts
        total_tasks = Task.objects.filter(user=user).count()
        completed_tasks = Task.objects.filter(
            user=user, status='completed').count()
        pending_tasks = total_tasks - completed_tasks

        # Resume & ATS counts
        resume_count = Resume.objects.filter(user=user).count()
        ats_scans = ATSAnalysis.objects.filter(user=user).count()
        latest_ats = ATSAnalysis.objects.filter(
            user=user).order_by('-created_at').first()
        ats_score = latest_ats.match_score if latest_ats else 0

        response_data = {
            "profile": {
                "streak": streak,
                "xp": xp,
                "level": level,
                "role": role,
                "username": user.username,
                "avatar": avatar,
                "bio": bio
            },
            "roadmaps": {
                "total": total_roadmaps,
                "latest_title": latest_roadmap.title if latest_roadmap else None
            },
            "tasks": {
                "total": total_tasks,
                "completed": completed_tasks,
                "pending": pending_tasks
            },
            "tools": {
                "resumes_created": resume_count,
                "ats_scans": ats_scans,
                "latest_ats_score": ats_score
            }
        }

        cache.set(cache_key, response_data, 60)
        return Response(response_data)
    except Exception as e:
        return Response({
            "error": "Failed to fetch dashboard stats",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_onboarding_insights(request):
    """
    Generate AI-backed onboarding guidance from stored onboarding profile fields.
    Falls back to rule-based guidance when AI is unavailable.
    """
    snapshot = _serialize_onboarding_snapshot(request.user)
    behavioral_context = _build_behavioral_context(request.user, snapshot)
    fallback = _build_rule_based_guidance(snapshot, behavioral_context)
    analysis_snapshot = {
        **snapshot,
        **behavioral_context,
    }

    response_payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "onboarding_complete": bool(snapshot.get("onboarding_complete")),
        "education_stage": snapshot.get("education_stage"),
        "weekly_hours": snapshot.get("weekly_hours", 0),
        "validation_mode": snapshot.get("validation_mode", "mixed"),
        "readiness_score": snapshot.get("readiness_score", 0),
        "onboarding_highlights": _build_onboarding_highlights(snapshot),
        # Rich fields (filled by AI or fallback)
        "identity_tag": "",
        "today_action": "",
        "strengths": [],
        "risks": [],
        "pros": [],
        "cons": [],
        "week_plan": [],
        "behavioral_inputs": {},
        "behavioral_metrics": {},
        "behavioral_loops": [],
        "identity_type": "",
        "insight_card": {},
        "prediction": {},
        "strategy": {},
        "roadmap_adaptation": {},
        "future_self": {},
    }
    response_payload.update(behavioral_context)
    response_payload.update(fallback)

    try:
        ai_result = _call_gemini_for_onboarding(analysis_snapshot)
        response_payload.update(ai_result)
        return Response(response_payload, status=status.HTTP_200_OK)
    except Exception:
        return Response(response_payload, status=status.HTTP_200_OK)


def _get_or_create_user_stats(user):
    stats, _ = UserStats.objects.get_or_create(user=user)
    return stats


def _level_from_xp(xp_points):
    if xp_points >= 1500:
        return 'Elite'
    if xp_points >= 500:
        return 'Focused'
    return 'Beginner'


LEAGUE_TIERS = [
    {'name': 'Bronze League', 'min': 0, 'max': 499},
    {'name': 'Silver League', 'min': 500, 'max': 999},
    {'name': 'Gold League', 'min': 1000, 'max': 1699},
    {'name': 'Platinum League', 'min': 1700, 'max': 2599},
    {'name': 'Diamond League', 'min': 2600, 'max': 999999},
]


def _display_name_for_user(user):
    first = (getattr(user, 'first_name', '') or '').strip()
    last = (getattr(user, 'last_name', '') or '').strip()
    if first and last:
        return f"{first} {last}"
    if first:
        return first
    return (getattr(user, 'username', '') or 'User').strip() or 'User'


def _league_points_from_stats(stats_obj):
    # League score is grounded in backend-tracked progress only.
    xp_points = int(getattr(stats_obj, 'xp_points', 0) or 0)
    streak_bonus = int(getattr(stats_obj, 'current_streak', 0) or 0) * 5
    completion_bonus = int(getattr(stats_obj, 'tasks_completed', 0) or 0) * 2
    return xp_points + streak_bonus + completion_bonus


def _build_league_payload(user, stats):
    league_points = _league_points_from_stats(stats)
    tier = next(
        (item for item in LEAGUE_TIERS if item['min']
         <= league_points <= item['max']),
        LEAGUE_TIERS[0],
    )

    tier_span = max(1, tier['max'] - tier['min'] + 1)
    tier_progress = max(0, league_points - tier['min'])
    progress_percent = min(100, int((tier_progress / tier_span) * 100))

    next_tier = next(
        (item for item in LEAGUE_TIERS if item['min'] > tier['min']), None)
    points_to_next_tier = max(
        0, (next_tier['min'] - league_points)) if next_tier else 0

    ranked_stats = list(
        UserStats.objects.select_related('user')
        .filter(user__is_active=True)
        .order_by('-xp_points', '-tasks_completed', '-current_streak', 'updated_at')
    )

    total_participants = len(ranked_stats)
    leaderboard = []
    current_user_rank = None

    for idx, stat_row in enumerate(ranked_stats, start=1):
        row_points = _league_points_from_stats(stat_row)
        is_me = stat_row.user_id == user.id
        if is_me:
            current_user_rank = idx

        if idx <= 10 or is_me:
            leaderboard.append({
                'rank': idx,
                'user_id': stat_row.user_id,
                'name': _display_name_for_user(stat_row.user),
                'username': stat_row.user.username,
                'league_points': row_points,
                'xp_points': stat_row.xp_points,
                'tasks_completed': stat_row.tasks_completed,
                'current_streak': stat_row.current_streak,
                'is_me': is_me,
            })

    if current_user_rank is None:
        current_user_rank = 1

    return {
        'league_points': league_points,
        'tier': tier['name'],
        'progress_percent': progress_percent,
        'points_to_next_tier': points_to_next_tier,
        'next_tier': next_tier['name'] if next_tier else None,
        'rank': current_user_rank,
        'total_participants': total_participants,
        'leaderboard': leaderboard,
    }


def _update_streak(stats, completed_day):
    if not completed_day:
        return

    if stats.last_completed_date is None:
        stats.current_streak = 1
    elif completed_day == stats.last_completed_date:
        pass
    elif completed_day == stats.last_completed_date + timedelta(days=1):
        stats.current_streak += 1
    else:
        stats.current_streak = 1

    stats.last_completed_date = completed_day
    if stats.current_streak > stats.longest_streak:
        stats.longest_streak = stats.current_streak

    Streak.objects.update_or_create(
        user=stats.user,
        day=completed_day,
        defaults={'active': True},
    )


def _apply_completion_rewards(user, task):
    """Apply XP/streak reward once per completed task."""
    if not task or task.status != 'completed':
        stats = _get_or_create_user_stats(user)
        return {
            'applied': False,
            'xp_gain': 0,
            'stats': UserStatsSerializer(stats).data,
        }

    existing_log = XPLog.objects.filter(
        user=user,
        task=task,
        reason='TASK_COMPLETION_REWARD',
    ).exists()

    stats = _get_or_create_user_stats(user)
    if existing_log:
        return {
            'applied': False,
            'xp_gain': 0,
            'stats': UserStatsSerializer(stats).data,
        }

    xp_gain = 40 if task.task_type == 'exam' else 25
    stats.xp_points += xp_gain
    stats.tasks_completed += 1
    _update_streak(stats, dj_timezone.localdate())
    stats.level = _level_from_xp(stats.xp_points)
    stats.save()

    XPLog.objects.create(
        user=user,
        task=task,
        points=xp_gain,
        reason='TASK_COMPLETION_REWARD',
    )

    return {
        'applied': True,
        'xp_gain': xp_gain,
        'stats': UserStatsSerializer(stats).data,
    }


def _build_execution_task_guidance(task):
    planned_minutes = max(5, int(task.estimated_minutes or 25))
    setup_minutes = max(5, int(planned_minutes * 0.2))
    wrap_minutes = max(5, int(planned_minutes * 0.2))
    execute_minutes = max(10, planned_minutes - setup_minutes - wrap_minutes)

    objective = task.reason or f"Complete: {task.title}"
    metadata = task.metadata if isinstance(task.metadata, dict) else {}

    base_steps = [
        {
            'step': 1,
            'title': 'Define Expected Output',
            'description': objective,
        },
        {
            'step': 2,
            'title': 'Prepare Work Context',
            'description': 'Open only the required tools/resources and remove distractions before execution.',
        },
        {
            'step': 3,
            'title': 'Execute Focused Work',
            'description': 'Finish one concrete output that moves this task forward meaningfully.',
        },
        {
            'step': 4,
            'title': 'Review and Log Next Action',
            'description': 'Validate what you completed and write the immediate next step.',
        },
    ]

    if metadata.get('source') == 'exam_plan':
        base_steps[2]['description'] = 'Solve focused exam-style work for this topic and verify correctness.'

    return {
        'generated': True,
        'objective': objective,
        'time_breakdown': [
            {'duration': f'{setup_minutes} min',
                'activity': 'Review objective and gather required context'},
            {'duration': f'{execute_minutes} min',
                'activity': 'Execute deep work on the main deliverable'},
            {'duration': f'{wrap_minutes} min',
                'activity': 'Validate output and capture follow-up actions'},
        ],
        'steps': base_steps,
        'best_practices': [
            'Commit to one outcome for this session before you begin.',
            'Avoid context switching while the focus timer is active.',
            'End the session only after validating the output quality.',
        ],
        'common_mistakes': [
            'Starting work without defining what done looks like.',
            'Over-scoping the session and shipping nothing concrete.',
            'Skipping final review/logging before ending focus mode.',
        ],
        'quick_tips': [
            'Keep just one priority tab/window open for the core task.',
            'Use the time breakdown as a hard boundary for scope control.',
            'Write one-line next action before ending the timer.',
        ],
        'estimated_minutes': planned_minutes,
        'task_type': task.task_type,
        'metadata': metadata,
    }


def _roadmap_status_to_execution_status(status_value):
    status_value = str(status_value or '').strip().lower()
    mapping = {
        'not_started': 'pending',
        'in_progress': 'in_progress',
        'pending_validation': 'in_progress',
        'needs_revision': 'pending',
        'completed': 'completed',
    }
    return mapping.get(status_value, 'pending')


def _execution_status_to_roadmap_status(status_value):
    status_value = str(status_value or '').strip().lower()
    mapping = {
        'completed': 'completed',
        'in_progress': 'in_progress',
        'pending': 'not_started',
        'skipped': 'not_started',
    }
    return mapping.get(status_value, 'not_started')


def _sync_roadmap_tasks_into_execution(user):
    """
    Mirror roadmap tasks (tasks.Task) into execution tasks so dashboard and focus mode
    stay aligned with day-wise roadmap scheduling.
    """
    try:
        from tasks.models import Task as RoadmapTask
    except Exception:
        return

    roadmap_tasks = RoadmapTask.objects.filter(
        user=user).select_related('roadmap', 'milestone')
    for source_task in roadmap_tasks:
        estimated_minutes = max(1, int(source_task.estimated_minutes or 25))
        status = _roadmap_status_to_execution_status(source_task.status)
        completed_at = source_task.completed_at if status == 'completed' else None

        ExecutionTask.objects.update_or_create(
            id=source_task.task_id,
            user=user,
            defaults={
                'title': source_task.title,
                'task_type': 'learning',
                'status': status,
                'priority': 'medium',
                'difficulty': 'medium',
                'estimated_time': f'{estimated_minutes} min',
                'estimated_minutes': estimated_minutes,
                'reason': source_task.objective or source_task.description or '',
                'ai_generated': False,
                'metadata': {
                    'source': 'roadmap_task',
                    'roadmap_id': source_task.roadmap_id,
                    'milestone_id': source_task.milestone_id,
                    'day': source_task.day,
                },
                'scheduled_for': source_task.due_date,
                'completed_at': completed_at,
            },
        )


def _sync_execution_status_to_roadmap_task(user, execution_task):
    """
    When mirrored execution tasks are updated from dashboard/focus mode,
    propagate status back to the source roadmap task.
    """
    try:
        from tasks.models import Task as RoadmapTask
        source_task = RoadmapTask.objects.get(
            task_id=execution_task.id, user=user)
    except Exception:
        return

    next_status = _execution_status_to_roadmap_status(execution_task.status)
    update_fields = []

    if source_task.status != next_status:
        source_task.status = next_status
        update_fields.append('status')

    next_completed_at = execution_task.completed_at if next_status == 'completed' else None
    if source_task.completed_at != next_completed_at:
        source_task.completed_at = next_completed_at
        update_fields.append('completed_at')

    if update_fields:
        source_task.save(update_fields=update_fields + ['updated_at'])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_today_task(request):
    try:
        _sync_roadmap_tasks_into_execution(request.user)
        today = dj_timezone.localdate()
        all_pending_qs = ExecutionTask.objects.filter(
            user=request.user,
            status__in=['pending', 'in_progress'],
        )
        real_pending_qs = all_pending_qs.filter(ai_generated=False)
        pending_qs = real_pending_qs if real_pending_qs.exists() else all_pending_qs

        today_task = ExecutionTask.objects.filter(
            user=request.user,
            scheduled_for=today,
            status__in=['pending', 'in_progress'],
            ai_generated=False,
        ).order_by('created_at').first()

        if not today_task:
            nearest_scheduled_task = pending_qs.exclude(
                scheduled_for__isnull=True
            ).order_by('scheduled_for', 'created_at').first()

            if nearest_scheduled_task:
                today_task = nearest_scheduled_task

        if not today_task:
            unscheduled_task = pending_qs.filter(
                scheduled_for__isnull=True
            ).order_by('-priority', 'created_at').first()

            if unscheduled_task:
                today_task = unscheduled_task

        if not today_task:
            today_task = ExecutionTask.objects.filter(
                user=request.user,
                scheduled_for=today,
                status__in=['pending', 'in_progress'],
                ai_generated=True,
            ).order_by('created_at').first()

        if not today_task:
            stats = _get_or_create_user_stats(request.user)
            pending = pending_qs.order_by('-priority', 'created_at')[:5]

            profile = UserProfile.objects.filter(user=request.user).first()
            payload = {
                'goals': {
                    'goal_statement': getattr(profile, 'goal_statement', ''),
                    'target_role': getattr(profile, 'target_role', ''),
                    'weekly_hours': getattr(profile, 'weekly_hours', 0),
                },
                'consistency': {
                    'current_streak': stats.current_streak,
                    'tasks_completed': stats.tasks_completed,
                },
                'pending_tasks': [item.title for item in pending],
            }

            try:
                recommendation = generate_coach_recommendation(payload)
            except Exception:
                recommendation = {
                    'task': 'Start one focused 25-minute study sprint',
                    'reason': 'Small wins rebuild momentum and improve consistency.',
                    'difficulty': 'medium',
                    'estimated_time': '25 min',
                    'alternatives': [],
                }

            today_task = ExecutionTask.objects.create(
                user=request.user,
                title=recommendation['task'],
                task_type='learning',
                status='pending',
                priority='high',
                difficulty=recommendation['difficulty'],
                estimated_time=recommendation['estimated_time'],
                estimated_minutes=25,
                reason=recommendation['reason'],
                ai_generated=True,
                metadata={'alternatives': recommendation.get(
                    'alternatives', [])},
                scheduled_for=today,
            )

        data = ExecutionTaskSerializer(today_task).data
        return Response(data, status=status.HTTP_200_OK)
    except Exception as exc:
        # Return a non-blocking fallback so dashboard can still render.
        return Response({
            'id': None,
            'title': 'Start one focused 25-minute study sprint',
            'type': 'learning',
            'status': 'pending',
            'priority': 'medium',
            'difficulty': 'medium',
            'estimated_time': '25 min',
            'estimated_minutes': 25,
            'reason': 'Service is temporarily recovering. You can still start a manual focus sprint.',
            'ai_generated': True,
            'metadata': {'fallback': True},
            'scheduled_for': str(dj_timezone.localdate()),
            'completed_at': None,
            'created_at': None,
            'updated_at': None,
            'detail': 'Unable to load today task.',
            'error': str(exc),
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_coach(request):
    try:
        stats = _get_or_create_user_stats(request.user)

        pending_tasks = ExecutionTask.objects.filter(
            user=request.user,
            status__in=['pending', 'in_progress'],
        ).order_by('-priority', 'created_at')[:6]

        profile = UserProfile.objects.filter(user=request.user).first()
        payload = {
            'progress': request.data.get('progress') or {
                'tasks_completed': stats.tasks_completed,
                'xp_points': stats.xp_points,
                'focus_minutes': stats.focus_minutes,
            },
            'pending_tasks': request.data.get('pending_tasks') or [item.title for item in pending_tasks],
            'consistency': request.data.get('past_consistency') or {
                'current_streak': stats.current_streak,
                'longest_streak': stats.longest_streak,
            },
            'learning_goals': request.data.get('learning_goals') or {
                'goal_statement': getattr(profile, 'goal_statement', ''),
                'target_role': getattr(profile, 'target_role', ''),
            },
        }

        recommendation = generate_coach_recommendation(payload)
        return Response(recommendation, status=status.HTTP_200_OK)
    except Exception:
        return Response({
            'task': 'Start one focused 25-minute study sprint',
            'reason': 'Small wins rebuild momentum and improve consistency.',
            'difficulty': 'medium',
            'estimated_time': '25 min',
            'alternatives': [],
        }, status=status.HTTP_200_OK)


@api_view(['GET', 'POST', 'PATCH'])
@permission_classes([IsAuthenticated])
def execution_tasks(request):
    try:
        if request.method == 'GET':
            _sync_roadmap_tasks_into_execution(request.user)
            task_type = request.query_params.get('type')
            queryset = ExecutionTask.objects.filter(user=request.user)
            if task_type in {'learning', 'exam'}:
                queryset = queryset.filter(task_type=task_type)
            serializer = ExecutionTaskSerializer(
                queryset.order_by('-created_at'), many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        if request.method == 'POST':
            serializer = ExecutionTaskSerializer(data=request.data)
            if serializer.is_valid():
                task = serializer.save(user=request.user)
                return Response(ExecutionTaskSerializer(task).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        task_id = request.data.get('id')
        if not task_id:
            return Response({'detail': 'Task id is required for PATCH.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            task = ExecutionTask.objects.get(id=task_id, user=request.user)
        except ExecutionTask.DoesNotExist:
            return Response({'detail': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

        was_completed = task.status == 'completed'
        serializer = ExecutionTaskSerializer(
            task, data=request.data, partial=True)
        if serializer.is_valid():
            with transaction.atomic():
                updated_task = serializer.save()
                if updated_task.status == 'completed' and not was_completed:
                    updated_task.completed_at = dj_timezone.now()
                    updated_task.save(update_fields=['completed_at'])
                    _apply_completion_rewards(request.user, updated_task)
                    _track_behavior_event(request.user, 'task_completed', {
                        'task_id': str(updated_task.id),
                        'task_title': updated_task.title,
                        'difficulty': updated_task.difficulty,
                        'task_type': updated_task.task_type,
                        'estimated_minutes': updated_task.estimated_minutes,
                    })
                elif updated_task.status == 'skipped' and not was_completed:
                    _track_behavior_event(request.user, 'task_skipped', {
                        'task_id': str(updated_task.id),
                        'task_title': updated_task.title,
                        'difficulty': updated_task.difficulty,
                        'task_type': updated_task.task_type,
                    })
                elif updated_task.status == 'in_progress':
                    _track_behavior_event(request.user, 'task_started', {
                        'task_id': str(updated_task.id),
                        'task_title': updated_task.title,
                    })
                _sync_execution_status_to_roadmap_task(
                    request.user, updated_task)

            return Response(ExecutionTaskSerializer(updated_task).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        if request.method == 'GET':
            return Response([], status=status.HTTP_200_OK)
        return Response({'detail': 'Unable to load execution tasks.', 'error': str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def execution_task_guidance(request, task_id):
    try:
        task = ExecutionTask.objects.get(id=task_id, user=request.user)
    except ExecutionTask.DoesNotExist:
        return Response({'detail': 'Execution task not found.'}, status=status.HTTP_404_NOT_FOUND)

    guidance = _build_execution_task_guidance(task)
    return Response(guidance, status=status.HTTP_200_OK)


@api_view(['POST', 'PATCH'])
@permission_classes([IsAuthenticated])
def focus_session(request):
    if request.method == 'POST':
        serializer = FocusSessionSerializer(data=request.data)
        if serializer.is_valid():
            session = serializer.save(user=request.user, status='active')
            _track_behavior_event(request.user, 'session_started', {
                'session_id': str(session.id),
                'planned_minutes': session.planned_minutes,
                'started_hour': dj_timezone.now().hour,
            })
            return Response(FocusSessionSerializer(session).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    session_id = request.data.get('id')
    if not session_id:
        return Response({'detail': 'Session id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        session = FocusSession.objects.get(id=session_id, user=request.user)
    except FocusSession.DoesNotExist:
        return Response({'detail': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = FocusSessionSerializer(
        session, data=request.data, partial=True)
    if serializer.is_valid():
        updated = serializer.save()
        if updated.status in {'completed', 'cancelled'} and not updated.ended_at:
            updated.ended_at = dj_timezone.now()
            updated.save(update_fields=['ended_at'])

        if updated.status == 'completed':
            stats = _get_or_create_user_stats(request.user)
            stats.focus_minutes += int(
                updated.actual_minutes or updated.planned_minutes or 0)
            stats.save(update_fields=['focus_minutes', 'updated_at'])
            _track_behavior_event(request.user, 'session_ended', {
                'session_id': str(updated.id),
                'planned_minutes': updated.planned_minutes,
                'actual_minutes': updated.actual_minutes or 0,
            })
        elif updated.status == 'cancelled':
            _track_behavior_event(request.user, 'session_quit', {
                'session_id': str(updated.id),
                'planned_minutes': updated.planned_minutes,
                'actual_minutes': updated.actual_minutes or 0,
            })

        return Response(FocusSessionSerializer(updated).data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def exam_plan(request):
    syllabus_text = (request.data.get('syllabus_text') or '').strip()
    exam_pattern = (request.data.get('exam_pattern') or '').strip()

    if not syllabus_text:
        return Response({'detail': 'syllabus_text is required.'}, status=status.HTTP_400_BAD_REQUEST)

    payload = {
        'syllabus_text': syllabus_text,
        'exam_pattern': exam_pattern,
    }
    plan_data = generate_exam_plan(payload)

    ExamPlan.objects.filter(
        user=request.user, is_active=True).update(is_active=False)
    plan = ExamPlan.objects.create(
        user=request.user,
        title='Exam Mode Plan',
        syllabus_text=syllabus_text,
        exam_pattern=exam_pattern,
        topics=plan_data['topics'],
        revision_schedule=plan_data['revision_schedule'],
        raw_ai_response=plan_data,
        is_active=True,
    )

    for topic in plan_data['topics']:
        ExecutionTask.objects.create(
            user=request.user,
            title=f"Exam Prep: {topic.get('topic')}",
            task_type='exam',
            status='pending',
            priority='high' if topic.get('priority') == 'high' else 'medium',
            difficulty='hard' if topic.get('priority') == 'high' else 'medium',
            estimated_time='45 min',
            estimated_minutes=45,
            reason='Generated from exam mode syllabus.',
            ai_generated=True,
            metadata={'source': 'exam_plan', 'topic': topic.get('topic')},
            scheduled_for=dj_timezone.localdate(),
        )

    return Response(ExamPlanSerializer(plan).data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def execution_progress(request):
    try:
        stats = _get_or_create_user_stats(request.user)
        latest_plan = ExamPlan.objects.filter(
            user=request.user, is_active=True).first()
        weekly_completed = ExecutionTask.objects.filter(
            user=request.user,
            status='completed',
            completed_at__date__gte=dj_timezone.localdate() - timedelta(days=6),
        ).count()

        payload = {
            'stats': UserStatsSerializer(stats).data,
            'weekly_completed': weekly_completed,
            'mode': 'exam' if latest_plan else 'learning',
            'active_exam_plan': ExamPlanSerializer(latest_plan).data if latest_plan else None,
            'league': _build_league_payload(request.user, stats),
        }
        return Response(payload, status=status.HTTP_200_OK)
    except Exception as exc:
        return Response({
            'stats': {
                'xp_points': 0,
                'current_streak': 0,
                'longest_streak': 0,
                'tasks_completed': 0,
                'focus_minutes': 0,
                'level': 'Beginner',
                'progress_label': 'Start your first task',
            },
            'weekly_completed': 0,
            'mode': 'learning',
            'active_exam_plan': None,
            'league': None,
            'detail': 'Unable to load execution progress.',
            'error': str(exc),
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rewards_apply(request):
    task_id = request.data.get('task_id')
    if not task_id:
        return Response({'detail': 'task_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        task = ExecutionTask.objects.get(id=task_id, user=request.user)
    except ExecutionTask.DoesNotExist:
        return Response({'detail': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

    reward_result = _apply_completion_rewards(request.user, task)
    return Response(reward_result, status=status.HTTP_200_OK)
