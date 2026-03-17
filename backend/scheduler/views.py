from . import spotify
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from django.shortcuts import redirect  # Added missing import
from datetime import timedelta
from django.utils import timezone
from .models import SpotifyCredential
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core import signing
import requests
import logging
from .models import Event, GoogleCredential
from .google_calendar import GoogleCalendarService, PKCE_STATE_MAX_AGE, PKCE_STATE_SALT
from .serializers import EventSerializer  # Assuming you have one, or we'll make a simple one inline if needed

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_events(request):
    events = Event.objects.filter(user=request.user)
    data = [{
        "id": e.id,
        "title": e.title,
        "description": e.description,
        "start_time": e.start_time.isoformat() if e.start_time else None,
        "end_time": e.end_time.isoformat() if e.end_time else None,
        "is_completed": e.is_completed,
        "task_id": e.linked_task_id  # For navigation to tasks section
    } for e in events]
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_event(request):
    # Basic creation logic
    return Response({"message": "Not implemented yet"}, status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_all_events(request):
    """Delete all calendar events for the current user"""
    deleted_count, _ = Event.objects.filter(user=request.user).delete()
    return Response({
        "message": f"Deleted {deleted_count} events",
        "deleted_count": deleted_count
    })

# --- Google Calendar Endpoints ---


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def google_auth_url(request):
    """Get the Google OAuth URL"""
    try:
        service = GoogleCalendarService(request.user)
        redirect_uri = request.query_params.get('redirect_uri')
        url = service.get_authorization_url(redirect_uri=redirect_uri)
        return Response({"url": url})
    except Exception as e:
        logger.exception("Google auth URL error for user=%s", request.user.id)
        msg = str(e)
        lowered = msg.lower()
        if "credentials are missing" in lowered or "redirect uri is missing" in lowered:
            return Response({"error": msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"error": "Failed to initialize Google Calendar auth."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def google_callback(request):
    """Exchange Google OAuth code for tokens and persist credentials."""
    code = request.data.get('code')
    state = request.data.get('state')
    redirect_uri = request.data.get('redirect_uri')

    logger.debug(
        "Google callback received: user=%s has_code=%s has_state=%s redirect_uri=%s",
        request.user.id, bool(code), bool(state), redirect_uri,
    )

    if not code:
        logger.warning("Google callback missing code: user=%s", request.user.id)
        return Response({"error": "Code is required"}, status=status.HTTP_400_BAD_REQUEST)
    if not state:
        logger.warning("Google callback missing state: user=%s", request.user.id)
        return Response({"error": "Missing OAuth state. Please reconnect Google Calendar."}, status=status.HTTP_400_BAD_REQUEST)

    # --- Verify PKCE state ---
    code_verifier = None
    try:
        payload = signing.loads(state, salt=PKCE_STATE_SALT, max_age=PKCE_STATE_MAX_AGE)
        if payload.get("u") != request.user.id:
            logger.warning(
                "Google callback state user mismatch: expected=%s got=%s",
                request.user.id, payload.get("u"),
            )
            return Response({"error": "Invalid OAuth state"}, status=status.HTTP_400_BAD_REQUEST)
        code_verifier = payload.get("cv")
        logger.debug("Google callback state verified: user=%s has_code_verifier=%s", request.user.id, bool(code_verifier))
    except signing.SignatureExpired:
        logger.warning("Google callback state expired: user=%s", request.user.id)
        return Response({"error": "OAuth state expired. Please reconnect Google Calendar."}, status=status.HTTP_400_BAD_REQUEST)
    except signing.BadSignature:
        logger.warning("Google callback invalid state signature: user=%s", request.user.id)
        return Response({"error": "Invalid or expired OAuth state"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as state_err:
        logger.exception("Google callback state decode error: user=%s error=%s", request.user.id, state_err)
        return Response({"error": "Invalid OAuth state. Please reconnect Google Calendar."}, status=status.HTTP_400_BAD_REQUEST)

    if not code_verifier:
        logger.warning("Google callback missing code_verifier in state: user=%s", request.user.id)
        return Response({"error": "OAuth verification failed. Please reconnect Google Calendar."}, status=status.HTTP_400_BAD_REQUEST)

    # --- Exchange code for tokens ---
    try:
        logger.debug("Exchanging Google OAuth code: user=%s redirect_uri=%s", request.user.id, redirect_uri)
        service = GoogleCalendarService(request.user)
        service.exchange_code(code, redirect_uri=redirect_uri, code_verifier=code_verifier)
        logger.info("Google Calendar connected successfully: user=%s", request.user.id)
        return Response({"message": "Google Calendar connected successfully"})
    except Exception as e:
        logger.exception("Google callback token exchange error: user=%s error=%s", request.user.id, e)
        error_text = str(e)
        lowered = error_text.lower()

        # Duplicate callback/code redemption can happen on repeated callback execution.
        if "invalid_grant" in lowered and GoogleCredential.objects.filter(user=request.user).exists():
            logger.info("Google Calendar already connected (invalid_grant on re-use): user=%s", request.user.id)
            return Response({"message": "Google Calendar already connected"})

        if "code_verifier" in lowered or "code verifier" in lowered:
            return Response(
                {"error": "OAuth verification failed. Please reconnect Google Calendar."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if "invalid_grant" in lowered or "redirect_uri_mismatch" in lowered:
            return Response(
                {"error": "Google authorization is invalid or expired. Please reconnect and try again."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if "invalid_client" in lowered or "unauthorized_client" in lowered or "invalid_request" in lowered:
            return Response(
                {"error": "Google OAuth client configuration is invalid. Please contact support."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        if "access blocked" in lowered or "access_denied" in lowered or "org_internal" in lowered:
            return Response(
                {"error": "Google OAuth app access is blocked for this account. Check app publishing status and test users."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if "oauth credentials are missing" in lowered:
            return Response(
                {"error": "Google Calendar is not configured on the server. Contact support."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        if "redirect uri is missing" in lowered:
            return Response(
                {"error": "Google Calendar redirect URI is not configured. Contact support."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({"error": "Failed to connect Google Calendar."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sync_calendar(request):
    """Fetch events from Google Calendar"""
    try:
        service = GoogleCalendarService(request.user)
        events = service.list_events()

        # Transform for frontend
        formatted_events = []
        for e in events:
            start = e['start'].get('dateTime', e['start'].get('date'))
            end = e['end'].get('dateTime', e['end'].get('date'))
            formatted_events.append({
                "id": e['id'],
                "title": e.get('summary', 'No Title'),
                "start": start,
                "end": end,
                "type": "google"
            })

        return Response(formatted_events)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Spotify Endpoints ---

from . import spotify
from .models import SpotifyCredential
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import redirect  # Added missing import

from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def spotify_auth_url(request):
    # Sign the user ID to create a secure state parameter
    state = signing.dumps(request.user.id)
    url = spotify.get_auth_url(state=state)
    return Response({"url": url})


@api_view(['GET'])
@permission_classes([AllowAny])  # Allow callback without JWT header
def spotify_callback(request):
    code = request.GET.get('code')
    state = request.GET.get('state')

    if not code or not state:
        return Response({"error": "Code and state are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Verify state to get user ID
        user_id = signing.loads(state, max_age=600)  # 10 minutes expiry
        User = get_user_model()
        user = User.objects.get(id=user_id)

        token_data = spotify.get_token(code)

        # Save credential
        SpotifyCredential.objects.update_or_create(
            user=user,
            defaults={
                "access_token": token_data['access_token'],
                "refresh_token": token_data.get('refresh_token'),
                "expires_in": timezone.now() + timedelta(seconds=token_data['expires_in']),
                "token_type": token_data['token_type']
            }
        )
        return redirect("http://localhost:3000/dashboard")
    except signing.BadSignature:
        logger.warning("Spotify Callback Error: Invalid state signature")
        return Response({"error": "Invalid or expired state"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception("Spotify Callback Error: %s", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_song(request):
    try:
        cred = SpotifyCredential.objects.get(user=request.user)

        # Simple refresh check (should be more robust in prod)
        if cred.expires_in and timezone.now() > cred.expires_in:
            token_data = spotify.refresh_token(cred.refresh_token)
            cred.access_token = token_data['access_token']
            cred.expires_in = timezone.now(
            ) + timedelta(seconds=token_data['expires_in'])
            cred.save()

        data = spotify.get_current_song(cred.access_token)
        return Response(data)
    except SpotifyCredential.DoesNotExist:
        return Response({"error": "Not connected"}, status=status.HTTP_404_NOT_FOUND)
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 403:
            # Suppress 403 Forbidden errors (common for non-premium users)
            pass
        else:
            logger.error("Spotify API Error (Current Song): %s", e)
        return Response({"error": str(e)}, status=e.response.status_code)
    except Exception as e:
        logger.exception("Spotify Internal Error (Current Song): %s", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_queue(request):
    try:
        cred = SpotifyCredential.objects.get(user=request.user)
        # Refresh token check (simplified)
        if cred.expires_in and timezone.now() > cred.expires_in:
            token_data = spotify.refresh_token(cred.refresh_token)
            cred.access_token = token_data['access_token']
            cred.expires_in = timezone.now(
            ) + timedelta(seconds=token_data['expires_in'])
            cred.save()

        data = spotify.get_queue(cred.access_token)
        return Response(data)
    except SpotifyCredential.DoesNotExist:
        return Response({"error": "Not connected"}, status=status.HTTP_404_NOT_FOUND)
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 403:
            # Suppress 403 Forbidden errors (common for non-premium users)
            pass
        else:
            logger.error("Spotify API Error (Queue): %s", e)
        return Response({"error": str(e)}, status=e.response.status_code)
    except Exception as e:
        logger.exception("Spotify Internal Error (Queue): %s", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def spotify_control(request):
    action = request.data.get('action')
    try:
        cred = SpotifyCredential.objects.get(user=request.user)
        if action == 'play':
            spotify.play(cred.access_token)
        elif action == 'pause':
            spotify.pause(cred.access_token)
        elif action == 'next':
            spotify.next_track(cred.access_token)
        elif action == 'prev':
            spotify.previous_track(cred.access_token)
        return Response({"status": "success"})
    except requests.exceptions.HTTPError as e:
        return Response({"error": str(e), "spotify_error": e.response.json().get('error', {})}, status=e.response.status_code)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
