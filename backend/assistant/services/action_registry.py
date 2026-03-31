from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict, Optional

from dashboard.models import ExecutionTask
from rest_framework.test import APIRequestFactory, force_authenticate
from roadmap_ai.models import Milestone
from tasks.models import Task


class UnsupportedAssistantAction(Exception):
    pass


@dataclass(frozen=True)
class ActionSpec:
    action_type: str
    handler: Callable[[Any, Dict[str, Any]], Dict[str, Any]]
    is_async: bool = False


def _invoke_view(user, method: str, path: str, view_fn, data: Optional[Dict[str, Any]] = None, **kwargs):
    factory = APIRequestFactory()
    method = method.lower().strip()
    if method == "post":
        request = factory.post(path, data or {}, format="json")
    elif method == "patch":
        request = factory.patch(path, data or {}, format="json")
    elif method == "delete":
        request = factory.delete(path, data or {}, format="json")
    else:
        request = factory.get(path, data or {}, format="json")

    force_authenticate(request, user=user)
    response = view_fn(request, **kwargs)
    payload = getattr(response, "data", {})
    status_code = getattr(response, "status_code", 500)
    if status_code >= 400:
        raise ValueError(payload.get("error") if isinstance(payload, dict) else f"Action failed with status {status_code}")
    return payload


def _task_complete(user, args: Dict[str, Any]) -> Dict[str, Any]:
    from tasks.task_views import TaskViewSet

    task_id = str(args.get("task_id") or "").strip()
    if not task_id:
        raise ValueError("task_id is required")

    path = f"/api/tasks/{task_id}/complete/"
    return _invoke_view(user, "patch", path, TaskViewSet.as_view({"patch": "complete"}), {}, pk=task_id)


def _task_update_status(user, args: Dict[str, Any]) -> Dict[str, Any]:
    task_id = str(args.get("task_id") or "").strip()
    next_status = str(args.get("status") or "").strip().lower()
    if not task_id or not next_status:
        raise ValueError("task_id and status are required")

    allowed = {"not_started", "in_progress", "pending_validation", "completed", "needs_revision"}
    if next_status not in allowed:
        raise ValueError("Unsupported task status")

    task = Task.objects.get(task_id=task_id, user=user)
    task.status = next_status
    task.save(update_fields=["status", "updated_at"])
    return {
        "task_id": str(task.task_id),
        "status": task.status,
        "title": task.title,
    }


def _execution_task_update(user, args: Dict[str, Any]) -> Dict[str, Any]:
    from dashboard import views as dashboard_views

    task_id = str(args.get("task_id") or args.get("id") or "").strip()
    status = str(args.get("status") or "").strip().lower()
    if not task_id or not status:
        raise ValueError("task_id and status are required")

    payload = {"id": task_id, "status": status}
    return _invoke_view(
        user,
        "patch",
        "/api/dashboard/execution/tasks/",
        dashboard_views.execution_tasks,
        payload,
    )


def _execution_task_create(user, args: Dict[str, Any]) -> Dict[str, Any]:
    from dashboard import views as dashboard_views

    title = str(args.get("title") or "").strip()
    if not title:
        raise ValueError("title is required")

    payload = {
        "title": title,
        "task_type": str(args.get("task_type") or "learning"),
        "status": str(args.get("status") or "pending"),
        "priority": str(args.get("priority") or "medium"),
        "difficulty": str(args.get("difficulty") or "medium"),
        "estimated_time": str(args.get("estimated_time") or "25 min"),
        "estimated_minutes": int(args.get("estimated_minutes") or 25),
        "reason": str(args.get("reason") or ""),
        "ai_generated": True,
        "metadata": args.get("metadata") if isinstance(args.get("metadata"), dict) else {},
    }
    return _invoke_view(
        user,
        "post",
        "/api/dashboard/execution/tasks/",
        dashboard_views.execution_tasks,
        payload,
    )


def _roadmap_update_milestone(user, args: Dict[str, Any]) -> Dict[str, Any]:
    milestone_id = args.get("milestone_id")
    completed = bool(args.get("completed", True))
    if milestone_id in (None, ""):
        raise ValueError("milestone_id is required")

    milestone = Milestone.objects.get(id=int(milestone_id), roadmap__user=user)
    milestone.is_completed = completed
    milestone.save(update_fields=["is_completed"])
    return {
        "milestone_id": milestone.id,
        "completed": milestone.is_completed,
        "title": milestone.title,
        "roadmap_id": milestone.roadmap_id,
    }


def _roadmap_generate_tasks(user, args: Dict[str, Any]) -> Dict[str, Any]:
    from roadmap_ai import views as roadmap_views

    roadmap_id = args.get("roadmap_id")
    if roadmap_id in (None, ""):
        raise ValueError("roadmap_id is required")
    payload = {"force": bool(args.get("force", False))}
    return _invoke_view(
        user,
        "post",
        f"/api/roadmap/{roadmap_id}/generate-tasks/",
        roadmap_views.generate_roadmap_tasks,
        payload,
        roadmap_id=int(roadmap_id),
    )


def _roadmap_generate(user, args: Dict[str, Any]) -> Dict[str, Any]:
    from roadmap_ai import views as roadmap_views

    payload = {
        "goal": str(args.get("goal") or ""),
        "duration": str(args.get("duration") or "6 months"),
        "current_level": str(args.get("current_level") or "beginner"),
        "category": str(args.get("category") or "career"),
        "tech_stack": str(args.get("tech_stack") or ""),
        "interests": args.get("interests") if isinstance(args.get("interests"), list) else [],
        "output_format": str(args.get("output_format") or "Milestone-based"),
        "learning_constraints": str(args.get("learning_constraints") or ""),
        "motivation_style": str(args.get("motivation_style") or "Milestones"),
        "success_definition": str(args.get("success_definition") or ""),
    }
    if not payload["goal"]:
        raise ValueError("goal is required")
    return _invoke_view(
        user,
        "post",
        "/api/roadmap/generate/",
        roadmap_views.generate_roadmap,
        payload,
    )


def _planora_topic_progress(user, args: Dict[str, Any]) -> Dict[str, Any]:
    from planora import views as planora_views

    topic_id = args.get("topic_id")
    if topic_id in (None, ""):
        raise ValueError("topic_id is required")
    payload = {
        "status": args.get("status"),
        "confidence": args.get("confidence"),
    }
    return _invoke_view(
        user,
        "patch",
        f"/api/planora/topics/{topic_id}/progress/",
        planora_views.topic_progress,
        payload,
        topic_id=int(topic_id),
    )


def _planora_generate_notes(user, args: Dict[str, Any]) -> Dict[str, Any]:
    from planora import views as planora_views

    topic_id = args.get("topic_id")
    if topic_id in (None, ""):
        raise ValueError("topic_id is required")
    return _invoke_view(
        user,
        "post",
        f"/api/planora/topics/{topic_id}/notes/",
        planora_views.topic_notes,
        {},
        topic_id=int(topic_id),
    )


def _planora_generate_study_plan(user, args: Dict[str, Any]) -> Dict[str, Any]:
    from planora import views as planora_views

    subject_id = args.get("subject_id")
    if subject_id in (None, ""):
        raise ValueError("subject_id is required")
    payload = args.get("payload") if isinstance(args.get("payload"), dict) else {}
    return _invoke_view(
        user,
        "post",
        f"/api/planora/subjects/{subject_id}/plan/",
        planora_views.study_plan,
        payload,
        subject_id=int(subject_id),
    )


def _resume_generate(user, args: Dict[str, Any]) -> Dict[str, Any]:
    from tasks.resume_views import ResumeGenerateView

    roadmap_id = args.get("roadmap_id")
    if roadmap_id in (None, ""):
        raise ValueError("roadmap_id is required")
    payload = {"roadmap_id": roadmap_id}
    if args.get("template_id"):
        payload["template_id"] = args.get("template_id")
    return _invoke_view(
        user,
        "post",
        "/api/tasks/resume/generate/",
        ResumeGenerateView.as_view(),
        payload,
    )


def _scheduler_delete_all_events(user, args: Dict[str, Any]) -> Dict[str, Any]:
    from scheduler import views as scheduler_views

    return _invoke_view(
        user,
        "delete",
        "/api/scheduler/events/delete-all/",
        scheduler_views.delete_all_events,
        {},
    )


ACTION_REGISTRY: Dict[str, ActionSpec] = {
    "task.complete": ActionSpec("task.complete", _task_complete, is_async=False),
    "task.update_status": ActionSpec("task.update_status", _task_update_status, is_async=False),
    "execution.task_update": ActionSpec("execution.task_update", _execution_task_update, is_async=False),
    "execution.task_create": ActionSpec("execution.task_create", _execution_task_create, is_async=False),
    "roadmap.milestone_update": ActionSpec("roadmap.milestone_update", _roadmap_update_milestone, is_async=False),
    "roadmap.generate_tasks": ActionSpec("roadmap.generate_tasks", _roadmap_generate_tasks, is_async=True),
    "roadmap.generate": ActionSpec("roadmap.generate", _roadmap_generate, is_async=True),
    "planora.topic_progress": ActionSpec("planora.topic_progress", _planora_topic_progress, is_async=False),
    "planora.generate_notes": ActionSpec("planora.generate_notes", _planora_generate_notes, is_async=True),
    "planora.generate_study_plan": ActionSpec("planora.generate_study_plan", _planora_generate_study_plan, is_async=True),
    "resume.generate": ActionSpec("resume.generate", _resume_generate, is_async=True),
    "scheduler.delete_all_events": ActionSpec("scheduler.delete_all_events", _scheduler_delete_all_events, is_async=False),
}


def get_action_spec(action_type: str) -> ActionSpec:
    action_type = str(action_type or "").strip()
    spec = ACTION_REGISTRY.get(action_type)
    if spec is None:
        raise UnsupportedAssistantAction(
            f"Action '{action_type}' is currently not supported. Please use a supported learning-domain action."
        )
    return spec


def execute_action(user, action_type: str, args: Dict[str, Any]) -> Dict[str, Any]:
    spec = get_action_spec(action_type)
    return spec.handler(user, args or {})


def action_is_async(action_type: str) -> bool:
    return get_action_spec(action_type).is_async

