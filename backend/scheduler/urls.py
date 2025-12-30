from django.urls import path
from . import views

urlpatterns = [
    path('events/', views.get_events, name='get_events'),
    path('events/create/', views.create_event, name='create_event'),
    path('events/delete-all/', views.delete_all_events, name='delete_all_events'),
    
    # Google Calendar
    path('google/auth-url/', views.google_auth_url, name='google_auth_url'),
    path('google/callback/', views.google_callback, name='google_callback'),
    path('google/sync/', views.sync_calendar, name='sync_calendar'),
    
    # Spotify
    path('spotify/auth-url/', views.spotify_auth_url, name='spotify_auth_url'),
    path('spotify/callback/', views.spotify_callback, name='spotify_callback'),
    path('spotify/current/', views.get_current_song, name='get_current_song'),
    path('spotify/control/', views.spotify_control, name='spotify_control'),
    path('spotify/queue/', views.get_queue, name='spotify_queue'),
]
