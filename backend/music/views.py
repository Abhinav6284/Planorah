import os
import requests
import base64
from datetime import timedelta
from urllib.parse import urlencode

from django.shortcuts import redirect
from django.utils import timezone
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from .models import SpotifyToken, YouTubeToken, MusicPreferences

# Spotify OAuth Configuration
SPOTIFY_CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID', '')
SPOTIFY_CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET', '')
SPOTIFY_REDIRECT_URI = os.getenv('SPOTIFY_REDIRECT_URI', 'https://planorah.me/auth/spotify/callback')

SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
SPOTIFY_API_URL = 'https://api.spotify.com/v1'

SPOTIFY_SCOPES = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'user-read-email',
    'user-read-private',
    'playlist-read-private',
    'playlist-read-collaborative',
]

# YouTube/Google OAuth Configuration
YOUTUBE_CLIENT_ID = os.getenv('YOUTUBE_CLIENT_ID', '')
YOUTUBE_CLIENT_SECRET = os.getenv('YOUTUBE_CLIENT_SECRET', '')
YOUTUBE_REDIRECT_URI = os.getenv('YOUTUBE_REDIRECT_URI', 'https://planorah.me/auth/youtube/callback')

YOUTUBE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
YOUTUBE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3'

YOUTUBE_SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
]


class SpotifyAuthURL(APIView):
    """Generate Spotify OAuth URL for user login"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = {
            'client_id': SPOTIFY_CLIENT_ID,
            'response_type': 'code',
            'redirect_uri': SPOTIFY_REDIRECT_URI,
            'scope': ' '.join(SPOTIFY_SCOPES),
            'show_dialog': 'true',
        }
        auth_url = f"{SPOTIFY_AUTH_URL}?{urlencode(params)}"
        return Response({'auth_url': auth_url})


class SpotifyCallback(APIView):
    """Handle Spotify OAuth callback"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'No authorization code provided'}, status=400)

        # Exchange code for tokens
        auth_header = base64.b64encode(
            f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()
        ).decode()

        response = requests.post(
            SPOTIFY_TOKEN_URL,
            data={
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': SPOTIFY_REDIRECT_URI,
            },
            headers={
                'Authorization': f'Basic {auth_header}',
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        )

        if response.status_code != 200:
            return Response({'error': 'Failed to get access token', 'details': response.json()}, status=400)

        data = response.json()
        expires_at = timezone.now() + timedelta(seconds=data['expires_in'])

        # Save or update token
        SpotifyToken.objects.update_or_create(
            user=request.user,
            defaults={
                'access_token': data['access_token'],
                'refresh_token': data.get('refresh_token', ''),
                'token_type': data['token_type'],
                'expires_at': expires_at,
            }
        )

        # Create music preferences if not exists
        MusicPreferences.objects.get_or_create(user=request.user)

        return Response({'success': True, 'message': 'Spotify connected successfully'})


class SpotifyRefreshToken(APIView):
    """Refresh Spotify access token"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = SpotifyToken.objects.get(user=request.user)
        except SpotifyToken.DoesNotExist:
            return Response({'error': 'Not connected to Spotify'}, status=400)

        auth_header = base64.b64encode(
            f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()
        ).decode()

        response = requests.post(
            SPOTIFY_TOKEN_URL,
            data={
                'grant_type': 'refresh_token',
                'refresh_token': token.refresh_token,
            },
            headers={
                'Authorization': f'Basic {auth_header}',
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        )

        if response.status_code != 200:
            return Response({'error': 'Failed to refresh token'}, status=400)

        data = response.json()
        token.access_token = data['access_token']
        token.expires_at = timezone.now() + timedelta(seconds=data['expires_in'])
        if 'refresh_token' in data:
            token.refresh_token = data['refresh_token']
        token.save()

        return Response({'success': True, 'access_token': token.access_token})


class SpotifyStatus(APIView):
    """Check if user is connected to Spotify"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            token = SpotifyToken.objects.get(user=request.user)
            
            # Auto-refresh if expired
            if token.is_expired():
                # Trigger refresh
                auth_header = base64.b64encode(
                    f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()
                ).decode()

                response = requests.post(
                    SPOTIFY_TOKEN_URL,
                    data={
                        'grant_type': 'refresh_token',
                        'refresh_token': token.refresh_token,
                    },
                    headers={
                        'Authorization': f'Basic {auth_header}',
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                )

                if response.status_code == 200:
                    data = response.json()
                    token.access_token = data['access_token']
                    token.expires_at = timezone.now() + timedelta(seconds=data['expires_in'])
                    if 'refresh_token' in data:
                        token.refresh_token = data['refresh_token']
                    token.save()
                else:
                    return Response({'connected': False, 'error': 'Token expired and refresh failed'})

            return Response({
                'connected': True,
                'access_token': token.access_token,
                'expires_at': token.expires_at.isoformat(),
            })
        except SpotifyToken.DoesNotExist:
            return Response({'connected': False})


class SpotifyDisconnect(APIView):
    """Disconnect Spotify account"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        SpotifyToken.objects.filter(user=request.user).delete()
        return Response({'success': True, 'message': 'Spotify disconnected'})


class SpotifyNowPlaying(APIView):
    """Get currently playing track"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            token = SpotifyToken.objects.get(user=request.user)
        except SpotifyToken.DoesNotExist:
            return Response({'error': 'Not connected to Spotify'}, status=400)

        response = requests.get(
            f"{SPOTIFY_API_URL}/me/player/currently-playing",
            headers={'Authorization': f'Bearer {token.access_token}'}
        )

        if response.status_code == 204:
            return Response({'is_playing': False, 'message': 'Nothing playing'})
        
        if response.status_code != 200:
            return Response({'error': 'Failed to get playback'}, status=response.status_code)

        data = response.json()
        return Response({
            'is_playing': data.get('is_playing', False),
            'track': {
                'name': data['item']['name'] if data.get('item') else None,
                'artist': ', '.join([a['name'] for a in data['item']['artists']]) if data.get('item') else None,
                'album': data['item']['album']['name'] if data.get('item') else None,
                'image': data['item']['album']['images'][0]['url'] if data.get('item') and data['item']['album']['images'] else None,
                'duration_ms': data['item']['duration_ms'] if data.get('item') else 0,
                'progress_ms': data.get('progress_ms', 0),
            } if data.get('item') else None,
            'device': data.get('device', {}).get('name'),
        })


class SpotifyPlaybackControl(APIView):
    """Control Spotify playback (play, pause, next, previous)"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = SpotifyToken.objects.get(user=request.user)
        except SpotifyToken.DoesNotExist:
            return Response({'error': 'Not connected to Spotify'}, status=400)

        action = request.data.get('action')
        headers = {'Authorization': f'Bearer {token.access_token}'}

        if action == 'play':
            response = requests.put(f"{SPOTIFY_API_URL}/me/player/play", headers=headers)
        elif action == 'pause':
            response = requests.put(f"{SPOTIFY_API_URL}/me/player/pause", headers=headers)
        elif action == 'next':
            response = requests.post(f"{SPOTIFY_API_URL}/me/player/next", headers=headers)
        elif action == 'previous':
            response = requests.post(f"{SPOTIFY_API_URL}/me/player/previous", headers=headers)
        else:
            return Response({'error': 'Invalid action'}, status=400)

        if response.status_code in [200, 204]:
            return Response({'success': True, 'action': action})
        else:
            return Response({'error': 'Playback control failed', 'details': response.text}, status=response.status_code)


class SpotifyPlaylists(APIView):
    """Get user's Spotify playlists"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            token = SpotifyToken.objects.get(user=request.user)
        except SpotifyToken.DoesNotExist:
            return Response({'error': 'Not connected to Spotify'}, status=400)

        response = requests.get(
            f"{SPOTIFY_API_URL}/me/playlists?limit=20",
            headers={'Authorization': f'Bearer {token.access_token}'}
        )

        if response.status_code != 200:
            return Response({'error': 'Failed to get playlists'}, status=response.status_code)

        data = response.json()
        playlists = [{
            'id': p['id'],
            'name': p['name'],
            'image': p['images'][0]['url'] if p['images'] else None,
            'tracks_count': p['tracks']['total'],
            'uri': p['uri'],
        } for p in data['items']]

        return Response({'playlists': playlists})


class SpotifyPlayPlaylist(APIView):
    """Play a specific playlist"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = SpotifyToken.objects.get(user=request.user)
        except SpotifyToken.DoesNotExist:
            return Response({'error': 'Not connected to Spotify'}, status=400)

        playlist_uri = request.data.get('playlist_uri')
        if not playlist_uri:
            return Response({'error': 'No playlist URI provided'}, status=400)

        response = requests.put(
            f"{SPOTIFY_API_URL}/me/player/play",
            headers={'Authorization': f'Bearer {token.access_token}'},
            json={'context_uri': playlist_uri}
        )

        if response.status_code in [200, 204]:
            return Response({'success': True})
        else:
            return Response({'error': 'Failed to play playlist'}, status=response.status_code)


class MusicPreferencesView(APIView):
    """Get and update music preferences"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        prefs, _ = MusicPreferences.objects.get_or_create(user=request.user)
        return Response({
            'spotify_enabled': prefs.spotify_enabled,
            'youtube_enabled': prefs.youtube_enabled,
            'default_service': prefs.default_service,
        })

    def put(self, request):
        prefs, _ = MusicPreferences.objects.get_or_create(user=request.user)
        
        if 'spotify_enabled' in request.data:
            prefs.spotify_enabled = request.data['spotify_enabled']
        if 'youtube_enabled' in request.data:
            prefs.youtube_enabled = request.data['youtube_enabled']
        if 'default_service' in request.data:
            prefs.default_service = request.data['default_service']
        
        prefs.save()
        return Response({'success': True})


# ==================== YouTube OAuth Views ====================

class YouTubeAuthURL(APIView):
    """Generate YouTube/Google OAuth URL for user login"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        params = {
            'client_id': YOUTUBE_CLIENT_ID,
            'response_type': 'code',
            'redirect_uri': YOUTUBE_REDIRECT_URI,
            'scope': ' '.join(YOUTUBE_SCOPES),
            'access_type': 'offline',
            'prompt': 'consent',
        }
        auth_url = f"{YOUTUBE_AUTH_URL}?{urlencode(params)}"
        return Response({'auth_url': auth_url})


class YouTubeCallback(APIView):
    """Handle YouTube/Google OAuth callback"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'No authorization code provided'}, status=400)

        # Exchange code for tokens
        response = requests.post(
            YOUTUBE_TOKEN_URL,
            data={
                'client_id': YOUTUBE_CLIENT_ID,
                'client_secret': YOUTUBE_CLIENT_SECRET,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': YOUTUBE_REDIRECT_URI,
            },
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )

        if response.status_code != 200:
            return Response({'error': 'Failed to get access token', 'details': response.json()}, status=400)

        data = response.json()
        expires_at = timezone.now() + timedelta(seconds=data.get('expires_in', 3600))

        # Save or update token
        YouTubeToken.objects.update_or_create(
            user=request.user,
            defaults={
                'access_token': data['access_token'],
                'refresh_token': data.get('refresh_token', ''),
                'token_type': data.get('token_type', 'Bearer'),
                'expires_at': expires_at,
            }
        )

        # Create music preferences if not exists
        MusicPreferences.objects.get_or_create(user=request.user)

        return Response({'success': True, 'message': 'YouTube connected successfully'})


class YouTubeStatus(APIView):
    """Check if user is connected to YouTube"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            token = YouTubeToken.objects.get(user=request.user)
            
            # Auto-refresh if expired
            if token.is_expired() and token.refresh_token:
                response = requests.post(
                    YOUTUBE_TOKEN_URL,
                    data={
                        'client_id': YOUTUBE_CLIENT_ID,
                        'client_secret': YOUTUBE_CLIENT_SECRET,
                        'refresh_token': token.refresh_token,
                        'grant_type': 'refresh_token',
                    },
                    headers={'Content-Type': 'application/x-www-form-urlencoded'}
                )

                if response.status_code == 200:
                    data = response.json()
                    token.access_token = data['access_token']
                    token.expires_at = timezone.now() + timedelta(seconds=data.get('expires_in', 3600))
                    token.save()
                else:
                    return Response({'connected': False, 'error': 'Token expired and refresh failed'})

            return Response({
                'connected': True,
                'access_token': token.access_token,
                'expires_at': token.expires_at.isoformat(),
            })
        except YouTubeToken.DoesNotExist:
            return Response({'connected': False})


class YouTubeDisconnect(APIView):
    """Disconnect YouTube account"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        YouTubeToken.objects.filter(user=request.user).delete()
        return Response({'success': True, 'message': 'YouTube disconnected'})

