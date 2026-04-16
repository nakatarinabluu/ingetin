import axios from 'axios';
import { setupMocks } from './mocks';

/**
 * 🛠️ INGETIN API CLIENT
 * Controlled via .env (VITE_USE_MOCK=true/false)
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'; 

const apiClient = axios.create({
    // FIX: Ensure baseURL is clean and doesn't cause /api/api issues
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, ''),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.dispatchEvent(new CustomEvent('auth-required'));
        }
        return Promise.reject(error);
    }
);

if (USE_MOCK) {
    setupMocks(apiClient);
}

export default apiClient;
