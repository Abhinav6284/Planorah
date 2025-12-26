import api from './axios';

const SPOTIFY_CLIENT_ID = '244db40885bb40859d6ad806f50a1e24';
const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:3000/auth/spotify/callback';
const SPOTIFY_SCOPES = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'user-read-email',
    'user-read-private',
    'playlist-read-private',
    'playlist-read-collaborative',
].join(' ');

const YOUTUBE_CLIENT_ID = '305687655162-e2nqn2noa76q516mka9ri9j1gtgr8dtk.apps.googleusercontent.com';
const YOUTUBE_REDIRECT_URI = 'http://localhost:3000/auth/youtube/callback';
const YOUTUBE_SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

export const musicService = {
    // ==================== Spotify ====================
    getSpotifyAuthUrl: () => {
        const params = new URLSearchParams({
            client_id: SPOTIFY_CLIENT_ID,
            response_type: 'code',
            redirect_uri: SPOTIFY_REDIRECT_URI,
            scope: SPOTIFY_SCOPES,
            show_dialog: 'true',
        });
        return `https://accounts.spotify.com/authorize?${params.toString()}`;
    },

    spotifyCallback: async (code) => {
        const response = await api.post('/api/music/spotify/callback/', { code });
        return response.data;
    },

    getSpotifyStatus: async () => {
        const response = await api.get('/api/music/spotify/status/');
        return response.data;
    },

    disconnectSpotify: async () => {
        const response = await api.post('/api/music/spotify/disconnect/');
        return response.data;
    },

    getNowPlaying: async () => {
        const response = await api.get('/api/music/spotify/now-playing/');
        return response.data;
    },

    playbackControl: async (action) => {
        const response = await api.post('/api/music/spotify/playback/', { action });
        return response.data;
    },

    getPlaylists: async () => {
        const response = await api.get('/api/music/spotify/playlists/');
        return response.data;
    },

    playPlaylist: async (playlistUri) => {
        const response = await api.post('/api/music/spotify/play-playlist/', { playlist_uri: playlistUri });
        return response.data;
    },

    // ==================== YouTube ====================
    getYouTubeAuthUrl: () => {
        const params = new URLSearchParams({
            client_id: YOUTUBE_CLIENT_ID,
            response_type: 'code',
            redirect_uri: YOUTUBE_REDIRECT_URI,
            scope: YOUTUBE_SCOPES,
            access_type: 'offline',
            prompt: 'consent',
        });
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    },

    youtubeCallback: async (code) => {
        const response = await api.post('/api/music/youtube/callback/', { code });
        return response.data;
    },

    getYouTubeStatus: async () => {
        const response = await api.get('/api/music/youtube/status/');
        return response.data;
    },

    disconnectYouTube: async () => {
        const response = await api.post('/api/music/youtube/disconnect/');
        return response.data;
    },

    // ==================== Preferences ====================
    getPreferences: async () => {
        const response = await api.get('/api/music/preferences/');
        return response.data;
    },

    updatePreferences: async (preferences) => {
        const response = await api.put('/api/music/preferences/', preferences);
        return response.data;
    },
};

export default musicService;

