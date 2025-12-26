// src/api.js
import axios from "axios";

// ✅ Create an Axios instance
const api = axios.create({
    baseURL: "/api/", // Proxy handles the domain
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ Add a request interceptor to include JWT token (if available)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
        console.log("API Request:", config.url, "Token exists:", !!token);
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
