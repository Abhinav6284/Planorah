// simple auth helper: get token, clear tokens, and logout (call backend to blacklist refresh)
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://142.93.214.77";

export function getAccessToken() {
    return localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
}

export function getRefreshToken() {
    return localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");
}

export function clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
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
