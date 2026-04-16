import { 
    ApiResponse,
} from '@ingetin/types';
import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { PulseEntry } from '../types';

export const AdminAPI = {
    getEngineStatus: () => 
        apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.ENGINE_STATUS),
    
    getSystemPulse: () => 
        apiClient.get<ApiResponse<{ pulse: PulseEntry[] }>>(API_ENDPOINTS.ADMIN.PULSE),
    
    getProviderHealth: () => 
        apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.PROVIDERS),
    
    getDashboardStats: () => 
        apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.DASHBOARD),
};
