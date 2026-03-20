import axios from "axios";
import { getToken, logout } from "../utils/tokenUtils";
import { toast } from "react-toastify";

const api = axios.create({
    baseURL: "http://localhost:1000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            logout();
            toast.error("Session expired. Please login again.");
        }
        return Promise.reject(error);
    }
);

export default api;
