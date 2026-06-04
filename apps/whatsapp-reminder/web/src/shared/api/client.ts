import axios from 'axios';

/**
 * 🛠️ INGETIN API CLIENT
 * Controlled via .env (VITE_USE_MOCK=true/false)
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'; 

if (!import.meta.env.VITE_API_URL && !USE_MOCK) {
    console.warn("⚠️ VITE_API_URL is not set. API calls might fail in production.");
}

// In-memory token storage (more secure than localStorage against XSS)
let memoryToken: string | null = null;

/**
 * 🔐 Set/Reset Auth Token for the API Client
 * Called by AuthProvider during login/logout
 */
export const setAuthToken = (token: string | null) => {
    memoryToken = token;
};

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    // If backend uses HttpOnly cookies, memoryToken might remain null, which is fine.
    // If using JWT without HttpOnly, we use the in-memory token.
    if (memoryToken) {
        config.headers.Authorization = `Bearer ${memoryToken}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        // Auto-retry once for Network Errors or 503 Service Unavailable
        const isNetworkError = !error.response;
        const is503 = error.response?.status === 503;

        if ((isNetworkError || is503) && config && !config._retry) {
            config._retry = true;
            try {
                // Wait for 1.5 seconds before retrying
                await new Promise(resolve => setTimeout(resolve, 1500));
                return await apiClient.request(config);
            } catch (retryError) {
                return Promise.reject(retryError);
            }
        }

        if (error.response?.status === 401 || error.response?.status === 403) {
            window.dispatchEvent(new CustomEvent('auth-required'));
        }
        return Promise.reject(error);
    }
);

export default apiClient;
