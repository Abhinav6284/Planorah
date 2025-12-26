import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { musicService } from '../../api/musicService';

export default function YouTubeCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Connecting to YouTube...');
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
            musicService.youtubeCallback(code)
                .then(() => {
                    setStatus('Connected successfully! Redirecting...');
                    setTimeout(() => navigate('/dashboard'), 1500);
                })
                .catch((err) => {
                    console.error('YouTube callback error:', err);
                    setError('Failed to connect to YouTube');
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
                <div className="w-20 h-20 mx-auto mb-6 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
