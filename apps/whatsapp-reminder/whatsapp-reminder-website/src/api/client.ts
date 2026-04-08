import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    }
});

let csrfToken: string | null = null;
let isFetchingCsrf = false;
let csrfSubscribers: ((token: string) => void)[] = [];

async function fetchCsrfToken() {
    if (isFetchingCsrf) {
        return new Promise<string>((resolve) => {
            csrfSubscribers.push(resolve);
        });
    }

    isFetchingCsrf = true;
    try {
        const res = await axios.get(`${API_BASE}/api/auth/csrf`, { 
            withCredentials: true,
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const token = res.data?.token || res.data?.data?.token;
        if (token) {
            csrfToken = token;
            csrfSubscribers.forEach(cb => cb(token));
            csrfSubscribers = [];
            return token;
        }
    } catch (err) {
        // Failed to fetch CSRF token, backend might be down or not setting it
    } finally {
        isFetchingCsrf = false;
    }
    return null;
}

// Request Interceptor: Simply attach what we have
apiClient.interceptors.request.use((config) => {
    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
        config.headers['x-csrf-token'] = csrfToken;
    }
    return config;
});

// Response Interceptor: Handle 401/403 (Session/CSRF issues)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // 1. Handle 403 Forbidden (CSRF Failure)
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;
            const newToken = await fetchCsrfToken();
            if (newToken) {
                originalRequest.headers['x-csrf-token'] = newToken;
                return apiClient(originalRequest);
            }
        }

        // 2. Handle 401 Unauthorized (Session Expired)
        const isAuthPath = originalRequest.url?.includes('/api/auth');
        const isProfilePath = originalRequest.url?.includes('/api/users/profile');
        
        if (error.response?.status === 401 && !isAuthPath) {
            localStorage.removeItem('wa_session');
            // Avoid infinite redirect loops
            if (window.location.pathname !== '/auth') {
                window.location.href = '/auth';
            }
        } 
        
        if (error.response?.status === 404 && isProfilePath) {
            localStorage.removeItem('wa_session');
            window.location.href = '/auth';
        }

        return Promise.reject(error);
    }
);

export default apiClient;
