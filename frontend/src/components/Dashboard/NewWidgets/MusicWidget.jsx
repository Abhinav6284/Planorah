import React, { useState, useEffect, useCallback } from 'react';
import { musicService } from '../../../api/musicService';

// YouTube playlist/video options for studying
const YOUTUBE_PLAYLISTS = [
    { id: 'jfKfPfyJRdk', name: 'Lofi Hip Hop', genre: 'lofi', icon: '🎧' },
    { id: 'lTRiuFIWV54', name: 'Jazz Vibes', genre: 'jazz', icon: '🎷' },
    { id: 'lP26UCnoH9s', name: 'Classical Piano', genre: 'classical', icon: '🎹' },
    { id: 'rUxyKA_-grg', name: 'Nature Sounds', genre: 'ambient', icon: '🌿' },
    { id: 'hHW1oY26kxQ', name: 'Synthwave', genre: 'electronic', icon: '🌃' },
    { id: '5qap5aO4i9A', name: 'Chill Beats', genre: 'chill', icon: '☕' },
];

const MusicWidget = () => {
    const [activeService, setActiveService] = useState('spotify');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [nowPlaying, setNowPlaying] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [showPlaylists, setShowPlaylists] = useState(false);

    // YouTube state
    const [currentYouTubeVideo, setCurrentYouTubeVideo] = useState(YOUTUBE_PLAYLISTS[0]);
    const [showYouTubePlaylists, setShowYouTubePlaylists] = useState(false);
    const [customYouTubeUrl, setCustomYouTubeUrl] = useState('');

    // Extract YouTube video ID from URL
    const extractYouTubeId = (url) => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/  // Direct video ID
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    const handleCustomUrl = () => {
        const videoId = extractYouTubeId(customYouTubeUrl.trim());
        if (videoId) {
            setCurrentYouTubeVideo({ id: videoId, name: 'Custom Video', genre: 'custom', icon: '🎵' });
            setShowYouTubePlaylists(false);
            setCustomYouTubeUrl('');
        }
    };

    const fetchPlaylists = async () => {
        try {
            const data = await musicService.getPlaylists();
            setPlaylists(data.playlists || []);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    const checkSpotifyStatus = useCallback(async () => {
        try {
            const status = await musicService.getSpotifyStatus();
            setIsConnected(status.connected);
            if (status.connected) {
                fetchPlaylists();
            }
        } catch (error) {
            console.error('Error checking Spotify status:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check Spotify connection status
    useEffect(() => {
        checkSpotifyStatus();
    }, [checkSpotifyStatus]);

    // Poll for now playing every 5 seconds when connected
    useEffect(() => {
        if (!isConnected || activeService !== 'spotify') return;

        const pollNowPlaying = () => {
            fetchNowPlaying();
        };

        pollNowPlaying();
        const interval = setInterval(pollNowPlaying, 5000);
        return () => clearInterval(interval);
    }, [isConnected, activeService]);

    const fetchNowPlaying = async () => {
        try {
            const data = await musicService.getNowPlaying();
            setNowPlaying(data);
        } catch (error) {
            console.error('Error fetching now playing:', error);
        }
    };

    const handleSpotifyLogin = () => {
        const authUrl = musicService.getSpotifyAuthUrl();
        window.location.href = authUrl;
    };

    const handlePlaybackControl = async (action) => {
        try {
            await musicService.playbackControl(action);
            setTimeout(fetchNowPlaying, 500);
        } catch (error) {
            console.error('Playback control error:', error);
        }
    };

    const handlePlayPlaylist = async (uri) => {
        try {
            await musicService.playPlaylist(uri);
            setShowPlaylists(false);
            setTimeout(fetchNowPlaying, 1000);
        } catch (error) {
            console.error('Error playing playlist:', error);
        }
    };

    const handleDisconnect = async () => {
        try {
            await musicService.disconnectSpotify();
            setIsConnected(false);
            setNowPlaying(null);
            setPlaylists([]);
        } catch (error) {
            console.error('Error disconnecting:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-[#1C1C1E] text-white rounded-[28px] p-5 h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#1C1C1E] text-white rounded-[28px] p-5 h-full flex flex-col relative overflow-hidden">
            {/* Service Toggle */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
                    <button
                        onClick={() => setActiveService('spotify')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeService === 'spotify'
                            ? 'bg-[#1DB954] text-black'
                            : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z" />
                        </svg>
                        Spotify
                    </button>
                    <button
                        onClick={() => setActiveService('youtube')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeService === 'youtube'
                            ? 'bg-red-600 text-white'
                            : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        YouTube
                    </button>
                </div>

                {activeService === 'spotify' && isConnected && (
                    <button
                        onClick={handleDisconnect}
                        className="text-xs text-white/40 hover:text-white/80 transition-colors"
                    >
                        Disconnect
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
                {activeService === 'spotify' ? (
                    isConnected ? (
                        /* Connected Spotify View */
                        <>
                            {showPlaylists ? (
                                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Your Playlists</span>
                                        <button
                                            onClick={() => setShowPlaylists(false)}
                                            className="text-xs text-white/50 hover:text-white"
                                        >
                                            ← Back
                                        </button>
                                    </div>
                                    {playlists.map((playlist) => (
                                        <button
                                            key={playlist.id}
                                            onClick={() => handlePlayPlaylist(playlist.uri)}
                                            className="w-full flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
                                        >
                                            {playlist.image ? (
                                                <img src={playlist.image} alt="" className="w-10 h-10 rounded-md object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center">🎵</div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium truncate">{playlist.name}</div>
                                                <div className="text-xs opacity-50">{playlist.tracks_count} tracks</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    {nowPlaying?.track ? (
                                        <>
                                            <img
                                                src={nowPlaying.track.image || '/default-album.png'}
                                                alt="Album"
                                                className="w-24 h-24 rounded-xl shadow-lg mb-4"
                                            />
                                            <div className="text-center max-w-full px-4">
                                                <div className="text-base font-semibold truncate">{nowPlaying.track.name}</div>
                                                <div className="text-sm opacity-60 truncate">{nowPlaying.track.artist}</div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-xl flex items-center justify-center">
                                                <span className="text-3xl">🎵</span>
                                            </div>
                                            <div className="text-sm opacity-60">Nothing playing</div>
                                            <button
                                                onClick={() => setShowPlaylists(true)}
                                                className="mt-3 text-xs px-4 py-2 bg-[#1DB954] text-black font-semibold rounded-full"
                                            >
                                                Browse Playlists
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!showPlaylists && (
                                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => setShowPlaylists(true)}
                                        className="w-8 h-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                                        title="Playlists"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handlePlaybackControl('previous')}
                                        className="w-10 h-10 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handlePlaybackControl(nowPlaying?.is_playing ? 'pause' : 'play')}
                                        className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                                    >
                                        {nowPlaying?.is_playing ? (
                                            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handlePlaybackControl('next')}
                                        className="w-10 h-10 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 mb-4 bg-[#1DB954]/20 rounded-full flex items-center justify-center">
                                <svg className="w-10 h-10 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Connect Spotify</h3>
                            <p className="text-sm text-white/50 text-center mb-4 px-4">
                                Listen to your favorite music while studying
                            </p>
                            <button
                                onClick={handleSpotifyLogin}
                                className="px-6 py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold rounded-full transition-colors"
                            >
                                Connect with Spotify
                            </button>
                        </div>
                    )
                ) : (
                    /* YouTube View with Playlist Selection */
                    <div className="flex-1 flex flex-col min-h-0">
                        {showYouTubePlaylists ? (
                            /* Playlist Selection */
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium">Choose Music</span>
                                    <button
                                        onClick={() => setShowYouTubePlaylists(false)}
                                        className="text-xs text-white/50 hover:text-white"
                                    >
                                        ← Back
                                    </button>
                                </div>

                                {/* Custom URL Input */}
                                <div className="bg-white/5 rounded-xl p-3 mb-3">
                                    <div className="text-xs text-white/60 mb-2">🎵 Play your own song</div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={customYouTubeUrl}
                                            onChange={(e) => setCustomYouTubeUrl(e.target.value)}
                                            placeholder="Paste YouTube URL..."
                                            className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:ring-1 focus:ring-red-500"
                                            onKeyDown={(e) => e.key === 'Enter' && handleCustomUrl()}
                                        />
                                        <button
                                            onClick={handleCustomUrl}
                                            disabled={!customYouTubeUrl.trim()}
                                            className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:bg-white/10 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            Play
                                        </button>
                                    </div>
                                </div>

                                <div className="text-xs text-white/40 mb-2">✨ Study themes</div>

                                {YOUTUBE_PLAYLISTS.map((playlist) => (
                                    <button
                                        key={playlist.id}
                                        onClick={() => {
                                            setCurrentYouTubeVideo(playlist);
                                            setShowYouTubePlaylists(false);
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${currentYouTubeVideo.id === playlist.id
                                                ? 'bg-red-600/20 border border-red-500/30'
                                                : 'bg-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                                            {playlist.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium">{playlist.name}</div>
                                            <div className="text-xs opacity-50 capitalize">{playlist.genre}</div>
                                        </div>
                                        {currentYouTubeVideo.id === playlist.id && (
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            /* Player View */
                            <>
                                <div className="flex-1 rounded-xl overflow-hidden bg-black/50 min-h-0">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${currentYouTubeVideo.id}?rel=0&autoplay=0`}
                                        width="100%"
                                        height="100%"
                                        title="YouTube Music"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="rounded-xl"
                                    />
                                </div>

                                {/* Current + Change Button */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{currentYouTubeVideo.icon}</span>
                                        <div>
                                            <div className="text-sm font-medium">{currentYouTubeVideo.name}</div>
                                            <div className="text-xs opacity-50 capitalize">{currentYouTubeVideo.genre}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowYouTubePlaylists(true)}
                                        className="text-xs px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-full transition-colors"
                                    >
                                        Change
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Decorative */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none ${activeService === 'spotify' ? 'bg-[#1DB954]/20' : 'bg-red-500/20'
                }`}></div>
        </div>
    );
};

export default MusicWidget;

