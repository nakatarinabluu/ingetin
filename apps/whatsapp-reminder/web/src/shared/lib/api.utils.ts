import { ApiResponse } from '@ingetin/types';

/**
 * Standard utility to unwrap API responses and throw errors on failure.
 * Ensures consistent error handling across all hooks.
 */
export const unwrap = <T>(res: ApiResponse<T>): T => {
    if (res.success) return res.data;
    
    // ApiResponse guaranteed to have 'error' string when success is false
    throw new Error(res.error || 'API Error');
};

/**
 * Standard utility for resolving WebSocket URLs based on API configuration.
 */
export const resolveWsUrl = (path: string): string => {
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    
    try {
        // Resolve base URL (handles both absolute and relative VITE_API_URL)
        const base = new URL(apiUrl, window.location.origin);
        
        // Normalize paths to ensure correct concatenation without overriding base paths
        const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
        const normalizedBase = base.href.endsWith('/') ? base.href : `${base.href}/`;
        
        const finalUrl = new URL(normalizedPath, normalizedBase);
        
        // Transform protocol to WebSocket
        finalUrl.protocol = finalUrl.protocol === 'https:' ? 'wss:' : 'ws:';
        
        return finalUrl.toString();
    } catch (e) {
        // Safe fallback in case of completely malformed environments
        const fallbackProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const fallbackPath = path.startsWith('/') ? path : `/${path}`;
        return `${fallbackProtocol}//${window.location.host}${fallbackPath}`;
    }
};
