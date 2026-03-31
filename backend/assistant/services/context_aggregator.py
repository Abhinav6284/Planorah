import json
from typing import Any, Dict
from datetime import timedelta

from django.utils import timezone

from dashboard.models import ExecutionTask, UserStats
from planora.models import Subject, Topic
from roadmap_ai.models import Milestone, Roadmap
from scheduler.models import Event
from tasks.models import Task
from users.models import UserProfile

from .pipeline_config import (
    AI_PIPELINE_MAX_BACKEND_CONTEXT_BYTES,
    AI_PIPELINE_MAX_FRONTEND_CONTEXT_BYTES,
)


def _truncate_json_payload(payload: Dict[str, Any], max_bytes: int) -> Dict[str, Any]:
    if max_bytes <= 0:
        return {}

    encoded = json.dumps(payload, ensure_ascii=True, default=str).encode("utf-8")
    if len(encoded) <= max_bytes:
        return payload

    compact = {
        "truncated": True,
        "message": "Context trimmed due to payload size limit.",
    }
    compact_encoded = json.dumps(compact).encode("utf-8")
    if len(compact_encoded) > max_bytes:
        return {"truncated": True}

    return compact


def _safe_frontend_context(frontend_context: Any) -> Dict[str, Any]:
    if not isinstance(frontend_context, dict):
        return {}

    allowed = {
        "path",
        "context_source",
        "selected_ids",
        "visible_panel",
        "ui_state",
        "active_tab",
        "metadata",
    }
    filtered = {key: frontend_context.get(key) for key in allowed if key in frontend_context}
    return _truncate_json_payload(filtered, AI_PIPELINE_MAX_FRONTEND_CONTEXT_BYTES)


def _build_writable_targets() -> Dict[str, Any]:
    return {
        "domains": [
            "roadmap",
            "tasks",
            "execution",
            "scheduler",
            "planora",
            "projects",
            "resume_workflow",
        ],
        "always_confirm": True,
        "restricted_domains": [
            "auth",
            "billing",
            "subscription",
            "music_integration",
            "account_delete",
        ],
    }


def build_backend_context(user, context_source: str, frontend_context: Any = None) -> Dict[str, Any]:
    profile = UserProfile.objects.filter(user=user).first()

    roadmaps_qs = Roadmap.objects.filter(user=user).order_by("-created_at")
    roadmap_items = []
    for roadmap in roadmaps_qs[:5]:
        milestones = Milestone.objects.filter(roadmap=roadmap).order_by("order")
        roadmap_items.append({
            "id": roadmap.id,
            "title": roadmap.title,
            "goal": roadmap.goal,
            "category": roadmap.category,
            "difficulty": roadmap.difficulty_level,
            "total_milestones": milestones.count(),
            "completed_milestones": milestones.filter(is_completed=True).count(),
        })

    task_qs = Task.objects.filter(user=user)
    task_summary = {
        "total": task_qs.count(),
        "completed": task_qs.filter(status="completed").count(),
        "pending": task_qs.exclude(status="completed").count(),
        "in_progress": task_qs.filter(status="in_progress").count(),
        "not_started": task_qs.filter(status="not_started").count(),
    }
    pending_tasks = list(
        task_qs.exclude(status="completed")
        .order_by("due_date", "day")
        .values("task_id", "title", "status", "due_date", "day")[:12]
    )

    execution_qs = ExecutionTask.objects.filter(user=user)
    execution_stats = UserStats.objects.filter(user=user).first()
    execution_summary = {
        "total": execution_qs.count(),
        "completed": execution_qs.filter(status="completed").count(),
        "pending": execution_qs.filter(status__in=["pending", "in_progress"]).count(),
        "weekly_completed": execution_qs.filter(
            status="completed",
            completed_at__date__gte=timezone.localdate() - timedelta(days=6),
        ).count(),
        "current_streak": getattr(execution_stats, "current_streak", 0),
        "longest_streak": getattr(execution_stats, "longest_streak", 0),
        "xp_points": getattr(execution_stats, "xp_points", 0),
    }

    scheduler_summary = {
        "upcoming_count": Event.objects.filter(
            user=user,
            start_time__gte=timezone.now(),
        ).count(),
        "next_events": list(
            Event.objects.filter(user=user, start_time__gte=timezone.now())
            .order_by("start_time")
            .values("id", "title", "start_time", "end_time")[:5]
        ),
    }

    subjects = Subject.objects.filter(user=user)
    planora_summary = {
        "subjects_count": subjects.count(),
        "topics_count": Topic.objects.filter(subject__user=user).count(),
        "subjects": list(
            subjects.order_by("-updated_at").values("id", "name", "updated_at")[:6]
        ),
    }

    backend_context = {
        "context_source": context_source or "assistant",
        "profile": {
            "name": f"{(user.first_name or '').strip()} {(user.last_name or '').strip()}".strip() or user.username,
            "username": user.username,
            "goal_statement": getattr(profile, "goal_statement", ""),
            "target_role": getattr(profile, "target_role", ""),
            "weekly_hours": getattr(profile, "weekly_hours", 0),
            "domain": getattr(profile, "domain", ""),
            "streak": getattr(profile, "streak_count", 0),
            "xp_points": getattr(profile, "xp_points", 0),
        },
        "roadmaps": {
            "count": roadmaps_qs.count(),
            "items": roadmap_items,
        },
        "tasks": {
            "summary": task_summary,
            "pending_items": pending_tasks,
        },
        "execution": execution_summary,
        "scheduler": scheduler_summary,
        "planora": planora_summary,
        "writable_targets": _build_writable_targets(),
        "runtime": {
            "timezone": str(timezone.get_current_timezone_name()),
            "generated_at": timezone.now().isoformat(),
        },
        "frontend_context": _safe_frontend_context(frontend_context),
    }

    return _truncate_json_payload(backend_context, AI_PIPELINE_MAX_BACKEND_CONTEXT_BYTES)
