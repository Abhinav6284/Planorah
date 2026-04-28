import axios from 'axios';
import { useToastStore } from '../stores/toastStore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth header interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Get toast store to show notifications
    const toastStore = useToastStore();

    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('access_token');
      toastStore.addToast('Session expired. Please login again.', 'error');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - subscription required
      toastStore.addToast('Subscription required for this feature', 'error');
    } else if (error.response?.status === 400) {
      // Bad request - show error message from response
      const message = error.response.data?.detail || 'Invalid request';
      toastStore.addToast(message, 'error');
    } else if (error.response?.status === 500) {
      // Server error
      toastStore.addToast('Server error. Please try again.', 'error');
    } else if (error.message === 'Network Error') {
      // Network error
      toastStore.addToast('Network error. Please check your connection.', 'error');
    }

    return Promise.reject(error);
  }
);

export default api;
