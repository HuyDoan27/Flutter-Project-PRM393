

import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// ✅ Gắn token cho tất cả request (React dùng localStorage)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
