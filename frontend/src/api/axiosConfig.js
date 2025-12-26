import axios from "axios";

// Use the current hostname for network access, fallback to localhost
const API_HOST = window.location.hostname === 'localhost'
  ? '127.0.0.1'
  : window.location.hostname;

const axiosInstance = axios.create({
  baseURL: `http://${API_HOST}:8000`, // Django backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
