"""
Gemini AI service for the Mentoring Engine.
Handles prompt construction, API calls, and strict JSON response parsing.
"""
import json
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

GEMINI_API_URL = (
    'https://generativelanguage.googleapis.com/v1beta/models/'
    'gemini-2.5-flash-lite:generateContent'
)

SYSTEM_PROMPT = """You are an empathetic, highly skilled AI mentor for students and professionals.
Your role is to:
- Understand the student's current situation from their transcript
- Provide clear, actionable guidance
- Be emotionally aware and supportive
- Track their progress across sessions using provided memory

You MUST respond with a valid JSON object (no markdown, no code fences) with these exact keys:
{
  "mentor_message": "Your detailed mentoring response to the student",
  "emotional_tone": "one of: encouraging, empathetic, motivating, neutral, supportive, challenging, celebratory",
  "confidence_level": 0.0 to 1.0 (how confident the student seems),
  "clarity_level": 0.0 to 1.0 (how clear the student's goals/direction are),
  "action_items": ["action 1", "action 2", "action 3"],
  "session_summary": "A concise 1-2 sentence summary of this session for future memory"
}

Rules:
- mentor_message should be warm, personal, and actionable (150-300 words)
- action_items should have 2-5 specific, achievable items
- Adapt emotional_tone based on the student's mood and context
- Use session history to show continuity and track growth
- NEVER output anything outside the JSON object
"""


def build_prompt(transcript, context_source, student_goal, current_progress, session_history):
    """Build the user prompt with all available context."""
    parts = [f"[Context: Student is in the '{context_source}' section]"]

    if student_goal:
        parts.append(f"[Student Goal: {student_goal}]")

    if current_progress:
        parts.append(f"[Current Progress: {current_progress}]")

    if session_history:
        parts.append("\n[Previous Session Memory]")
        for i, session in enumerate(session_history, 1):
            parts.append(
                f"Session {i} ({session['context_source']}, {session['created_at'][:10]}):\n"
                f"  Summary: {session['session_summary']}\n"
                f"  Tone: {session['emotional_tone']} | Confidence: {session['confidence_level']}\n"
                f"  Actions: {', '.join(session['action_items']) if session['action_items'] else 'None'}"
            )
        parts.append("[End of Memory]\n")

    parts.append(f"Student says:\n{transcript}")
    return '\n'.join(parts)


def parse_ai_response(text):
    """
    Parse AI response text into a structured dict.
    Handles common issues: markdown fences, extra whitespace, malformed JSON.
    """
    cleaned = text.strip()

    # Strip markdown code fences if present
    if cleaned.startswith('```'):
        lines = cleaned.split('\n')
        # Remove first line (```json or ```) and last line (```)
        if lines[-1].strip() == '```':
            lines = lines[1:-1]
        else:
            lines = lines[1:]
        cleaned = '\n'.join(lines).strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("Failed to parse AI response as JSON, using fallback")
        return get_fallback_response(cleaned)

    # Validate and sanitise required fields
    return {
        'mentor_message': str(data.get('mentor_message', '')),
        'emotional_tone': _validate_tone(data.get('emotional_tone', 'neutral')),
        'confidence_level': _clamp_float(data.get('confidence_level', 0.5)),
        'clarity_level': _clamp_float(data.get('clarity_level', 0.5)),
        'action_items': _validate_action_items(data.get('action_items', [])),
        'session_summary': str(data.get('session_summary', '')),
    }


def get_fallback_response(raw_text=''):
    """Return a safe fallback when AI response is malformed."""
    return {
        'mentor_message': raw_text if raw_text else (
            "I'm here to help! Could you share more about what you're working on "
            "so I can give you better guidance?"
        ),
        'emotional_tone': 'supportive',
        'confidence_level': 0.5,
        'clarity_level': 0.5,
        'action_items': ['Reflect on your current goals', 'Try again with more detail'],
        'session_summary': 'Session had a parsing issue; fallback response provided.',
    }


def _validate_tone(tone):
    valid = {'encouraging', 'empathetic', 'motivating', 'neutral',
             'supportive', 'challenging', 'celebratory'}
    return tone if tone in valid else 'neutral'


def _clamp_float(value):
    try:
        return max(0.0, min(1.0, float(value)))
    except (TypeError, ValueError):
        return 0.5


def _validate_action_items(items):
    if not isinstance(items, list):
        return []
    return [str(item) for item in items if item][:10]


def get_mentor_response(transcript, context_source, student_goal, current_progress, session_history):
    """
    Main entry point. Builds prompt, calls Gemini, parses response.
    Returns a structured dict with mentoring data.
    """
    api_key = getattr(settings, 'GEMINI_API_KEY', None)
    if not api_key:
        logger.error("GEMINI_API_KEY not configured")
        fallback = get_fallback_response()
        fallback['mentor_message'] = (
            "I'm sorry, the AI mentoring service is temporarily unavailable. "
            "Please try again later."
        )
        return fallback

    user_prompt = build_prompt(
        transcript, context_source, student_goal, current_progress, session_history
    )

    payload = {
        'contents': [
            {
                'role': 'user',
                'parts': [
                    {'text': SYSTEM_PROMPT + '\n\n' + user_prompt}
                ],
            }
        ],
        'generationConfig': {
            'temperature': 0.7,
            'topP': 0.9,
            'maxOutputTokens': 1024,
        },
    }

    try:
        response = requests.post(
            f'{GEMINI_API_URL}?key={api_key}',
            json=payload,
            timeout=30,
        )
        response.raise_for_status()

        result = response.json()
        ai_text = (
            result.get('candidates', [{}])[0]
            .get('content', {})
            .get('parts', [{}])[0]
            .get('text', '')
        )

        if not ai_text:
            logger.warning("Empty AI response from Gemini")
            return get_fallback_response()

        return parse_ai_response(ai_text)

    except requests.exceptions.Timeout:
        logger.error("Gemini API request timed out")
        fallback = get_fallback_response()
        fallback['mentor_message'] = (
            "The request took too long. Please try again in a moment."
        )
        return fallback

    except requests.exceptions.RequestException as e:
        logger.error(f"Gemini API error: {e}")
        return get_fallback_response()

    except (KeyError, IndexError) as e:
        logger.error(f"Unexpected Gemini response structure: {e}")
        return get_fallback_response()
