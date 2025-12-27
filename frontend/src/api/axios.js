import axios from 'axios';

// Auto-detect API URL based on environment
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'  // Local development
    : 'http://142.93.214.77'; // Production

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // console.log('🔐 Request:', config.method.toUpperCase(), config.url);
        // console.log('🔑 Token present:', token ? 'Yes' : 'No');
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
        // console.log('✅ Response:', response.status, response.config.url);
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

                // console.log('🔄 Attempting token refresh...');

                // Try to refresh the token
                const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
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
                // console.log('✅ Token refreshed successfully');
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
export { API_BASE_URL };
