import { ApiResponse } from '@ingetin/types';

/**
 * Standard utility to unwrap API responses and throw errors on failure.
 * Ensures consistent error handling across all hooks.
 */
export const unwrap = <T>(res: ApiResponse<T>): T => {
    if (res.success) return res.data;
    
    // Safely extract message strictly based on the response success state
    const errorMsg = !res.success && 'error' in res ? (res as { error?: string | { message?: string } }).error : 'API Error';
    const finalMsg = typeof errorMsg === 'string' ? errorMsg : errorMsg?.message || 'API Error';
    
    throw new Error(finalMsg);
};
