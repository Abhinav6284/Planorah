"""
ai_calls/views.py

Endpoints:
  POST /api/ai-calls/trigger/onboarding/  — manually re-trigger the onboarding
                                             call for the authenticated user (staff only or self)
  GET  /api/ai-calls/logs/                — fetch call history for the authenticated user
"""

import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from users.models import UserProfile

from .models import AICallLog
from .service import trigger_onboarding_call

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def retrigger_onboarding_call(request):
    """
    Manually re-trigger the AI onboarding call for the current user.
    Useful for testing or if the user missed the first call.
    Requires the user to have a phone number on their account.
    """
    user = request.user

    try:
        profile = user.profile  # type: ignore[attr-defined]
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "User profile not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if not user.phone_number:
        return Response(
            {"error": "No phone number on your account. Please add one in your profile settings."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Kick off in background thread
    trigger_onboarding_call(user, profile)

    return Response(
        {"message": "AI call initiated. You should receive a call shortly."},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def call_logs(request):
    """
    Return the AI call history for the current user.
    """
    logs = AICallLog.objects.filter(user=request.user).values(
        "id",
        "provider",
        "trigger",
        "status",
        "call_id",
        "phone_number",
        "error_message",
        "created_at",
    )
    return Response({"calls": list(logs)}, status=status.HTTP_200_OK)
