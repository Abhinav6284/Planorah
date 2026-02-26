"""
AI Call Providers — provider-agnostic outbound call system.

Supported providers:
  • Vapi.ai        → set AI_CALL_PROVIDER=vapi
  • Retell.ai      → set AI_CALL_PROVIDER=retell
  • ElevenLabs     → set AI_CALL_PROVIDER=elevenlabs
  • Bland.ai       → set AI_CALL_PROVIDER=bland

Each provider implements the same interface so the service layer
never needs to know which backend is in use.
"""

import abc
import requests
import logging

logger = logging.getLogger(__name__)


# ───────────────────────────────────────────────
# Abstract base
# ───────────────────────────────────────────────

class AICallProvider(abc.ABC):
    """Base class for all outbound AI call providers."""

    @abc.abstractmethod
    def initiate_call(
        self,
        to_number: str,
        system_prompt: str,
        first_message: str,
        metadata: dict,
    ) -> dict:
        """
        Initiate an outbound AI phone call.

        Returns a dict with:
            success    (bool)
            call_id    (str | None)
            provider   (str)
            error      (str | None)
            raw        (dict | None) — raw provider response
        """


# ───────────────────────────────────────────────
# Vapi.ai
# ───────────────────────────────────────────────

class VapiProvider(AICallProvider):
    """
    Vapi.ai outbound calls.

    Required env vars:
        VAPI_API_KEY
        VAPI_PHONE_NUMBER_ID   — the phone number ID from your Vapi dashboard
        VAPI_ASSISTANT_ID      — (optional) pre-built assistant; if omitted, an
                                 inline assistant is created from the system prompt
    """

    BASE_URL = "https://api.vapi.ai/call/phone"

    def __init__(self, api_key: str, phone_number_id: str, assistant_id: str | None = None):
        self.api_key = api_key
        self.phone_number_id = phone_number_id
        self.assistant_id = assistant_id

    def initiate_call(self, to_number, system_prompt, first_message, metadata):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        if self.assistant_id:
            # Override an existing assistant's prompt/first message
            payload = {
                "phoneNumberId": self.phone_number_id,
                "customer": {"number": to_number},
                "assistantId": self.assistant_id,
                "assistantOverrides": {
                    "firstMessage": first_message,
                    "model": {
                        "systemPrompt": system_prompt,
                    },
                },
                "metadata": metadata,
            }
        else:
            # Spin up an inline assistant
            payload = {
                "phoneNumberId": self.phone_number_id,
                "customer": {"number": to_number},
                "assistant": {
                    "firstMessage": first_message,
                    "model": {
                        "provider": "openai",
                        "model": "gpt-4o-mini",
                        "systemPrompt": system_prompt,
                    },
                    "voice": {
                        "provider": "11labs",
                        "voiceId": "rachel",
                    },
                },
                "metadata": metadata,
            }

        try:
            resp = requests.post(self.BASE_URL, json=payload,
                                 headers=headers, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            return {
                "success": True,
                "call_id": data.get("id"),
                "provider": "vapi",
                "error": None,
                "raw": data,
            }
        except requests.exceptions.HTTPError as e:
            body = e.response.text if e.response else str(e)
            logger.error(f"[Vapi] HTTP error: {body}")
            return {"success": False, "call_id": None, "provider": "vapi", "error": body, "raw": None}
        except Exception as e:
            logger.error(f"[Vapi] Unexpected error: {e}", exc_info=True)
            return {"success": False, "call_id": None, "provider": "vapi", "error": str(e), "raw": None}


# ───────────────────────────────────────────────
# Retell.ai
# ───────────────────────────────────────────────

class RetellProvider(AICallProvider):
    """
    Retell.ai outbound calls.

    Required env vars:
        RETELL_API_KEY
        RETELL_FROM_NUMBER   — the Twilio/Retell number to call from (+E.164)
        RETELL_AGENT_ID      — the Retell agent configured with dynamic variables
    """

    BASE_URL = "https://api.retellai.com/v2/create-phone-call"

    def __init__(self, api_key: str, from_number: str, agent_id: str):
        self.api_key = api_key
        self.from_number = from_number
        self.agent_id = agent_id

    def initiate_call(self, to_number, system_prompt, first_message, metadata):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "from_number": self.from_number,
            "to_number": to_number,
            "override_agent_id": self.agent_id,
            "retell_llm_dynamic_variables": {
                "system_prompt": system_prompt,
                "first_message": first_message,
            },
            "metadata": metadata,
        }

        try:
            resp = requests.post(self.BASE_URL, json=payload,
                                 headers=headers, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            return {
                "success": True,
                "call_id": data.get("call_id"),
                "provider": "retell",
                "error": None,
                "raw": data,
            }
        except requests.exceptions.HTTPError as e:
            body = e.response.text if e.response else str(e)
            logger.error(f"[Retell] HTTP error: {body}")
            return {"success": False, "call_id": None, "provider": "retell", "error": body, "raw": None}
        except Exception as e:
            logger.error(f"[Retell] Unexpected error: {e}", exc_info=True)
            return {"success": False, "call_id": None, "provider": "retell", "error": str(e), "raw": None}


# ───────────────────────────────────────────────
# ElevenLabs Conversational AI
# ───────────────────────────────────────────────

class ElevenLabsProvider(AICallProvider):
    """
    ElevenLabs Conversational AI outbound calls (via Twilio bridge).

    Required env vars:
        ELEVENLABS_API_KEY
        ELEVENLABS_AGENT_ID
        ELEVENLABS_FROM_NUMBER   — Twilio number linked to your ElevenLabs account (+E.164)
    """

    BASE_URL = "https://api.elevenlabs.io/v1/convai/twilio/outbound-call"

    def __init__(self, api_key: str, agent_id: str, from_number: str):
        self.api_key = api_key
        self.agent_id = agent_id
        self.from_number = from_number

    def initiate_call(self, to_number, system_prompt, first_message, metadata):
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "agent_id": self.agent_id,
            "agent_phone_number": self.from_number,
            "to_number": to_number,
            "conversation_initiation_client_data": {
                "dynamic_variables": {
                    "system_prompt": system_prompt,
                    "first_message": first_message,
                },
                "metadata": metadata,
            },
        }

        try:
            resp = requests.post(self.BASE_URL, json=payload,
                                 headers=headers, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            return {
                "success": True,
                "call_id": data.get("conversation_id"),
                "provider": "elevenlabs",
                "error": None,
                "raw": data,
            }
        except requests.exceptions.HTTPError as e:
            body = e.response.text if e.response else str(e)
            logger.error(f"[ElevenLabs] HTTP error: {body}")
            return {"success": False, "call_id": None, "provider": "elevenlabs", "error": body, "raw": None}
        except Exception as e:
            logger.error(f"[ElevenLabs] Unexpected error: {e}", exc_info=True)
            return {"success": False, "call_id": None, "provider": "elevenlabs", "error": str(e), "raw": None}


# ───────────────────────────────────────────────
# Bland.ai
# ───────────────────────────────────────────────

class BlandProvider(AICallProvider):
    """
    Bland.ai outbound calls.

    Required env vars:
        BLAND_API_KEY
        BLAND_FROM_NUMBER   — (optional) specific number to call from
    """

    BASE_URL = "https://api.bland.ai/v1/calls"

    def __init__(self, api_key: str, from_number: str | None = None):
        self.api_key = api_key
        self.from_number = from_number

    def initiate_call(self, to_number, system_prompt, first_message, metadata):
        headers = {
            "authorization": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "phone_number": to_number,
            "task": system_prompt,
            "first_sentence": first_message,
            "voice": "June",
            "reduce_latency": True,
            "metadata": metadata,
        }
        if self.from_number:
            payload["from"] = self.from_number

        try:
            resp = requests.post(self.BASE_URL, json=payload,
                                 headers=headers, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            return {
                "success": True,
                "call_id": data.get("call_id"),
                "provider": "bland",
                "error": None,
                "raw": data,
            }
        except requests.exceptions.HTTPError as e:
            body = e.response.text if e.response else str(e)
            logger.error(f"[Bland] HTTP error: {body}")
            return {"success": False, "call_id": None, "provider": "bland", "error": body, "raw": None}
        except Exception as e:
            logger.error(f"[Bland] Unexpected error: {e}", exc_info=True)
            return {"success": False, "call_id": None, "provider": "bland", "error": str(e), "raw": None}


# ───────────────────────────────────────────────
# Factory
# ───────────────────────────────────────────────

def get_provider() -> AICallProvider | None:
    """
    Return the configured provider instance, or None if not configured.
    Reads AI_CALL_PROVIDER from environment to select the backend.
    """
    import os
    provider_name = os.getenv("AI_CALL_PROVIDER", "").strip().lower()

    if provider_name == "vapi":
        return VapiProvider(
            api_key=os.getenv("VAPI_API_KEY", ""),
            phone_number_id=os.getenv("VAPI_PHONE_NUMBER_ID", ""),
            assistant_id=os.getenv("VAPI_ASSISTANT_ID") or None,
        )
    elif provider_name == "retell":
        return RetellProvider(
            api_key=os.getenv("RETELL_API_KEY", ""),
            from_number=os.getenv("RETELL_FROM_NUMBER", ""),
            agent_id=os.getenv("RETELL_AGENT_ID", ""),
        )
    elif provider_name == "elevenlabs":
        return ElevenLabsProvider(
            api_key=os.getenv("ELEVENLABS_API_KEY", ""),
            agent_id=os.getenv("ELEVENLABS_AGENT_ID", ""),
            from_number=os.getenv("ELEVENLABS_FROM_NUMBER", ""),
        )
    elif provider_name == "bland":
        return BlandProvider(
            api_key=os.getenv("BLAND_API_KEY", ""),
            from_number=os.getenv("BLAND_FROM_NUMBER") or None,
        )
    else:
        if provider_name:
            logger.warning(
                f"[AICall] Unknown provider '{provider_name}'. Supported: vapi, retell, elevenlabs, bland.")
        else:
            logger.info("[AICall] AI_CALL_PROVIDER not set — calls disabled.")
        return None
