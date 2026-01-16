import axios from 'axios';
import { isSessionExpired, clearTokens } from '../utils/auth';

// Create axios instance using proxy in package.json
const axiosInstance = axios.create({
    baseURL: '/api/', // Proxy to backend handles the full URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token and check session expiry
axiosInstance.interceptors.request.use(
    (config) => {
        // Check if session has expired (15 days for Remember Me)
        if (isSessionExpired()) {
            clearTokens();
            // Only redirect if not already on login/register pages
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                alert('Your session has expired. Please login again.');
                window.location.href = '/login';
            }
            return Promise.reject(new Error('Session expired'));
        }

        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        console.error('❌ Response error:', error.response?.status, error.config?.url);

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

                if (!refreshToken) {
                    console.error('❌ No refresh token available');
                    throw new Error('No refresh token available');
                }

                // Try to refresh the token
                const response = await axios.post('/api/token/refresh/', {
                    refresh: refreshToken
                });

                const { access } = response.data;

                // Update tokens
                if (localStorage.getItem('access_token')) {
                    localStorage.setItem('access_token', access);
                } else {
                    sessionStorage.setItem('access_token', access);
                }

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                console.error('❌ Token refresh failed:', refreshError);

                // Clear tokens and redirect to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('refresh_token');

                // Redirect to login page
                alert('Session expired. Please login again.');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
