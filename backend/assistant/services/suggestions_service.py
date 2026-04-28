# backend/assistant/services/suggestions_service.py
import json
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Every route in the app — assistant uses this to guide users to the right place
APP_NAVIGATION = {
    "dashboard": {"path": "/dashboard", "label": "Dashboard", "description": "Daily command center — tasks, stats, streaks"},
    "roadmap": {"path": "/roadmap", "label": "Roadmap", "description": "Learning roadmap and milestone progress"},
    "tasks": {"path": "/tasks", "label": "Tasks", "description": "Study tasks broken down by day"},
    "scheduler": {"path": "/scheduler", "label": "Scheduler", "description": "Weekly calendar and time blocks"},
    "resume": {"path": "/resume", "label": "Resume", "description": "Resume builder"},
    "ats": {"path": "/ats", "label": "ATS Scanner", "description": "Check resume against job descriptions"},
    "interview": {"path": "/interview", "label": "Interview Prep", "description": "Mock interview practice and feedback"},
    "portfolio": {"path": "/portfolio", "label": "Portfolio", "description": "Project portfolio"},
    "projects": {"path": "/projects", "label": "Projects", "description": "Project tracker"},
    "lab": {"path": "/lab", "label": "Lab", "description": "Code playground, research hub, and tools"},
    "planora": {"path": "/planora", "label": "Planora", "description": "Subject and topic study notes"},
    "assistant": {"path": "/assistant", "label": "Assistant", "description": "Full-screen AI assistant"},
}

SUGGESTIONS_SYSTEM_PROMPT = """You are Planorah's personal assistant. Your job is to give the user 1-2 SHORT, specific, actionable suggestions based on their current page and their real data.

Rules:
- Be direct. No fluff, no filler.
- Use real numbers from their data (e.g. "You have 5 pending tasks" not "You have some tasks").
- Each suggestion must include a clear action the user can take RIGHT NOW.
- When relevant, reference a specific page path from APP_NAVIGATION to guide the user.
- Keep each suggestion under 15 words.
- Never repeat the same suggestion twice.
- Format: return ONLY a JSON array of objects like:
  [{"text": "short suggestion", "action_label": "short CTA", "action_type": "navigate|open_panel|none", "action_target": "/path or null"}]
"""


def generate_suggestions(context_source: str, backend_context: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate 1-2 proactive suggestions for the given page using user context.
    Returns list of: [{text, action_label, action_type, action_target}]
    Falls back to static suggestions if Gemini fails.
    """
    if context_source not in APP_NAVIGATION:
        context_source = "general"

    profile = backend_context.get("profile", {})
    tasks = backend_context.get("tasks", {})
    roadmaps = backend_context.get("roadmaps", {})
    execution = backend_context.get("execution", {})

    task_summary = tasks.get("summary", {})
    pending = task_summary.get("pending", 0)
    in_progress = task_summary.get("in_progress", 0)
    completed = task_summary.get("completed", 0)
    total = task_summary.get("total", 0)

    roadmap_count = roadmaps.get("count", 0)
    roadmap_items = roadmaps.get("items", [])
    streak = execution.get("current_streak", 0)
    xp = execution.get("xp_points", 0)

    nav_json = "\n".join([f"  {k}: {v['path']} — {v['description']}" for k, v in APP_NAVIGATION.items()])

    prompt = f"""{SUGGESTIONS_SYSTEM_PROMPT}

APP NAVIGATION (use these paths when guiding the user):
{nav_json}

USER DATA:
- Name: {profile.get('name', 'Student')}
- Goal: {profile.get('goal_statement', 'Not set')}
- Target role: {profile.get('target_role', 'Not set')}
- Current page: {context_source}
- Tasks: {pending} pending, {in_progress} in progress, {completed} completed out of {total} total
- Roadmaps: {roadmap_count} active
- Streak: {streak} days
- XP: {xp}
- Roadmap details: {roadmap_items[:2]}

Generate 1-2 suggestions for the "{context_source}" page. Return ONLY the JSON array, no markdown, no explanation."""

    try:
        # Use the internal Gemini helper — import at function level to avoid circular imports
        from .gemini_pipeline import _post_generate_content, _extract_text, GEMINI_LLM_MODEL
        from .pipeline_config import AI_PIPELINE_LLM_TIMEOUT_SEC

        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.4, "maxOutputTokens": 256},
        }
        raw_payload = _post_generate_content(GEMINI_LLM_MODEL, payload, AI_PIPELINE_LLM_TIMEOUT_SEC)
        raw = _extract_text(raw_payload).strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            parts = raw.split("```")
            raw = parts[1] if len(parts) > 1 else raw
            if raw.startswith("json"):
                raw = raw[4:]

        suggestions = json.loads(raw.strip())
        if isinstance(suggestions, list):
            return suggestions[:2]
    except Exception as exc:
        logger.warning("suggestions_service Gemini call failed: %s", exc)

    return _fallback_suggestions(context_source, pending, roadmap_count)


def _fallback_suggestions(context_source: str, pending_tasks: int, roadmap_count: int) -> List[Dict[str, Any]]:
    """Static fallback suggestions when Gemini is unavailable."""
    fallbacks = {
        "dashboard": [
            {"text": f"You have {pending_tasks} pending tasks today", "action_label": "View tasks", "action_type": "navigate", "action_target": "/tasks"},
        ],
        "roadmap": [
            {"text": f"You have {roadmap_count} active roadmap(s) — keep going", "action_label": "View progress", "action_type": "navigate", "action_target": "/roadmap"},
        ],
        "tasks": [
            {"text": f"{pending_tasks} tasks are waiting for you", "action_label": "Start one", "action_type": "open_panel", "action_target": None},
        ],
        "resume": [
            {"text": "Check your resume against a job description", "action_label": "Run ATS scan", "action_type": "navigate", "action_target": "/ats"},
        ],
        "interview": [
            {"text": "Practice a mock interview session", "action_label": "Start now", "action_type": "open_panel", "action_target": None},
        ],
        "scheduler": [
            {"text": "Plan your week with time blocks", "action_label": "Open scheduler", "action_type": "navigate", "action_target": "/scheduler"},
        ],
    }
    return fallbacks.get(context_source, [
        {"text": "Ask me anything about your progress", "action_label": "Open chat", "action_type": "open_panel", "action_target": None},
    ])
