import React, { useState } from 'react';

const SpotifyWidget = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    // This is a placeholder - real Spotify integration would require OAuth
    // For now, we'll show a beautiful embed-style widget
    return (
        <div className="bg-[#1C1C1E] text-white rounded-[28px] p-5 h-full flex flex-col relative overflow-hidden">
            {/* Spotify Branding */}
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                <span className="text-xs font-medium opacity-60">Spotify</span>
            </div>

            {/* Album Art & Info */}
            <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center shadow-lg">
                        <span className="text-2xl">🎵</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">Connect to Spotify</div>
                        <div className="text-xs opacity-50 truncate">Play your favorite music</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-[#1DB954] rounded-full"></div>
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] opacity-40">
                        <span>0:00</span>
                        <span>3:45</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mt-2">
                <button className="w-8 h-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                    </svg>
                </button>
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-lg"
                >
                    {isPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>
                <button className="w-8 h-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                </button>
            </div>

            {/* Connect Button */}
            <a
                href="https://open.spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-center text-xs py-2 px-4 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold rounded-full transition-colors"
            >
                Open Spotify
            </a>
        </div>
    );
};

export default SpotifyWidget;
