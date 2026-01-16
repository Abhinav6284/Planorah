// API Configuration - Separate file to avoid circular dependencies
export const API_BASE_URL =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:8000'  // Local development
        : 'https://planorah.me'; // Production
