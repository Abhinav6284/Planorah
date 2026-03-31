from __future__ import annotations

from typing import Any, Dict, List, Optional

from django.db import transaction
from django.utils import timezone

from assistant.models import (
    AssistantActionExecution,
    AssistantActionProposal,
    AssistantConversation,
    AssistantJob,
    AssistantTurn,
)

from .action_registry import (
    ACTION_REGISTRY,
    UnsupportedAssistantAction,
    action_is_async,
    execute_action,
)
from .context_aggregator import build_backend_context
from .gemini_pipeline import (
    generate_assistant_json,
    synthesize_speech,
    transcribe_audio,
)
from .pipeline_config import (
    AI_PIPELINE_ENABLED,
    AI_PIPELINE_ACTIONS_ENABLED,
    AI_PIPELINE_CHANNELS,
    AI_PIPELINE_DEFAULT_LANGUAGE,
    AI_PIPELINE_FALLBACK_REALTIME_ENABLED,
    AI_PIPELINE_MAX_AUDIO_MB,
    AI_PIPELINE_MAX_SESSION_TURNS,
    AI_PIPELINE_TTS_TIMEOUT_SEC,
    ASSISTANT_V2_AVAILABLE_VOICES,
)


def _conversation_turn_history(conversation: AssistantConversation) -> List[Dict[str, Any]]:
    turns = conversation.turns.order_by("-created_at")[:AI_PIPELINE_MAX_SESSION_TURNS]
    return [
        {
            "user_input": item.user_input_text or item.transcript,
            "assistant_text": item.assistant_text,
            "status": item.status,
            "created_at": item.created_at.isoformat(),
        }
        for item in reversed(list(turns))
    ]


def _normalize_channel(channel: str) -> str:
    raw = str(channel or "").strip().lower()
    if raw not in {"text", "voice"}:
        return "text"
    return raw


def _ensure_supported_channel(channel: str) -> None:
    if channel not in AI_PIPELINE_CHANNELS:
        raise ValueError(f"Channel '{channel}' is disabled by AI_PIPELINE_CHANNELS")


def _serialize_proposal(proposal: AssistantActionProposal) -> Dict[str, Any]:
    return {
        "proposal_id": str(proposal.id),
        "action_type": proposal.action_type,
        "summary": proposal.summary,
        "args_preview": proposal.args_preview or {},
        "is_async": proposal.is_async,
        "requires_confirmation": proposal.requires_confirmation,
        "status": proposal.status,
    }


def _normalize_action_proposals(raw: Any) -> List[Dict[str, Any]]:
    if not isinstance(raw, list):
        return []
    proposals = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        action_type = str(item.get("action_type") or "").strip()
        summary = str(item.get("summary") or "").strip()
        args = item.get("args") if isinstance(item.get("args"), dict) else {}
        args_preview = item.get("args_preview") if isinstance(item.get("args_preview"), dict) else {}
        if not action_type or not summary:
            continue
        if action_type not in ACTION_REGISTRY:
            continue
        proposals.append(
            {
                "action_type": action_type,
                "summary": summary,
                "args": args,
                "args_preview": args_preview,
                "is_async": bool(item.get("is_async", False)),
                "requires_confirmation": True,
            }
        )
    return proposals[:5]


def _get_or_create_conversation(
    user,
    channel: str,
    context_source: str,
    conversation_id: Optional[str],
    language_preference: str,
) -> AssistantConversation:
    if conversation_id:
        try:
            conversation = AssistantConversation.objects.get(id=conversation_id, user=user)
            if not conversation.is_active:
                conversation.is_active = True
            conversation.channel = channel
            conversation.context_source = context_source or conversation.context_source
            conversation.language_preference = language_preference or conversation.language_preference
            conversation.updated_at = timezone.now()
            conversation.save(update_fields=["is_active", "channel", "context_source", "language_preference", "updated_at"])
            return conversation
        except AssistantConversation.DoesNotExist:
            pass

    return AssistantConversation.objects.create(
        user=user,
        channel=channel,
        context_source=context_source or "assistant",
        language_preference=language_preference or AI_PIPELINE_DEFAULT_LANGUAGE,
    )


def run_turn(
    *,
    user,
    channel: str,
    context_source: str,
    frontend_context: Optional[Dict[str, Any]],
    conversation_id: Optional[str] = None,
    message: str = "",
    audio_bytes: bytes = b"",
    audio_mime_type: str = "",
    language_preference: str = "",
    voice_name: str = "",
) -> Dict[str, Any]:
    normalized_channel = _normalize_channel(channel)
    _ensure_supported_channel(normalized_channel)

    preferred_language = (language_preference or AI_PIPELINE_DEFAULT_LANGUAGE or "hinglish").strip()
    conversation = _get_or_create_conversation(
        user=user,
        channel=normalized_channel,
        context_source=context_source,
        conversation_id=conversation_id,
        language_preference=preferred_language,
    )

    if normalized_channel == "voice":
        max_bytes = max(1, AI_PIPELINE_MAX_AUDIO_MB) * 1024 * 1024
        if not audio_bytes:
            raise ValueError("audio is required for voice channel")
        if len(audio_bytes) > max_bytes:
            raise ValueError(f"Audio payload exceeds {AI_PIPELINE_MAX_AUDIO_MB}MB")

    transcript = message.strip()
    if normalized_channel == "voice":
        transcript = transcribe_audio(
            audio_bytes=audio_bytes,
            mime_type=audio_mime_type or "audio/webm",
            language_hint=preferred_language,
        ).strip()
        if not transcript:
            transcript = message.strip()

    if not transcript:
        raise ValueError("No user input provided")

    backend_context = build_backend_context(
        user=user,
        context_source=context_source or "assistant",
        frontend_context=frontend_context or {},
    )
    session_turns = _conversation_turn_history(conversation)

    llm_output = generate_assistant_json(
        user_message=transcript,
        context_payload=backend_context,
        channel=normalized_channel,
        language_preference=preferred_language,
        session_turns=session_turns,
    )

    assistant_text = str(llm_output.get("assistant_text") or "").strip()
    language = str(llm_output.get("language") or preferred_language).strip() or preferred_language
    status = str(llm_output.get("status") or "ok").strip().lower()
    if status not in {AssistantTurn.STATUS_OK, AssistantTurn.STATUS_NEEDS_CONFIRMATION, AssistantTurn.STATUS_CLARIFICATION, AssistantTurn.STATUS_ERROR}:
        status = AssistantTurn.STATUS_OK

    normalized_proposals = _normalize_action_proposals(llm_output.get("action_proposals"))
    if normalized_proposals:
        status = AssistantTurn.STATUS_NEEDS_CONFIRMATION
    elif isinstance(llm_output.get("action_proposals"), list) and llm_output.get("action_proposals"):
        status = AssistantTurn.STATUS_CLARIFICATION
        supported = ", ".join(sorted(ACTION_REGISTRY.keys()))
        assistant_text = (
            assistant_text
            or "Requested action abhi supported nahi hai. Main guidance de sakta hoon."
        )
        llm_output["ui_blocks"] = (llm_output.get("ui_blocks") if isinstance(llm_output.get("ui_blocks"), list) else []) + [
            {
                "type": "warning",
                "title": "Unsupported Action",
                "items": [f"Supported actions: {supported}"],
            }
        ]

    with transaction.atomic():
        turn = AssistantTurn.objects.create(
            conversation=conversation,
            channel=normalized_channel,
            user_input_text=message.strip(),
            transcript=transcript,
            frontend_context=frontend_context or {},
            backend_context=backend_context,
            llm_output=llm_output,
            assistant_text=assistant_text,
            language=language,
            status=status,
        )

        saved_proposals: List[AssistantActionProposal] = []
        for item in normalized_proposals:
            saved_proposals.append(
                AssistantActionProposal.objects.create(
                    conversation=conversation,
                    turn=turn,
                    action_type=item["action_type"],
                    summary=item["summary"],
                    args=item["args"],
                    args_preview=item["args_preview"],
                    is_async=item["is_async"] or action_is_async(item["action_type"]),
                    requires_confirmation=True,
                )
            )

    tts_payload: Dict[str, Any] | None = None
    if normalized_channel == "voice" and assistant_text:
        try:
            tts_payload = synthesize_speech(
                text=assistant_text,
                voice=voice_name,
                language=language,
            )
            if tts_payload:
                turn.tts_mime_type = str(tts_payload.get("mime_type") or "")
                turn.tts_voice = str(tts_payload.get("voice") or "")
                turn.tts_duration_ms = int(tts_payload.get("duration_ms") or 0)
                turn.save(update_fields=["tts_mime_type", "tts_voice", "tts_duration_ms"])
        except Exception:
            tts_payload = None

    response_payload = {
        "conversation_id": str(conversation.id),
        "turn_id": str(turn.id),
        "status": turn.status,
        "transcript": turn.transcript or turn.user_input_text,
        "assistant_text": turn.assistant_text,
        "language": turn.language,
        "ui_blocks": llm_output.get("ui_blocks", []) if isinstance(llm_output.get("ui_blocks"), list) else [],
        "action_proposals": [_serialize_proposal(item) for item in saved_proposals],
    }
    if normalized_channel == "voice":
        response_payload["tts"] = tts_payload or None
    return response_payload


def _execution_payload(execution: AssistantActionExecution, proposal: AssistantActionProposal) -> Dict[str, Any]:
    return {
        "execution_id": str(execution.id),
        "proposal_id": str(proposal.id),
        "action_type": proposal.action_type,
        "execution_status": execution.status,
        "result": execution.result or {},
        "error": execution.error or "",
    }


def execute_action_execution(execution_id: str) -> Dict[str, Any]:
    execution = AssistantActionExecution.objects.select_related("proposal", "conversation", "user").get(id=execution_id)
    proposal = execution.proposal

    if execution.status in {AssistantActionExecution.STATUS_SUCCEEDED, AssistantActionExecution.STATUS_FAILED, AssistantActionExecution.STATUS_CANCELLED}:
        return _execution_payload(execution, proposal)

    execution.status = AssistantActionExecution.STATUS_RUNNING
    execution.save(update_fields=["status", "updated_at"])

    proposal.status = AssistantActionProposal.STATUS_CONFIRMED
    proposal.confirmed_at = proposal.confirmed_at or timezone.now()
    proposal.save(update_fields=["status", "confirmed_at"])

    try:
        result = execute_action(
            user=execution.user,
            action_type=proposal.action_type,
            args=proposal.args,
        )
        execution.status = AssistantActionExecution.STATUS_SUCCEEDED
        execution.result = result if isinstance(result, dict) else {"result": result}
        execution.error = ""
        proposal.status = AssistantActionProposal.STATUS_EXECUTED
        proposal.executed_at = timezone.now()
        proposal.save(update_fields=["status", "executed_at"])
    except UnsupportedAssistantAction as exc:
        execution.status = AssistantActionExecution.STATUS_FAILED
        execution.error = str(exc)
        execution.result = {
            "supported_actions": sorted(list(ACTION_REGISTRY.keys())),
            "message": "Action unsupported in current allowlist.",
        }
        proposal.status = AssistantActionProposal.STATUS_FAILED
        proposal.save(update_fields=["status"])
    except Exception as exc:
        execution.status = AssistantActionExecution.STATUS_FAILED
        execution.error = str(exc)
        execution.result = {}
        proposal.status = AssistantActionProposal.STATUS_FAILED
        proposal.save(update_fields=["status"])

    execution.save(update_fields=["status", "result", "error", "updated_at"])
    return _execution_payload(execution, proposal)


def confirm_action(
    *,
    user,
    conversation_id: str,
    proposal_id: str,
    confirmed: bool,
    idempotency_key: str = "",
) -> Dict[str, Any]:
    try:
        proposal = AssistantActionProposal.objects.select_related("conversation").get(
            id=proposal_id,
            conversation_id=conversation_id,
            conversation__user=user,
        )
    except AssistantActionProposal.DoesNotExist:
        raise ValueError("Action proposal not found")

    if not confirmed:
        proposal.status = AssistantActionProposal.STATUS_CANCELLED
        proposal.save(update_fields=["status"])
        return {
            "execution_status": AssistantActionExecution.STATUS_CANCELLED,
            "job_id": None,
            "result": {},
            "assistant_text": "Theek hai, action cancel kar diya.",
        }

    existing_execution = (
        AssistantActionExecution.objects.filter(user=user, proposal=proposal)
        .order_by("-created_at")
        .first()
    )
    if existing_execution:
        job = (
            AssistantJob.objects.filter(execution=existing_execution, user=user)
            .order_by("-created_at")
            .first()
        )
        return {
            "execution_status": existing_execution.status,
            "job_id": str(job.id) if job else None,
            "result": existing_execution.result or {},
            "assistant_text": "Yeh action pehle hi process ho chuka hai, latest status return kar diya.",
        }

    if not AI_PIPELINE_ACTIONS_ENABLED:
        return {
            "execution_status": AssistantActionExecution.STATUS_FAILED,
            "job_id": None,
            "result": {},
            "assistant_text": "Actions abhi temporarily disabled hain. Aap guidance continue kar sakte ho.",
        }

    if idempotency_key:
        existing = AssistantActionExecution.objects.filter(
            user=user,
            idempotency_key=idempotency_key,
            proposal=proposal,
        ).select_related("proposal").first()
        if existing:
            job = (
                AssistantJob.objects.filter(execution=existing, user=user)
                .order_by("-created_at")
                .first()
            )
            payload = _execution_payload(existing, existing.proposal)
            return {
                "execution_status": payload["execution_status"],
                "job_id": str(job.id) if job else None,
                "result": payload["result"],
                "assistant_text": "Duplicate request detect hui, previous action result return kiya gaya.",
            }

    execution = AssistantActionExecution.objects.create(
        user=user,
        conversation=proposal.conversation,
        proposal=proposal,
        idempotency_key=idempotency_key or "",
        status=AssistantActionExecution.STATUS_PENDING,
    )

    is_async = proposal.is_async or action_is_async(proposal.action_type)
    if is_async:
        from assistant.tasks import run_assistant_action_job

        job = AssistantJob.objects.create(
            user=user,
            proposal=proposal,
            execution=execution,
            action_type=proposal.action_type,
            status=AssistantJob.STATUS_QUEUED,
        )
        celery_result = run_assistant_action_job.delay(str(execution.id), str(job.id))
        job.celery_task_id = celery_result.id
        job.save(update_fields=["celery_task_id", "updated_at"])

        return {
            "execution_status": AssistantActionExecution.STATUS_PENDING,
            "job_id": str(job.id),
            "result": {},
            "assistant_text": "Action queue me daal diya hai. Main status update karta rahunga.",
        }

    payload = execute_action_execution(str(execution.id))
    return {
        "execution_status": payload.get("execution_status"),
        "job_id": None,
        "result": payload.get("result", {}),
        "assistant_text": "Done. Action execute ho gaya.",
    }


def get_job_payload(*, user, job_id: str) -> Dict[str, Any]:
    try:
        job = AssistantJob.objects.get(id=job_id, user=user)
    except AssistantJob.DoesNotExist:
        raise ValueError("Job not found")

    return {
        "job_id": str(job.id),
        "action_type": job.action_type,
        "status": job.status,
        "result": job.result or {},
        "error": job.error or "",
        "created_at": job.created_at.isoformat(),
        "updated_at": job.updated_at.isoformat(),
        "completed_at": job.completed_at.isoformat() if job.completed_at else None,
    }


def get_pipeline_config() -> Dict[str, Any]:
    return {
        "feature_flags": {
            "enabled": AI_PIPELINE_ENABLED,
            "actions_enabled": AI_PIPELINE_ACTIONS_ENABLED,
            "fallback_realtime_enabled": AI_PIPELINE_FALLBACK_REALTIME_ENABLED,
            "channels": sorted(list(AI_PIPELINE_CHANNELS)),
        },
        "preferred_language": AI_PIPELINE_DEFAULT_LANGUAGE,
        "limits": {
            "max_audio_mb": AI_PIPELINE_MAX_AUDIO_MB,
            "max_session_turns": AI_PIPELINE_MAX_SESSION_TURNS,
            "tts_timeout_sec": AI_PIPELINE_TTS_TIMEOUT_SEC,
        },
        "available_voices": ASSISTANT_V2_AVAILABLE_VOICES,
    }
