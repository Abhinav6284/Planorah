"""
Memory service for AI Mentoring Engine.
Retrieves recent session history to provide continuity across mentoring sessions.
"""
from ai_mentoring.models import StudentSession


def get_recent_sessions(user, limit=3):
    """
    Fetch the last `limit` mentoring sessions for a user (global memory).
    Returns a list of summary dicts ordered oldest-first so the AI sees
    chronological context.
    """
    sessions = (
        StudentSession.objects
        .filter(user=user)
        .order_by('-created_at')[:limit]
    )
    # Reverse so oldest comes first in context
    summaries = []
    for session in reversed(list(sessions)):
        summaries.append({
            'context_source': session.context_source,
            'student_goal': session.student_goal,
            'session_summary': session.session_summary,
            'emotional_tone': session.emotional_tone,
            'confidence_level': session.confidence_level,
            'action_items': session.action_items,
            'created_at': session.created_at.isoformat(),
        })
    return summaries
