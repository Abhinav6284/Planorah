import axios from 'axios';
import env from '../config/env';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isSessionExpired,
} from '../utils/auth';

const AUTH_FREE_ENDPOINTS = new Set([
  'users/login/',
  'users/register/',
  'users/google/login/',
  'users/github/login/',
  'users/verify-otp/',
  'users/verify-social-otp/',
  'users/resend-otp/',
  'users/request-password-reset/',
  'users/verify-reset-otp/',
  'users/reset-password/',
  'support/tickets/',
  'token/refresh/',
]);

const isAbsoluteUrl = (url = '') => /^https?:\/\//i.test(url);

const normalizeApiPath = (url = '') => {
  if (!url || isAbsoluteUrl(url)) {
    return url;
  }

  const withLeadingSlash = url.startsWith('/') ? url : `/${url}`;
  if (withLeadingSlash === '/api') {
    return '';
  }

  if (withLeadingSlash.startsWith('/api/')) {
    return withLeadingSlash.slice(5);
  }

  return withLeadingSlash.slice(1);
};

const isAuthFreeEndpoint = (url = '') => {
  const normalizedUrl = normalizeApiPath(url);
  if (!normalizedUrl || isAbsoluteUrl(normalizedUrl)) {
    return false;
  }
  return AUTH_FREE_ENDPOINTS.has(normalizedUrl);
};

const shouldSkipAuthGuards = (config = {}) => config.skipAuthRefresh === true || isAuthFreeEndpoint(config.url);

const deriveNetworkFallbackBaseUrl = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  const configuredBaseUrl = String(env.API_BASE_URL || '').toLowerCase();
  const hostname = window.location.hostname.toLowerCase();
  const isPrimaryWebHost = hostname === 'planorah.me' || hostname === 'www.planorah.me';

  if (isPrimaryWebHost && configuredBaseUrl.includes('api.planorah.me')) {
    return `${window.location.origin}/api/`;
  }

  return '';
};

const NETWORK_FALLBACK_BASE_URL = deriveNetworkFallbackBaseUrl();

const isSafeFallbackMethod = (method = '') => {
  const normalized = String(method || '').toLowerCase();
  return normalized === '' || normalized === 'get' || normalized === 'head';
};

const handleSessionExpiry = () => {
  clearTokens();

  if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
    window.dispatchEvent(new CustomEvent('session-expired', {
      detail: { message: 'Your session has expired. Please login again.' },
    }));
    window.location.href = '/login';
  }
};

const client = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshTokenRequest = null;

const refreshAccessToken = async () => {
  if (!refreshTokenRequest) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    refreshTokenRequest = client.post(
      'token/refresh/',
      { refresh: refreshToken },
      { timeout: 20000, skipAuthRefresh: true }
    )
      .then((response) => {
        const nextAccessToken = response.data?.access;
        if (!nextAccessToken) {
          throw new Error('Token refresh response did not include an access token');
        }

        if (localStorage.getItem('access_token')) {
          localStorage.setItem('access_token', nextAccessToken);
        } else {
          sessionStorage.setItem('access_token', nextAccessToken);
        }

        return nextAccessToken;
      })
      .finally(() => {
        refreshTokenRequest = null;
      });
  }

  return refreshTokenRequest;
};

client.interceptors.request.use(
  (config) => {
    const requestConfig = { ...config };
    requestConfig.url = normalizeApiPath(requestConfig.url);

    if (isSessionExpired()) {
      handleSessionExpiry();
      return Promise.reject(new Error('Session expired'));
    }

    const token = getAccessToken();
    if (token && !shouldSkipAuthGuards(requestConfig)) {
      requestConfig.headers = requestConfig.headers || {};
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    return requestConfig;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !error.response
      && originalRequest
      && NETWORK_FALLBACK_BASE_URL
      && originalRequest._networkFallbackTried !== true
      && isSafeFallbackMethod(originalRequest.method)
    ) {
      originalRequest._networkFallbackTried = true;
      originalRequest.baseURL = NETWORK_FALLBACK_BASE_URL;
      return client(originalRequest);
    }

    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const isAuthError = status === 401;
    const alreadyRetried = originalRequest._retry === true;

    if (!isAuthError || alreadyRetried || shouldSkipAuthGuards(originalRequest)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const nextAccessToken = await refreshAccessToken();
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return client(originalRequest);
    } catch (refreshError) {
      handleSessionExpiry();
      return Promise.reject(refreshError);
    }
  }
);

export default client;
