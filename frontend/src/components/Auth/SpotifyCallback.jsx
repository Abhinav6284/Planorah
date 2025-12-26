import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { musicService } from '../../api/musicService';

export default function SpotifyCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Connecting to Spotify...');
    const [error, setError] = useState(null);

    useEffect(() => {
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setError('Authorization was denied');
            setTimeout(() => navigate('/dashboard'), 3000);
            return;
        }

        if (code) {
            musicService.spotifyCallback(code)
                .then(() => {
                    setStatus('Connected successfully! Redirecting...');
                    setTimeout(() => navigate('/dashboard'), 1500);
                })
                .catch((err) => {
                    console.error('Spotify callback error:', err);
                    setError('Failed to connect to Spotify');
                    setTimeout(() => navigate('/dashboard'), 3000);
                });
        } else {
            setError('No authorization code received');
            setTimeout(() => navigate('/dashboard'), 3000);
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-[#1DB954] rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                </div>

                {error ? (
                    <>
                        <h2 className="text-xl font-semibold text-red-400 mb-2">Connection Failed</h2>
                        <p className="text-gray-400">{error}</p>
                        <p className="text-gray-500 text-sm mt-2">Redirecting to dashboard...</p>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold text-white mb-2">{status}</h2>
                        <div className="flex justify-center mt-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DB954]"></div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
