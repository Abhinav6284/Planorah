import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { schedulerService } from '../../api/schedulerService';

export default function SpotifyWidget() {
    const [currentSong, setCurrentSong] = useState(null);
    const [queue, setQueue] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const results = await Promise.allSettled([
                schedulerService.getCurrentSong(),
                schedulerService.getQueue()
            ]);

            const songResult = results[0];
            const queueResult = results[1];

            if (songResult.status === 'fulfilled') {
                setCurrentSong(songResult.value);
                setIsConnected(true);
                setErrorMsg("");
            } else if (songResult.reason?.response?.status === 404) {
                setIsConnected(false);
            }

            if (queueResult.status === 'fulfilled') {
                setQueue(queueResult.value);
            } else {
                console.warn("Queue fetch failed:", queueResult.reason);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            const { url } = await schedulerService.getSpotifyAuthUrl();
            window.location.href = url;
        } catch (error) {
            console.error("Failed to get auth URL", error);
        }
    };

    const handleControl = async (action) => {
        try {
            await schedulerService.controlSpotify(action);
            setTimeout(fetchData, 500);
            setErrorMsg("");
        } catch (error) {
            console.error(`Failed to ${action}`, error);
            if (error.response?.data?.spotify_error?.message) {
                setErrorMsg(error.response.data.spotify_error.message);
            } else if (error.response?.status === 404) {
                setErrorMsg("No active device found. Open Spotify!");
            } else if (error.response?.status === 403) {
                setErrorMsg("Premium required for controls.");
            } else {
                setErrorMsg("Failed to control playback.");
            }
            setTimeout(() => setErrorMsg(""), 3000);
        }
    };

    if (loading) return <div className="h-full w-full bg-gray-100 rounded-3xl animate-pulse" />;

    if (!isConnected) {
        return (
            <div className="h-full w-full bg-[#1DB954] rounded-3xl p-6 flex flex-col items-center justify-center text-white shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="z-10 text-center cursor-pointer"
                    onClick={handleConnect}
                >
                    <svg className="w-16 h-16 mb-4 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.439-1.38 9.839-.72 13.619 1.56.42.18.6.72.122 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                    <h3 className="font-bold text-xl">Connect Spotify</h3>
                    <p className="text-sm opacity-90 mt-2">Control your focus music</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-black rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col">
            {/* Background Art Blur */}
            {currentSong?.item?.album?.images?.[0]?.url && (
                <div
                    className="absolute inset-0 opacity-30 blur-2xl scale-150 transition-all duration-1000"
                    style={{ backgroundImage: `url(${currentSong.item.album.images[0].url})`, backgroundSize: 'cover' }}
                />
            )}

            <div className="relative z-10 flex flex-col h-full justify-between">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 text-[#1DB954] font-bold text-xs uppercase tracking-widest">
                        <span className="w-2 h-2 bg-[#1DB954] rounded-full animate-pulse" />
                        Now Playing
                    </div>
                    <svg className="w-6 h-6 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.439-1.38 9.839-.72 13.619 1.56.42.18.6.72.122 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
                </div>

                {/* Main Content */}
                <div className="flex gap-4 items-center mt-4">
                    {currentSong?.item?.album?.images?.[0]?.url ? (
                        <img
                            src={currentSong.item.album.images[0].url}
                            alt="Album Art"
                            className="w-20 h-20 rounded-xl shadow-lg"
                        />
                    ) : (
                        <div className="w-20 h-20 bg-gray-800 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">🎵</span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg truncate">{currentSong?.item?.name || "Not Playing"}</h4>
                        <p className="text-gray-400 text-sm truncate">
                            {currentSong?.item?.artists?.map(a => a.name).join(', ') || "Spotify"}
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {errorMsg && (
                    <div className="mt-2 text-xs text-red-400 bg-red-900/20 p-2 rounded-lg text-center animate-pulse">
                        {errorMsg}
                    </div>
                )}

                {/* Controls */}
                <div className="flex items-center justify-between mt-4">
                    <button onClick={() => handleControl('prev')} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                    </button>

                    <button
                        onClick={() => handleControl(currentSong?.is_playing ? 'pause' : 'play')}
                        className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
                    >
                        {currentSong?.is_playing ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        ) : (
                            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                    </button>

                    <button onClick={() => handleControl('next')} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                    </button>
                </div>

                {/* Queue (Next Up) */}
                {queue?.queue?.[0] && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Up Next</div>
                        <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                            {queue.queue[0].album?.images?.[0]?.url && (
                                <img src={queue.queue[0].album.images[0].url} className="w-8 h-8 rounded" alt="Next" />
                            )}
                            <div className="min-w-0">
                                <div className="text-sm font-medium truncate">{queue.queue[0].name}</div>
                                <div className="text-xs text-gray-400 truncate">{queue.queue[0].artists?.[0]?.name}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
