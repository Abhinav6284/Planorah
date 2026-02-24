import json
import os
from datetime import datetime, timezone

import requests
from django.conf import settings
from dotenv import load_dotenv
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ats.models import ATSAnalysis
from resume.models import Resume
from users.models import UserProfile

from .models import DailySummary, Task
from .serializers import DailySummarySerializer, TaskSerializer


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


def _build_rule_based_guidance(snapshot):
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
            "source": "rule_based",
        }

    stage = (snapshot.get("education_stage")
             or "professional").replace("_", " ").title()
    weekly_hours = snapshot.get("weekly_hours", 0)
    validation_mode = snapshot.get("validation_mode", "mixed").title()
    goal_statement = snapshot.get("goal_statement") or snapshot.get(
        "target_role") or "a clear short-term outcome"
    readiness = snapshot.get("readiness_score", 0)

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
Analyse the user's onboarding profile below and return a RICH, evolving, personalised intelligence report.

Onboarding profile:
{json.dumps(snapshot, indent=2)}

Return ONLY valid JSON with this exact structure:
{{
  "identity_tag": "A short 2-5 word label that captures who this person is right now, e.g. 'Final-Year CS Builder', 'Research-Focused Postgrad'",
  "summary": "2-3 sentence honest summary of where this person stands. Not motivational fluff. Be real. Max 280 chars.",
  "today_action": "The single most important thing they should do TODAY. Be extremely specific. Max 120 chars.",
  "priority_focus": "One short phrase - the theme for this week. Max 60 chars.",
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

        return Response({
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
        })
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
    fallback = _build_rule_based_guidance(snapshot)

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
    }

    try:
        ai_result = _call_gemini_for_onboarding(snapshot)
        response_payload.update(ai_result)
        return Response(response_payload, status=status.HTTP_200_OK)
    except Exception:
        response_payload.update(fallback)
        return Response(response_payload, status=status.HTTP_200_OK)
