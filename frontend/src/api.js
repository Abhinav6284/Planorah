// src/api.js
import axios from "axios";
import { API_BASE_URL } from "./config/api";

const isAbsoluteUrl = (url = "") => /^https?:\/\//i.test(url);

const normalizeApiPathForBase = (url = "") => {
    if (!url || isAbsoluteUrl(url)) {
        return url;
    }

    const withLeadingSlash = url.startsWith("/") ? url : `/${url}`;
    if (withLeadingSlash === "/api") {
        return "";
    }

    if (withLeadingSlash.startsWith("/api/")) {
        return withLeadingSlash.slice(5);
    }
    return withLeadingSlash.slice(1);
};

// ✅ Create an Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ Add a request interceptor to include JWT token (if available)
api.interceptors.request.use(
    (config) => {
        config.url = normalizeApiPathForBase(config.url);

        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        if (process.env.REACT_APP_API_DEBUG === "true") {
            console.log("API Request:", config.url, "Token exists:", !!token);
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Handle 401 Unauthorized (Token Expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("401 Unauthorized - Redirecting to login");
            localStorage.removeItem("access_token");
            sessionStorage.removeItem("access_token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// ✅ (Optional) Handle token refresh when expired
// You can add a response interceptor later if needed

export default api;
