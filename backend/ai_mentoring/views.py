import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import StudentSession
from .serializers import SessionRequestSerializer, StudentSessionSerializer
from .services.memory_service import get_recent_sessions
from .services.gemini_service import get_mentor_response

logger = logging.getLogger(__name__)


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
