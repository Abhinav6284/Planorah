import os
import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from django.conf import settings
from .models import GoogleCredential

# Scopes required for Google Calendar
SCOPES = ['https://www.googleapis.com/auth/calendar']

# Redirect URI (must match Google Console)
REDIRECT_URI = os.environ.get("GOOGLE_OAUTH_REDIRECT_URI", 'https://planorah.me/google-callback')


class GoogleCalendarService:
    def __init__(self, user):
        self.user = user

    def get_flow(self):
        """Create OAuth flow"""
        # In production, use client_secrets.json or env vars
        # For now, we assume env vars or a config file
        # We'll construct a client config dict for simplicity if env vars are present
        
        client_config = {
            "web": {
                "client_id": os.environ.get("GOOGLE_CLIENT_ID"),
                "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET"),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }
        
        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=REDIRECT_URI
        )
        return flow

    def get_authorization_url(self):
        """Generate auth URL"""
        flow = self.get_flow()
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        return authorization_url

    def exchange_code(self, code):
        """Exchange code for token and save credential"""
        flow = self.get_flow()
        flow.fetch_token(code=code)
        creds = flow.credentials

        # Save to DB
        GoogleCredential.objects.update_or_create(
            user=self.user,
            defaults={
                'access_token': creds.token,
                'refresh_token': creds.refresh_token,
                'token_uri': creds.token_uri,
                'client_id': creds.client_id,
                'client_secret': creds.client_secret,
                'scopes': ' '.join(creds.scopes),
                'expiry': creds.expiry
            }
        )
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
