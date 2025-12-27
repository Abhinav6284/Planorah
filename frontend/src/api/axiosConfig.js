import axios from "axios";

const API_BASE_URL = 'http://142.93.214.77';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // Django backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
