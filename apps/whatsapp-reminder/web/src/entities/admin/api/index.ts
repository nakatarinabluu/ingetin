import { 
    ApiResponse, 
    DashboardStats, 
    ProviderHealth, 
    PulseEntry,
    UserDTO,
    LicenseDTO,
    ReminderDTO,
    PaginatedResponse,
    UserProfile
} from '@ingetin/types';
import apiClient from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/api/endpoints';

/**
 * 🛠️ ADMIN SYSTEM API
 * Handles system health, traffic monitoring, and global stats.
 */
export const AdminAPI = {
    getEngineStatus: () => 
        apiClient.get<ApiResponse<unknown>>(API_ENDPOINTS.ADMIN.ENGINE_STATUS),
    
    getSystemPulse: () => 
        apiClient.get<ApiResponse<{ pulse: PulseEntry[] }>>(API_ENDPOINTS.ADMIN.PULSE),
    
    getProviderHealth: () => 
        apiClient.get<ApiResponse<ProviderHealth>>(API_ENDPOINTS.ADMIN.PROVIDERS),
    
    getDashboardStats: () => 
        apiClient.get<ApiResponse<DashboardStats>>(API_ENDPOINTS.ADMIN.DASHBOARD),
    
    getTraffic: () => 
        apiClient.get<ApiResponse<{ name: string; sent: number; received: number }[]>>(API_ENDPOINTS.ADMIN.TRAFFIC),
};

/**
 * 👤 ADMIN USER MANAGEMENT API
 * Administrative operations for user accounts.
 */
export const AdminUserAPI = {
    getAllUsers: (params?: { page: number; limit: number; search?: string }) => 
        apiClient.get<ApiResponse<PaginatedResponse<UserDTO>>>(API_ENDPOINTS.USER.BASE, { params }),
    
    deleteUser: (id: string) => 
        apiClient.delete<ApiResponse<unknown>>(`${API_ENDPOINTS.USER.BASE}/${id}`),
    
    getUserReminders: (id: string, params?: { page: number; limit: number; search?: string; status?: string }) => 
        apiClient.get<ApiResponse<PaginatedResponse<ReminderDTO>>>(`${API_ENDPOINTS.USER.BASE}/${id}/reminders`, { params }),
    
    getUserDetails: (id: string) => 
        apiClient.get<ApiResponse<UserProfile>>(`${API_ENDPOINTS.USER.BASE}/${id}/details`),
    
    deepSync: (id: string) => 
        apiClient.post<ApiResponse<{ count: number }>>(`${API_ENDPOINTS.USER.BASE}/${id}/sync/deep`),
};

/**
 * 🔑 ADMIN LICENSE MANAGEMENT API
 * Administrative operations for license lifecycle.
 */
export const AdminLicenseAPI = {
    getAll: (params?: { page: number; limit: number; search?: string; status?: string }) => 
        apiClient.get<ApiResponse<PaginatedResponse<LicenseDTO>>>(API_ENDPOINTS.ADMIN.LICENSES, { params }),
    
    generate: (targetName: string) => 
        apiClient.post<ApiResponse<LicenseDTO>>(API_ENDPOINTS.ADMIN.LICENSES, { targetName }),
    
    pause: (id: string) => 
        apiClient.post<ApiResponse<unknown>>(`${API_ENDPOINTS.ADMIN.LICENSES}/${id}/pause`),
    
    unpause: (id: string) => 
        apiClient.post<ApiResponse<unknown>>(`${API_ENDPOINTS.ADMIN.LICENSES}/${id}/unpause`),
    
    revoke: (id: string) => 
        apiClient.delete<ApiResponse<unknown>>(`${API_ENDPOINTS.ADMIN.LICENSES}/${id}`),
};
