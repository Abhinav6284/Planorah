from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import requests # Added requests import
from .models import Event
from .google_calendar import GoogleCalendarService
from .serializers import EventSerializer # Assuming you have one, or we'll make a simple one inline if needed

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
        url = service.get_authorization_url()
        return Response({"url": url})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def google_callback(request):
    """Exchange code for token"""
    code = request.data.get('code')
    if not code:
        return Response({"error": "Code is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        service = GoogleCalendarService(request.user)
        service.exchange_code(code)
        return Response({"message": "Google Calendar connected successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
from django.shortcuts import redirect # Added missing import

from django.core import signing
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
@permission_classes([AllowAny]) # Allow callback without JWT header
def spotify_callback(request):
    code = request.GET.get('code')
    state = request.GET.get('state')
    
    if not code or not state:
        return Response({"error": "Code and state are required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Verify state to get user ID
        user_id = signing.loads(state, max_age=600) # 10 minutes expiry
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
        print("Spotify Callback Error: Invalid state signature")
        return Response({"error": "Invalid or expired state"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        # print(f"Spotify Callback Error: {str(e)}")
        import traceback
        traceback.print_exc()
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
             cred.expires_in = timezone.now() + timedelta(seconds=token_data['expires_in'])
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
            print(f"Spotify API Error (Current Song): {e}")
        return Response({"error": str(e)}, status=e.response.status_code)
    except Exception as e:
        # print(f"Spotify Internal Error (Current Song): {e}")
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
             cred.expires_in = timezone.now() + timedelta(seconds=token_data['expires_in'])
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
            print(f"Spotify API Error (Queue): {e}")
        return Response({"error": str(e)}, status=e.response.status_code)
    except Exception as e:
        # print(f"Spotify Internal Error (Queue): {e}")
        import traceback
        traceback.print_exc()
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
