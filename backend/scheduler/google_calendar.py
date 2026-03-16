import os
import datetime
import base64
import hashlib
import secrets
import time
import logging
from django.core import signing
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from django.conf import settings
from .models import GoogleCredential

logger = logging.getLogger(__name__)

# Scopes required for Google Calendar
SCOPES = ['https://www.googleapis.com/auth/calendar']

# Redirect URI (must match Google Console)
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://planorah.me").rstrip("/")
REDIRECT_URI = (
    os.environ.get("GOOGLE_CALENDAR_REDIRECT_URI")
    or f"{FRONTEND_URL}/scheduler"
)
PKCE_STATE_SALT = "scheduler.google.pkce"
PKCE_STATE_MAX_AGE = 600


class GoogleCalendarService:
    def __init__(self, user):
        self.user = user

    def get_flow(self, redirect_uri=None):
        """Create OAuth flow"""
        client_id = (
            os.environ.get("GOOGLE_CALENDAR_CLIENT_ID")
            or os.environ.get("GOOGLE_CLIENT_ID")
            or os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
        )
        client_secret = (
            os.environ.get("GOOGLE_CALENDAR_CLIENT_SECRET")
            or os.environ.get("GOOGLE_CLIENT_SECRET")
            or os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")
        )

        if not client_id or not client_secret:
            logger.error(
                "Google Calendar OAuth credentials are missing. "
                "Checked: GOOGLE_CALENDAR_CLIENT_ID/SECRET, GOOGLE_CLIENT_ID/SECRET, GOOGLE_OAUTH_CLIENT_ID/SECRET."
            )
            raise ValueError(
                "Google Calendar OAuth credentials are missing. Set GOOGLE_CALENDAR_CLIENT_ID/SECRET or GOOGLE_OAUTH_CLIENT_ID/SECRET environment variables."
            )

        effective_redirect_uri = (redirect_uri or REDIRECT_URI or "").strip()
        if not effective_redirect_uri:
            logger.error("Google Calendar redirect URI is missing. Set GOOGLE_CALENDAR_REDIRECT_URI or FRONTEND_URL.")
            raise ValueError("Google Calendar redirect URI is missing.")

        if "/api/users/google/callback" in effective_redirect_uri:
            logger.error(
                "GOOGLE_CALENDAR_REDIRECT_URI is misconfigured: %s — must be the frontend /scheduler route.",
                effective_redirect_uri,
            )
            raise ValueError(
                "GOOGLE_CALENDAR_REDIRECT_URI is misconfigured for the scheduler flow. Use the frontend callback route, e.g. https://planorah.me/scheduler."
            )

        logger.debug("Building Google OAuth flow with redirect_uri=%s", effective_redirect_uri)

        client_config = {
            "web": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }

        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=effective_redirect_uri
        )
        return flow

    def _build_pkce_state(self):
        code_verifier = secrets.token_urlsafe(64)
        digest = hashlib.sha256(code_verifier.encode("utf-8")).digest()
        code_challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("utf-8")
        state_payload = {
            "u": self.user.id,
            "cv": code_verifier,
            "ts": int(time.time()),
        }
        state = signing.dumps(state_payload, salt=PKCE_STATE_SALT)
        return state, code_verifier, code_challenge

    def get_authorization_url(self, redirect_uri=None):
        """Generate auth URL"""
        flow = self.get_flow(redirect_uri=redirect_uri)
        state, _, code_challenge = self._build_pkce_state()
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
            code_challenge=code_challenge,
            code_challenge_method='S256',
            state=state,
        )
        return authorization_url

    def exchange_code(self, code, redirect_uri=None, code_verifier=None):
        """Exchange code for token and save credential"""
        logger.debug(
            "Exchanging OAuth code for user=%s redirect_uri=%s has_code_verifier=%s",
            self.user.id, redirect_uri, bool(code_verifier),
        )
        flow = self.get_flow(redirect_uri=redirect_uri)
        if code_verifier:
            flow.fetch_token(code=code, code_verifier=code_verifier)
        else:
            flow.fetch_token(code=code)
        creds = flow.credentials

        existing_credential = GoogleCredential.objects.filter(user=self.user).first()
        refresh_token = creds.refresh_token
        if not refresh_token and existing_credential:
            # Google may omit refresh_token on repeat consent; keep existing one.
            logger.debug("No new refresh_token from Google; retaining existing token for user=%s", self.user.id)
            refresh_token = existing_credential.refresh_token
        elif not refresh_token:
            logger.warning("No refresh_token received from Google and no existing credential to fall back on: user=%s", self.user.id)

        # Save to DB
        GoogleCredential.objects.update_or_create(
            user=self.user,
            defaults={
                'access_token': creds.token,
                'refresh_token': refresh_token,
                'token_uri': creds.token_uri,
                'client_id': creds.client_id,
                'client_secret': creds.client_secret,
                'scopes': ' '.join(creds.scopes or SCOPES),
                'expiry': creds.expiry
            }
        )
        logger.info("Google OAuth credentials saved for user=%s", self.user.id)
        return True

    def get_service(self):
        """Get authenticated Calendar service"""
        try:
            cred_model = GoogleCredential.objects.get(user=self.user)
            creds = Credentials(
                token=cred_model.access_token,
                refresh_token=cred_model.refresh_token,
                token_uri=cred_model.token_uri,
                client_id=cred_model.client_id,
                client_secret=cred_model.client_secret,
                scopes=cred_model.scopes.split(),
                expiry=cred_model.expiry
            )
            return build('calendar', 'v3', credentials=creds)
        except GoogleCredential.DoesNotExist:
            return None

    def list_events(self):
        """List upcoming events"""
        service = self.get_service()
        if not service:
            return []

        now = datetime.datetime.utcnow().isoformat() + 'Z'
        events_result = service.events().list(
            calendarId='primary', timeMin=now,
            maxResults=10, singleEvents=True,
            orderBy='startTime'
        ).execute()
        return events_result.get('items', [])

    def create_event(self, title, start_time, end_time, description=''):
        """Create a new event"""
        service = self.get_service()
        if not service:
            return None

        event = {
            'summary': title,
            'description': description,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'UTC',
            },
        }

        event = service.events().insert(calendarId='primary', body=event).execute()
        return event
