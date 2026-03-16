import logging
import os
from typing import Any, Dict, List
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import StudentSession
from .serializers import SessionRequestSerializer, StudentSessionSerializer
from .services.memory_service import get_recent_sessions
from .services.gemini_service import get_mentor_response

logger = logging.getLogger(__name__)

ONBOARDING_HIGHLIGHT_KEYS = {
    'life_stage': 'Life stage',
    'school_class': 'School class',
    'school_stream': 'School stream',
    'competitive_direction': 'Competitive plan',
    'college_year': 'College year',
    'college_focus': 'College focus',
    'career_shift_intent': 'Career shift intent',
    'daily_time': 'Daily time',
    'dream_vs_effort': 'Dream vs effort',
    'pressure_response': 'Pressure response',
}


def _normalize_text(value: Any) -> str:
    if value is None:
        return ''
    if isinstance(value, str):
        return value.strip()
    return str(value).strip()


def _format_value(value: Any) -> str:
    if isinstance(value, str):
        return value.replace('_', ' ').strip()
    if isinstance(value, bool):
        return 'Yes' if value else 'No'
    return _normalize_text(value)


def _choice_display(instance: Any, field_name: str) -> str:
    raw_value = getattr(instance, field_name, None)
    if not raw_value:
        return ''

    display_fn = getattr(instance, f'get_{field_name}_display', None)
    if callable(display_fn):
        try:
            display_value = _normalize_text(display_fn())
            if display_value:
                return display_value
        except Exception:
            pass

    return _format_value(raw_value)


def _collect_onboarding_highlights(onboarding_data: Any) -> List[str]:
    if not isinstance(onboarding_data, dict):
        return []

    highlights: List[str] = []
    for key, label in ONBOARDING_HIGHLIGHT_KEYS.items():
        value = onboarding_data.get(key)
        if not value:
            continue
        highlights.append(f'{label}: {_format_value(value)}')
        if len(highlights) >= 6:
            break
    return highlights


def _build_onboarding_context(user: Any) -> Dict[str, Any]:
    profile = getattr(user, 'profile', None)
    if profile is None:
        return {}

    first_name = _normalize_text(getattr(user, 'first_name', ''))
    last_name = _normalize_text(getattr(user, 'last_name', ''))
    username = _normalize_text(getattr(user, 'username', '')) or 'there'
    full_name = ' '.join(part for part in [first_name, last_name] if part).strip()
    onboarding_data = getattr(profile, 'onboarding_data', {})

    context: Dict[str, Any] = {
        'first_name': first_name or username,
        'full_name': full_name or username,
        'education_stage': _choice_display(profile, 'education_stage'),
        'purpose': _choice_display(profile, 'purpose'),
        'domain': _choice_display(profile, 'domain'),
        'validation_mode': _choice_display(profile, 'validation_mode'),
        'goal_statement': _normalize_text(getattr(profile, 'goal_statement', '')),
        'weekly_hours': getattr(profile, 'weekly_hours', None),
        'onboarding_complete': bool(getattr(profile, 'onboarding_complete', False)),
        'onboarding_highlights': _collect_onboarding_highlights(onboarding_data),
    }

    cleaned_context: Dict[str, Any] = {}
    for key, value in context.items():
        if value in ('', None, [], {}):
            continue
        cleaned_context[key] = value
    return cleaned_context


def _build_auto_intro_prompt(context: Dict[str, Any]) -> str:
    if not context or not context.get('onboarding_complete'):
        return ''

    first_name = _normalize_text(context.get('first_name')) or 'there'
    detail_bits: List[str] = []

    stage = _normalize_text(context.get('education_stage'))
    if stage:
        detail_bits.append(f'education stage: {stage}')

    goal = _normalize_text(context.get('goal_statement'))
    if goal:
        detail_bits.append(f'goal: {goal}')

    weekly_hours = context.get('weekly_hours')
    if isinstance(weekly_hours, int) and weekly_hours > 0:
        detail_bits.append(f'weekly commitment: {weekly_hours} hours')

    highlights = context.get('onboarding_highlights')
    if isinstance(highlights, list) and highlights:
        detail_bits.extend(highlights[:3])

    details = '; '.join(detail_bits) if detail_bits else 'the user just completed onboarding'

    return (
        f'The user {first_name} just completed onboarding and landed on the dashboard. '
        f'Use this context: {details}. '
        'Start speaking now. In 4 short conversational sentences: '
        'welcome them to Planora, explain Dashboard + Roadmap + Tasks + AI mentor support, '
        'then ask one clear question about what they want to focus on today.'
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_session(request):
    """
    POST /api/ai-mentoring/session/

    Create a new AI mentoring session.
    Accepts: context_source, transcript, student_goal (optional), current_progress (optional).
    Returns the full mentoring session with AI-generated insights.
    """
    serializer = SessionRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    vd = serializer.validated_data  # type: ignore[union-attr]
    transcript = vd['transcript']  # type: ignore
    context_source = vd['context_source']  # type: ignore
    student_goal = vd.get('student_goal', '')  # type: ignore
    current_progress = vd.get('current_progress', '')  # type: ignore
    user = request.user

    # 1. Fetch last 3 sessions for global memory
    session_history = get_recent_sessions(user, limit=3)

    # 2. Call AI service
    try:
        ai_result = get_mentor_response(
            transcript=transcript,
            context_source=context_source,
            student_goal=student_goal,
            current_progress=current_progress,
            session_history=session_history,
        )
    except Exception as e:
        logger.error(f"AI mentoring service error: {e}")
        return Response(
            {'error': 'AI mentoring service is temporarily unavailable. Please try again.'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    # 3. Save session to database
    session = StudentSession.objects.create(
        user=user,
        context_source=context_source,
        student_goal=student_goal,
        current_progress=current_progress,
        transcript=transcript,
        mentor_message=ai_result['mentor_message'],
        emotional_tone=ai_result['emotional_tone'],
        confidence_level=ai_result['confidence_level'],
        clarity_level=ai_result['clarity_level'],
        action_items=ai_result['action_items'],
        session_summary=ai_result['session_summary'],
    )

    # 4. Return structured response
    response_serializer = StudentSessionSerializer(session)
    return Response(response_serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_sessions(request):
    """
    GET /api/ai-mentoring/sessions/

    List the authenticated user's mentoring sessions.
    Supports optional ?context_source= filter and ?limit= parameter.
    """
    sessions = StudentSession.objects.filter(user=request.user)

    context_source = request.query_params.get('context_source')
    if context_source:
        sessions = sessions.filter(context_source=context_source)

    limit = request.query_params.get('limit')
    if limit:
        try:
            sessions = sessions[:int(limit)]
        except (ValueError, TypeError):
            pass

    serializer = StudentSessionSerializer(sessions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def voice_config(request):
    """
    GET /api/ai-mentoring/voice/config/

    Return WebSocket proxy URL and session configuration for real-time voice.
    The frontend uses this to connect to the voice proxy server.
    """
    # In production set VOICE_PROXY_PUBLIC_URL=wss://voice.planorah.me/ws/voice
    # If unset, prefer VOICE_PROXY_HOST/VOICE_PROXY_PORT when provided;
    # otherwise derive a usable same-origin ws/wss fallback.
    public_url = os.getenv('VOICE_PROXY_PUBLIC_URL', '')
    if not public_url:
        host = os.getenv('VOICE_PROXY_HOST', '').strip()
        port = os.getenv('VOICE_PROXY_PORT', '8001').strip() or '8001'

        if host:
            public_url = f'ws://{host}:{port}/ws/voice'
        else:
            req_host = request.get_host()
            req_host_only = req_host.split(':')[0].lower()
            is_local = req_host_only in {'localhost', '127.0.0.1', '::1'}
            if is_local:
                public_url = f'ws://{req_host_only}:{port}/ws/voice'
            else:
                scheme = 'wss' if request.is_secure() else 'ws'
                public_url = f'{scheme}://{req_host}/ws/voice'

    # Fetch recent sessions for memory context
    session_memory = get_recent_sessions(request.user, limit=3)
    onboarding_context = _build_onboarding_context(request.user)
    auto_intro_prompt = _build_auto_intro_prompt(onboarding_context)

    return Response({
        'ws_url': public_url,
        'session_memory': session_memory,
        'onboarding_context': onboarding_context,
        'auto_intro_prompt': auto_intro_prompt,
        'available_voices': [
            {'id': 'Aoede', 'name': 'Aoede', 'description': 'Warm and bright'},
            {'id': 'Charon', 'name': 'Charon',
                'description': 'Calm and informative'},
            {'id': 'Fenrir', 'name': 'Fenrir',
                'description': 'Confident and expressive'},
            {'id': 'Kore', 'name': 'Kore', 'description': 'Clear and friendly'},
            {'id': 'Puck', 'name': 'Puck', 'description': 'Upbeat and lively'},
        ],
    })
