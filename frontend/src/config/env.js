/**
 * Environment configuration.
 * Centralizes all environment-dependent values to avoid hardcoding secrets in components.
 * 
 * In CRA, environment variables must be prefixed with REACT_APP_.
 * Create a .env file in frontend/ root with these values.
 */
const env = {
  // OAuth
  GITHUB_CLIENT_ID: process.env.REACT_APP_GITHUB_CLIENT_ID || '',
  GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',

  // API
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || '/api/',

  // App
  APP_NAME: 'Planorah',
  APP_URL: process.env.REACT_APP_URL || window.location.origin,
};

export default env;
