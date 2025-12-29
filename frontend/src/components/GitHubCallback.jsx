import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from "../api/axios";

export default function GitHubCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const code = searchParams.get('code');

        if (!code) {
            setError('No authorization code received from GitHub');
            setLoading(false);
            return;
        }


        const handleGitHubLogin = async () => {
            try {
                const redirectUri = window.location.origin + '/auth/github/callback';
                const mode = searchParams.get('state') || 'login'; // Get mode from state parameter
                const res = await axios.post(`${API_BASE_URL}/api/users/github/login/`, {
                    code: code,
                    redirect_uri: redirectUri,
                    mode: mode
                });

                // Check for 2FA
                if (res.data.two_factor_required) {
                    navigate("/verify-otp", {
                        state: {
                            email: res.data.email,
                            isLogin: true
                        }
                    });
                    return;
                }

                // Store tokens
                localStorage.setItem('access_token', res.data.access);
                localStorage.setItem('refresh_token', res.data.refresh);

                // Redirect based on onboarding status
                if (res.data.onboarding_complete) {
                    navigate('/dashboard');
                } else {
                    navigate('/onboarding');
                }
            } catch (err) {
                console.error("GitHub Login Error:", err);
                const serverMsg = err.response?.data?.error || err.response?.data?.message;
                setError(serverMsg || 'GitHub login failed. Please try again.');
                setLoading(false);
            }
        };

        handleGitHubLogin();
    }, [searchParams, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white">Signing in with GitHub...</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Please wait while we complete your login.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                <div className="text-5xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login Failed</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
                <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
}
