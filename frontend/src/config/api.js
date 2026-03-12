// API configuration shared across axios clients.
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);
const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isLocalFrontend = LOCAL_HOSTNAMES.has(currentHostname);

const DEFAULT_API_ORIGIN = isLocalFrontend
    ? 'http://127.0.0.1:8000'
    : 'https://api.planorah.me';

const rawApiBaseUrl = (process.env.REACT_APP_API_BASE_URL || DEFAULT_API_ORIGIN).trim();
const trimmedApiBaseUrl = rawApiBaseUrl.replace(/\/+$/, '');
const useRelativeApiPath = trimmedApiBaseUrl === '/api';

const resolvedApiOrigin = useRelativeApiPath
    ? (typeof window !== 'undefined' ? window.location.origin : '')
    : (trimmedApiBaseUrl.endsWith('/api')
        ? trimmedApiBaseUrl.slice(0, -4)
        : trimmedApiBaseUrl);

export const API_ORIGIN = resolvedApiOrigin;
export const API_BASE_URL = useRelativeApiPath ? '/api/' : `${API_ORIGIN}/api/`;
