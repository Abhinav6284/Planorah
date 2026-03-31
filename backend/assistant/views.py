import json
import logging
import os

import requests
from django.conf import settings
from dotenv import load_dotenv
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from roadmap_ai.models import Roadmap
from tasks.models import Task

from .serializers import (
    AssistantV2ConfirmSerializer,
    AssistantV2JobSerializer,
    AssistantV2TurnSerializer,
)
from .services.orchestrator import (
    confirm_action,
    get_job_payload,
    get_pipeline_config,
    run_turn,
)
from .services.pipeline_config import AI_PIPELINE_ENABLED

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", None)
logger = logging.getLogger(__name__)


def build_user_context(user):
    """Build a context string with user's roadmaps and tasks."""
    context_parts = []

    roadmaps = Roadmap.objects.filter(user=user).prefetch_related("milestones")
    if roadmaps.exists():
        context_parts.append("## User's Learning Roadmaps:\n")
        for roadmap in roadmaps[:5]:
            context_parts.append(f"\n### {roadmap.title}")
            context_parts.append(f"- Goal: {roadmap.goal}")
            context_parts.append(f"- Duration: {roadmap.estimated_duration}")
            context_parts.append(f"- Level: {roadmap.difficulty_level}")
            context_parts.append(f"- Category: {roadmap.category}")
            milestones = roadmap.milestones.all().order_by("order")[:10]
            if milestones:
                context_parts.append("- Milestones:")
                for milestone in milestones:
                    status_icon = "✅" if milestone.is_completed else "⏳"
                    context_parts.append(f"  {status_icon} {milestone.title} ({milestone.duration})")
                    if milestone.resources:
                        for resource in milestone.resources[:3]:
                            if isinstance(resource, dict):
                                context_parts.append(
                                    f"    - Resource: {resource.get('title', 'N/A')} - {resource.get('url', '')}"
                                )

    tasks = Task.objects.filter(user=user).order_by("day", "-status")
    pending_tasks = tasks.filter(status__in=["not_started", "in_progress"])[:15]
    completed_tasks = tasks.filter(status="completed")[:5]

    if pending_tasks.exists():
        context_parts.append("\n## Pending Tasks:\n")
        for task in pending_tasks:
            status_map = {
                "not_started": "⬜",
                "in_progress": "🔄",
                "needs_revision": "⚠️",
            }
            icon = status_map.get(task.status, "⬜")
            context_parts.append(
                f"{icon} Day {task.day}: {task.title} ({task.estimated_minutes} min) - "
                f"Roadmap: {task.roadmap.title if task.roadmap else 'General'}"
            )

    if completed_tasks.exists():
        context_parts.append("\n## Recently Completed:\n")
        for task in completed_tasks:
            context_parts.append(f"✅ {task.title}")

    total_tasks = tasks.count()
    completed_count = tasks.filter(status="completed").count()
    if total_tasks > 0:
        progress = (completed_count / total_tasks) * 100
        context_parts.append(f"\n## Progress: {completed_count}/{total_tasks} tasks completed ({progress:.1f}%)")

    return "\n".join(context_parts)


SYSTEM_PROMPT = """You are Planorah Assistant, a helpful AI companion for students using the Planorah learning platform.

Your ONLY purpose is to help users with:
1. Understanding their learning roadmaps and progress
2. Answering questions about their tasks and schedule
3. Providing guidance on what to study next
4. Explaining how features work within the platform
5. Motivating and encouraging their learning journey

FORMATTING RULES (VERY IMPORTANT):
- ALWAYS use bullet points (- or •) when listing items, tasks, or options
- Use **bold** for important terms, task names, and roadmap titles
- Use headers (##, ###) to organize longer responses
- Keep responses well-structured and scannable
- Use emojis strategically to make responses more engaging (📚 for learning, ✅ for completed, ⏳ for pending, etc.)
- Break down complex information into clear, digestible points
- For progress summaries, use a format like: "✅ Completed: X | ⏳ Pending: Y"

CONTENT RULES:
- ONLY answer questions related to the user's tasks, roadmaps, learning progress, and the Planorah platform
- If asked about unrelated topics (coding help, general knowledge, etc.), politely redirect them to ask about their learning journey
- Be encouraging and supportive
- Keep responses concise and actionable
- When referencing tasks or milestones, use the specific names from their data
- If they ask about resources, refer to the resources in their roadmap milestones
"""


class GeminiAPIError(Exception):
    pass


def call_gemini_api(prompt, max_retries=3):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "topP": 0.9, "maxOutputTokens": 1024},
    }

    last_error = None
    for _ in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            if response.status_code == 429:
                raise GeminiAPIError("I'm receiving too many requests right now. Please wait a minute and try again.")
            if response.status_code in {400, 403}:
                raise GeminiAPIError("The AI service is unavailable. Please try again later.")
            if not response.ok:
                raise GeminiAPIError(f"AI service returned an error (code {response.status_code}). Please try again.")

            data = response.json()
            candidates = data.get("candidates") or []
            if candidates:
                parts = candidates[0].get("content", {}).get("parts") or []
                if parts and parts[0].get("text"):
                    return parts[0]["text"]
            return "I'm sorry, I couldn't generate a response. Please try again."
        except (requests.exceptions.SSLError, requests.exceptions.ConnectionError) as exc:
            last_error = exc
            continue

    raise requests.exceptions.RequestException(f"Failed after {max_retries} attempts: {last_error}")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat(request):
    """Legacy assistant endpoint retained for fallback compatibility."""
    if not GEMINI_API_KEY:
        return Response({"error": "AI service is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    user = request.user
    message = (request.data.get("message") or "").strip()
    if not message:
        return Response({"error": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_context = build_user_context(user)
        full_prompt = f"""{SYSTEM_PROMPT}

---
USER LEARNING CONTEXT:
{user_context}
---

User Question: {message}

Assistant Response:"""

        assistant_response = call_gemini_api(full_prompt)
        return Response({"message": assistant_response.strip(), "success": True})
    except GeminiAPIError as exc:
        logger.warning("Gemini API warning: %s", exc)
        return Response(
            {
                "message": "I'm getting too many requests right now. Please wait a minute and try again.",
                "error": str(exc),
                "success": False,
                "rate_limited": True,
            },
            status=status.HTTP_200_OK,
        )
    except requests.exceptions.RequestException as exc:
        logger.error("Gemini API request error: %s", exc)
        return Response(
            {"error": "Sorry, I couldn't connect to the AI service. Please try again.", "details": str(exc)},
            status=status.HTTP_502_BAD_GATEWAY,
        )
    except Exception as exc:
        logger.exception("Assistant error: %s", exc)
        return Response(
            {"error": "Sorry, I encountered an error. Please try again.", "details": str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def assistant_v2_config(request):
    payload = get_pipeline_config()
    payload["feature_flags"]["enabled"] = bool(AI_PIPELINE_ENABLED)
    return Response(payload, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def assistant_v2_turn(request):
    if not AI_PIPELINE_ENABLED:
        return Response(
            {
                "status": "error",
                "assistant_text": "Assistant pipeline is disabled right now.",
                "fallback": {"legacy_endpoint": "/api/assistant/chat/"},
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    incoming = request.data.copy()
    if "channel" not in incoming:
        incoming["channel"] = "voice" if request.FILES.get("audio") else "text"

    frontend_context = incoming.get("frontend_context")
    if isinstance(frontend_context, str):
        try:
            incoming["frontend_context"] = json.loads(frontend_context)
        except json.JSONDecodeError:
            incoming["frontend_context"] = {}

    serializer = AssistantV2TurnSerializer(data=incoming)
    serializer.is_valid(raise_exception=True)
    validated = serializer.validated_data

    audio_file = request.FILES.get("audio")
    audio_bytes = b""
    audio_mime_type = ""
    if validated["channel"] == "voice":
        if not audio_file:
            return Response({"error": "audio is required for voice channel"}, status=status.HTTP_400_BAD_REQUEST)
        audio_bytes = audio_file.read()
        audio_mime_type = getattr(audio_file, "content_type", "") or "audio/webm"

    try:
        result = run_turn(
            user=request.user,
            channel=validated["channel"],
            context_source=validated.get("context_source", "assistant"),
            frontend_context=validated.get("frontend_context") or {},
            conversation_id=str(validated.get("conversation_id")) if validated.get("conversation_id") else None,
            message=validated.get("message", ""),
            audio_bytes=audio_bytes,
            audio_mime_type=audio_mime_type,
            language_preference=validated.get("language_preference", ""),
            voice_name=validated.get("voice_name", ""),
        )
        return Response(result, status=status.HTTP_200_OK)
    except ValueError as exc:
        return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        logger.exception("assistant_v2_turn failed: %s", exc)
        return Response(
            {
                "status": "error",
                "assistant_text": "Turn processing failed. Please retry.",
                "error": str(exc),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def assistant_v2_action_confirm(request):
    serializer = AssistantV2ConfirmSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    validated = serializer.validated_data

    try:
        result = confirm_action(
            user=request.user,
            conversation_id=str(validated["conversation_id"]),
            proposal_id=str(validated["proposal_id"]),
            confirmed=bool(validated["confirmed"]),
            idempotency_key=validated.get("idempotency_key", ""),
        )
        return Response(result, status=status.HTTP_200_OK)
    except ValueError as exc:
        return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        logger.exception("assistant_v2_action_confirm failed: %s", exc)
        return Response({"error": "Failed to confirm action", "details": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def assistant_v2_job_status(request, job_id):
    serializer = AssistantV2JobSerializer(data={"job_id": job_id})
    serializer.is_valid(raise_exception=True)
    validated = serializer.validated_data

    try:
        payload = get_job_payload(user=request.user, job_id=str(validated["job_id"]))
        return Response(payload, status=status.HTTP_200_OK)
    except ValueError as exc:
        return Response({"error": str(exc)}, status=status.HTTP_404_NOT_FOUND)
    except Exception as exc:
        logger.exception("assistant_v2_job_status failed: %s", exc)
        return Response({"error": "Unable to fetch job status", "details": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

