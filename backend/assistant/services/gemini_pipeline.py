import json
import os
from typing import Any, Dict, List
import base64

import requests
from django.conf import settings

from .action_registry import ACTION_REGISTRY
from .pipeline_config import (
    AI_PIPELINE_LLM_TIMEOUT_SEC,
    AI_PIPELINE_STT_TIMEOUT_SEC,
    AI_PIPELINE_TTS_TIMEOUT_SEC,
    GEMINI_DEFAULT_VOICE,
    GEMINI_LLM_MODEL,
    GEMINI_STT_MODEL,
    GEMINI_TTS_MODEL,
)


def _get_api_key() -> str:
    return str(os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "")).strip()


def _extract_text(payload: Dict[str, Any]) -> str:
    candidates = payload.get("candidates") or []
    if not candidates:
        return ""
    parts = candidates[0].get("content", {}).get("parts") or []
    text_chunks = [part.get("text", "") for part in parts if isinstance(part, dict) and part.get("text")]
    return "\n".join(text_chunks).strip()


def _extract_audio_inline(payload: Dict[str, Any]) -> Dict[str, Any]:
    candidates = payload.get("candidates") or []
    if not candidates:
        return {}
    parts = candidates[0].get("content", {}).get("parts") or []
    for part in parts:
        inline = part.get("inlineData") if isinstance(part, dict) else None
        if isinstance(inline, dict) and inline.get("data"):
            return {
                "audio_base64": inline.get("data"),
                "mime_type": inline.get("mimeType", "audio/wav"),
            }
    return {}


def _post_generate_content(model: str, payload: Dict[str, Any], timeout: int) -> Dict[str, Any]:
    api_key = _get_api_key()
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    response = requests.post(url, json=payload, timeout=timeout)
    response.raise_for_status()
    return response.json()


def transcribe_audio(audio_bytes: bytes, mime_type: str, language_hint: str = "hinglish") -> str:
    if not audio_bytes:
        return ""
    b64_data = base64.b64encode(audio_bytes).decode("ascii")
    prompt = (
        "Transcribe this speech to plain text.\n"
        "Keep Hinglish words as spoken.\n"
        "Return only transcript text, no markdown or labels."
    )
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": f"{prompt}\nLanguage hint: {language_hint}"},
                    {"inlineData": {"mimeType": mime_type or "audio/webm", "data": b64_data}},
                ],
            }
        ],
        "generationConfig": {
            "temperature": 0.0,
            "maxOutputTokens": 400,
        },
    }
    response_payload = _post_generate_content(GEMINI_STT_MODEL, payload, AI_PIPELINE_STT_TIMEOUT_SEC)
    return _extract_text(response_payload)


def _safe_json(text: str) -> Dict[str, Any]:
    raw = (text or "").strip()
    if not raw:
        return {}
    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1 or end < start:
        return {}
    try:
        return json.loads(raw[start:end + 1])
    except json.JSONDecodeError:
        return {}


def _supported_actions_text() -> str:
    return ", ".join(sorted(ACTION_REGISTRY.keys()))


def generate_assistant_json(
    user_message: str,
    context_payload: Dict[str, Any],
    channel: str = "text",
    language_preference: str = "hinglish",
    session_turns: List[Dict[str, Any]] | None = None,
) -> Dict[str, Any]:
    turns = session_turns or []
    prompt = (
        "You are Planorah Assistant v2.\n"
        "Respond in concise Hinglish by default unless user clearly asks otherwise.\n"
        "You must return ONLY valid JSON with schema:\n"
        "{"
        "\"schema\":\"assistant_response_v1\","
        "\"status\":\"ok|needs_confirmation|clarification|error\","
        "\"assistant_text\":\"string\","
        "\"language\":\"string\","
        "\"ui_blocks\":[{\"type\":\"info|steps|warning\",\"title\":\"string\",\"items\":[\"...\"]}],"
        "\"action_proposals\":[{\"action_type\":\"string\",\"summary\":\"string\",\"args\":{},\"args_preview\":{},\"is_async\":true|false,\"requires_confirmation\":true}]"
        "}\n"
        f"Only propose actions from: {_supported_actions_text()}.\n"
        "If action unsupported or ambiguous, do not hallucinate; set status='clarification' with guidance.\n"
        "All write actions must keep requires_confirmation=true.\n"
        f"Channel: {channel}\n"
        f"Language preference: {language_preference}\n"
        f"Session turns (same session only): {json.dumps(turns[-6:], default=str)}\n"
        f"User context JSON: {json.dumps(context_payload, default=str)}\n"
        f"User message: {user_message}"
    )
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0.25,
            "topP": 0.9,
            "maxOutputTokens": 1200,
        },
    }
    response_payload = _post_generate_content(GEMINI_LLM_MODEL, payload, AI_PIPELINE_LLM_TIMEOUT_SEC)
    parsed = _safe_json(_extract_text(response_payload))
    if not parsed:
        return {
            "schema": "assistant_response_v1",
            "status": "error",
            "assistant_text": "Mujhe response parse karne me issue aaya. Please try again.",
            "language": language_preference or "hinglish",
            "ui_blocks": [],
            "action_proposals": [],
        }
    parsed.setdefault("schema", "assistant_response_v1")
    parsed.setdefault("status", "ok")
    parsed.setdefault("assistant_text", "")
    parsed.setdefault("language", language_preference or "hinglish")
    parsed.setdefault("ui_blocks", [])
    parsed.setdefault("action_proposals", [])
    return parsed


def synthesize_speech(text: str, voice: str = "", language: str = "hinglish") -> Dict[str, Any]:
    if not text.strip():
        return {}
    selected_voice = (voice or GEMINI_DEFAULT_VOICE or "Kore").strip()
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": f"Speak this naturally in {language}: {text}"
                    }
                ],
            }
        ],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {
                        "voiceName": selected_voice
                    }
                }
            },
            "temperature": 0.1,
        },
    }
    response_payload = _post_generate_content(GEMINI_TTS_MODEL, payload, AI_PIPELINE_TTS_TIMEOUT_SEC)
    audio = _extract_audio_inline(response_payload)
    if not audio:
        return {}
    audio["voice"] = selected_voice
    return audio
