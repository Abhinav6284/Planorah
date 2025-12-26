from django.urls import path
from . import views

urlpatterns = [
    # Spotify OAuth
    path('spotify/auth-url/', views.SpotifyAuthURL.as_view(), name='spotify-auth-url'),
    path('spotify/callback/', views.SpotifyCallback.as_view(), name='spotify-callback'),
    path('spotify/refresh/', views.SpotifyRefreshToken.as_view(), name='spotify-refresh'),
    path('spotify/status/', views.SpotifyStatus.as_view(), name='spotify-status'),
    path('spotify/disconnect/', views.SpotifyDisconnect.as_view(), name='spotify-disconnect'),
    
    # Spotify Playback
    path('spotify/now-playing/', views.SpotifyNowPlaying.as_view(), name='spotify-now-playing'),
    path('spotify/playback/', views.SpotifyPlaybackControl.as_view(), name='spotify-playback'),
    path('spotify/playlists/', views.SpotifyPlaylists.as_view(), name='spotify-playlists'),
    path('spotify/play-playlist/', views.SpotifyPlayPlaylist.as_view(), name='spotify-play-playlist'),
    
    # YouTube OAuth
    path('youtube/auth-url/', views.YouTubeAuthURL.as_view(), name='youtube-auth-url'),
    path('youtube/callback/', views.YouTubeCallback.as_view(), name='youtube-callback'),
    path('youtube/status/', views.YouTubeStatus.as_view(), name='youtube-status'),
    path('youtube/disconnect/', views.YouTubeDisconnect.as_view(), name='youtube-disconnect'),
    
    # Music Preferences
    path('preferences/', views.MusicPreferencesView.as_view(), name='music-preferences'),
]

