const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);
const PRODUCTION_API_FALLBACK = 'https://api.planorah.me';
const LOCAL_API_FALLBACK = 'http://127.0.0.1:8000';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const strictEnvRaw = (process.env.REACT_APP_STRICT_ENV || '').trim().toLowerCase();
const strictEnv = strictEnvRaw ? strictEnvRaw === 'true' : isProduction;

const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
const isLocalFrontend = LOCAL_HOSTNAMES.has(currentHostname);

const trimEnvValue = (value) => (typeof value === 'string' ? value.trim() : '');

const rawApiBaseInput = trimEnvValue(process.env.REACT_APP_API_BASE_URL);
const apiFallbackOrigin = isLocalFrontend ? LOCAL_API_FALLBACK : PRODUCTION_API_FALLBACK;
const selectedApiInput = rawApiBaseInput || apiFallbackOrigin;

const normalizeApiConfig = (input) => {
  const trimmedInput = trimEnvValue(input).replace(/\/+$/, '');
  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const isPrimaryWebHost = hostname === 'planorah.me' || hostname === 'www.planorah.me';

  if (trimmedInput === '/api') {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    // Production frontend host should call the API domain directly.
    // This avoids relying on frontend-domain /api proxies that can reject POST requests.
    if (isPrimaryWebHost) {
      return {
        apiOrigin: PRODUCTION_API_FALLBACK,
        apiBaseUrl: `${PRODUCTION_API_FALLBACK}/api/`,
        usesRelativePath: false,
      };
    }

    return {
      apiOrigin: origin,
      apiBaseUrl: '/api/',
      usesRelativePath: true,
    };
  }

  if (!/^https?:\/\//i.test(trimmedInput)) {
    throw new Error(
      `[ENV] Invalid REACT_APP_API_BASE_URL "${input}". Use an absolute URL (e.g. https://api.planorah.me) or /api.`
    );
  }

  const apiOrigin = trimmedInput.endsWith('/api')
    ? trimmedInput.slice(0, -4)
    : trimmedInput;

  // Guard against misconfigured production envs that point API calls
  // to the frontend host (planorah.me/www.planorah.me) instead of api.planorah.me.
  if (isPrimaryWebHost && /^(https?:\/\/)?(www\.)?planorah\.me$/i.test(apiOrigin)) {
    return {
      apiOrigin: PRODUCTION_API_FALLBACK,
      apiBaseUrl: `${PRODUCTION_API_FALLBACK}/api/`,
      usesRelativePath: false,
    };
  }

  return {
    apiOrigin,
    apiBaseUrl: `${apiOrigin}/api/`,
    usesRelativePath: false,
  };
};

const { apiOrigin, apiBaseUrl, usesRelativePath } = normalizeApiConfig(selectedApiInput);

const rawGithubClientId = trimEnvValue(process.env.REACT_APP_GITHUB_CLIENT_ID);
const rawGoogleClientId = trimEnvValue(process.env.REACT_APP_GOOGLE_CLIENT_ID);

const requiredEnvErrors = [];

if (strictEnv && !rawApiBaseInput) {
  requiredEnvErrors.push('REACT_APP_API_BASE_URL');
}
if (strictEnv && !rawGithubClientId) {
  requiredEnvErrors.push('REACT_APP_GITHUB_CLIENT_ID');
}
if (strictEnv && !rawGoogleClientId) {
  requiredEnvErrors.push('REACT_APP_GOOGLE_CLIENT_ID');
}

if (isProduction) {
  if (usesRelativePath) {
    requiredEnvErrors.push('REACT_APP_API_BASE_URL must be absolute in production');
  }
  if (!apiOrigin.startsWith('https://')) {
    requiredEnvErrors.push('REACT_APP_API_BASE_URL must use HTTPS in production');
  }
  if (/localhost|127\.0\.0\.1/i.test(apiOrigin)) {
    requiredEnvErrors.push('REACT_APP_API_BASE_URL cannot point to localhost in production');
  }
}

if (requiredEnvErrors.length > 0) {
  throw new Error(`[ENV] Invalid environment configuration: ${requiredEnvErrors.join(', ')}`);
}

const env = Object.freeze({
  NODE_ENV: nodeEnv,
  IS_PRODUCTION: isProduction,
  STRICT_ENV: strictEnv,

  GITHUB_CLIENT_ID: rawGithubClientId,
  GOOGLE_CLIENT_ID: rawGoogleClientId,

  API_ORIGIN: apiOrigin,
  API_BASE_URL: apiBaseUrl,
  USE_RELATIVE_API_PATH: usesRelativePath,

  APP_NAME: 'Planorah',
  APP_URL: trimEnvValue(process.env.REACT_APP_URL) || (typeof window !== 'undefined' ? window.location.origin : ''),
  PORTFOLIO_URL: trimEnvValue(process.env.REACT_APP_PORTFOLIO_URL) || 'https://portfolio.planorah.me',
});

export default env;
