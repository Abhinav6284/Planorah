import os
import requests
import base64
from django.conf import settings
from urllib.parse import urlencode

SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1"

CLIENT_ID = os.environ.get("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.environ.get("SPOTIFY_CLIENT_SECRET")
# Use the one from settings or env, fallback to production for now
REDIRECT_URI = os.environ.get("SPOTIFY_REDIRECT_URI", "https://planorah.me/auth/spotify/callback")

def get_auth_url(state=None):
    scope = "user-read-playback-state user-modify-playback-state user-read-currently-playing"
    params = {
        "client_id": CLIENT_ID,
        "response_type": "code",
        "redirect_uri": REDIRECT_URI,
        "scope": scope,
    }
    if state:
        params["state"] = state
    return f"{SPOTIFY_AUTH_URL}?{urlencode(params)}"

def get_token(code):
    auth_header = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    headers = {
        "Authorization": f"Basic {auth_header}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI
    }
    response = requests.post(SPOTIFY_TOKEN_URL, headers=headers, data=data)
    return response.json()

def refresh_token(refresh_token):
    auth_header = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    headers = {
        "Authorization": f"Basic {auth_header}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token
    }
    response = requests.post(SPOTIFY_TOKEN_URL, headers=headers, data=data)
    return response.json()

def get_current_song(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{SPOTIFY_API_BASE_URL}/me/player/currently-playing", headers=headers)
    
    if response.status_code == 204:
        return None
    
    return response.json()

def play(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.put(f"{SPOTIFY_API_BASE_URL}/me/player/play", headers=headers)
    response.raise_for_status()

def pause(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.put(f"{SPOTIFY_API_BASE_URL}/me/player/pause", headers=headers)
    response.raise_for_status()

def next_track(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(f"{SPOTIFY_API_BASE_URL}/me/player/next", headers=headers)
    response.raise_for_status()

def previous_track(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(f"{SPOTIFY_API_BASE_URL}/me/player/previous", headers=headers)
    response.raise_for_status()

def get_queue(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{SPOTIFY_API_BASE_URL}/me/player/queue", headers=headers)
    response.raise_for_status()
    return response.json()
