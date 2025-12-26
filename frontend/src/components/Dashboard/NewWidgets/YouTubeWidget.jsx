import React, { useState } from 'react';

const YouTubeWidget = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    // You can change this to any YouTube video ID (lofi study music, etc.)
    const videoId = "jfKfPfyJRdk"; // lofi hip hop radio - beats to relax/study to

    return (
        <div className="bg-[#1C1C1E] text-white rounded-[28px] p-5 h-full flex flex-col relative overflow-hidden">
            {/* YouTube Branding */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span className="text-sm font-medium">YouTube</span>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                    {isExpanded ? 'Minimize' : 'Expand'}
                </button>
            </div>

            {/* Video Player or Thumbnail */}
            <div className="flex-1 flex flex-col justify-center">
                {isExpanded ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
                            title="YouTube Music"
                            className="absolute inset-0 w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className="relative">
                        {/* Thumbnail Preview */}
                        <div
                            className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-red-600/20 to-pink-600/20 cursor-pointer group"
                            onClick={() => setIsExpanded(true)}
                        >
                            <img
                                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                alt="Video thumbnail"
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Video Info */}
                        <div className="mt-3">
                            <div className="text-sm font-medium truncate">lofi hip hop radio 📚</div>
                            <div className="text-xs opacity-50">beats to relax/study to</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Links */}
            <div className="flex gap-2 mt-4">
                <a
                    href="https://www.youtube.com/watch?v=jfKfPfyJRdk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center text-xs py-2 px-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors"
                >
                    Open in YouTube
                </a>
                <a
                    href="https://music.youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center text-xs py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
                >
                    YT Music
                </a>
            </div>

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        </div>
    );
};

export default YouTubeWidget;
