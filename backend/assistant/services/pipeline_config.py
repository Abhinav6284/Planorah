import os


def _env_bool(name: str, default: bool) -> bool:
    raw = str(os.getenv(name, "true" if default else "false")).strip().lower()
    return raw in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int) -> int:
    try:
        return int(str(os.getenv(name, default)).strip())
    except (TypeError, ValueError):
        return default


AI_PIPELINE_ENABLED = _env_bool("AI_PIPELINE_ENABLED", False)
AI_PIPELINE_ACTIONS_ENABLED = _env_bool("AI_PIPELINE_ACTIONS_ENABLED", True)
AI_PIPELINE_FALLBACK_REALTIME_ENABLED = _env_bool("AI_PIPELINE_FALLBACK_REALTIME_ENABLED", True)
AI_PIPELINE_CHANNELS = {
    item.strip().lower()
    for item in str(os.getenv("AI_PIPELINE_CHANNELS", "voice,text")).split(",")
    if item.strip()
}

AI_PIPELINE_DEFAULT_LANGUAGE = str(os.getenv("AI_PIPELINE_DEFAULT_LANGUAGE", "hinglish")).strip() or "hinglish"
AI_PIPELINE_MAX_FRONTEND_CONTEXT_BYTES = _env_int("AI_PIPELINE_MAX_FRONTEND_CONTEXT_BYTES", 12000)
AI_PIPELINE_MAX_BACKEND_CONTEXT_BYTES = _env_int("AI_PIPELINE_MAX_BACKEND_CONTEXT_BYTES", 32000)
AI_PIPELINE_MAX_SESSION_TURNS = _env_int("AI_PIPELINE_MAX_SESSION_TURNS", 12)
AI_PIPELINE_MAX_AUDIO_MB = _env_int("AI_PIPELINE_MAX_AUDIO_MB", 8)
AI_PIPELINE_STT_TIMEOUT_SEC = _env_int("AI_PIPELINE_STT_TIMEOUT_SEC", 30)
AI_PIPELINE_LLM_TIMEOUT_SEC = _env_int("AI_PIPELINE_LLM_TIMEOUT_SEC", 35)
AI_PIPELINE_TTS_TIMEOUT_SEC = _env_int("AI_PIPELINE_TTS_TIMEOUT_SEC", 35)

GEMINI_STT_MODEL = str(os.getenv("GEMINI_STT_MODEL", "gemini-2.5-flash")).strip()
GEMINI_LLM_MODEL = str(os.getenv("GEMINI_LLM_MODEL", "gemini-2.5-flash")).strip()
GEMINI_TTS_MODEL = str(os.getenv("GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts")).strip()
GEMINI_DEFAULT_VOICE = str(os.getenv("GEMINI_DEFAULT_VOICE", "Kore")).strip() or "Kore"

ASSISTANT_V2_AVAILABLE_VOICES = [
    {"id": "Kore", "name": "Kore", "description": "Clear and friendly"},
    {"id": "Aoede", "name": "Aoede", "description": "Warm and bright"},
    {"id": "Charon", "name": "Charon", "description": "Calm and informative"},
    {"id": "Fenrir", "name": "Fenrir", "description": "Confident and expressive"},
    {"id": "Puck", "name": "Puck", "description": "Upbeat and lively"},
]

