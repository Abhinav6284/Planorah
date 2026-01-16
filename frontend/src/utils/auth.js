// simple auth helper: get token, clear tokens, and logout (call backend to blacklist refresh)
import axios from "axios";

const API_BASE = '/api/'; // Using proxy in package.json

// Maximum session duration for "Remember Me" - 15 days in milliseconds
export const MAX_SESSION_DAYS = 15;
const MAX_SESSION_MS = MAX_SESSION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Store tokens based on rememberMe preference
 * @param {string} access - Access token
 * @param {string} refresh - Refresh token
 * @param {boolean} rememberMe - Whether to persist tokens in localStorage with timestamp
 */
export function setTokens(access, refresh, rememberMe = false) {
    // Clear any existing tokens first
    clearTokens();

    if (rememberMe) {
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        localStorage.setItem("login_timestamp", Date.now().toString());
    } else {
        sessionStorage.setItem("access_token", access);
        sessionStorage.setItem("refresh_token", refresh);
    }
}

/**
 * Set the Remember Me preference (used before OAuth redirects)
 */
export function setRememberMePreference(rememberMe) {
    sessionStorage.setItem("remember_me_preference", rememberMe ? "true" : "false");
}

/**
 * Get the Remember Me preference
 */
export function getRememberMePreference() {
    return sessionStorage.getItem("remember_me_preference") === "true";
}

/**
 * Clear the Remember Me preference
 */
export function clearRememberMePreference() {
    sessionStorage.removeItem("remember_me_preference");
}

/**
 * Get login timestamp (only exists for Remember Me sessions)
 */
export function getLoginTimestamp() {
    const timestamp = localStorage.getItem("login_timestamp");
    return timestamp ? parseInt(timestamp, 10) : null;
}

/**
 * Check if the current session has expired (for Remember Me sessions)
 * Returns true if session is expired or invalid
 */
export function isSessionExpired() {
    // Only check expiry for localStorage sessions (Remember Me)
    if (!localStorage.getItem("access_token")) {
        return false; // sessionStorage sessions don't have a max duration
    }

    const loginTimestamp = getLoginTimestamp();
    if (!loginTimestamp) {
        // No timestamp but tokens exist - legacy session, consider valid
        return false;
    }

    const elapsed = Date.now() - loginTimestamp;
    return elapsed > MAX_SESSION_MS;
}

export function getAccessToken() {
    return localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
}

export function getRefreshToken() {
    return localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");
}

export function clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("login_timestamp");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("remember_me_preference");
}

export async function logoutBackend() {
    // call backend to blacklist refresh token if available
    const refresh = getRefreshToken();
    if (!refresh) return null;

    try {
        const res = await axios.post(`${API_BASE}/api/users/logout/`, { refresh }, {
            headers: {
                "Content-Type": "application/json",
                // no Authorization required for logout blacklisting, token is in body
            }
        });
        return res.data;
    } catch (err) {
        // ignore network errors - still clear tokens on client
        return { error: err?.response?.data || err.message };
    }
}
