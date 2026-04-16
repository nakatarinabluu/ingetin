import { 
    ApiResponse,
    UserDTO,
    ReminderDTO,
    LicenseDTO,
    PaginatedResponse
} from '@ingetin/types';
import { Profile, UserProfile } from '../types';
import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const UserAPI = {
    getProfile: () => 
        apiClient.get<ApiResponse<Profile>>(API_ENDPOINTS.USER.PROFILE),
    
    getAllUsers: (params?: { page: number; limit: number; search?: string; cb?: number }) => 
        apiClient.get<ApiResponse<PaginatedResponse<UserDTO>>>(API_ENDPOINTS.USER.BASE, { params }),
    
    deleteUser: (id: string) => 
        apiClient.delete<ApiResponse<unknown>>(`${API_ENDPOINTS.USER.BASE}/${id}`),
    
    getUserReminders: (id: string, params?: { page: number; limit: number }) => 
        apiClient.get<ApiResponse<PaginatedResponse<ReminderDTO>>>(`${API_ENDPOINTS.USER.BASE}/${id}/reminders`, { params }),
    
    getUserDetails: (id: string) => 
        apiClient.get<ApiResponse<UserProfile>>(`${API_ENDPOINTS.USER.BASE}/${id}/details`),
    
    deepSync: (id: string) => 
        apiClient.post<ApiResponse<unknown>>(`${API_ENDPOINTS.USER.BASE}/${id}/sync/deep`),
    
    // License sub-routes
    getAllLicenses: (params?: { page: number; limit: number; search?: string; status?: string; cb?: number }) => 
        apiClient.get<ApiResponse<PaginatedResponse<LicenseDTO>>>(API_ENDPOINTS.USER.LICENSES, { params }),
    
    generateLicense: (targetName: string) => 
        apiClient.post<ApiResponse<LicenseDTO>>(`${API_ENDPOINTS.USER.LICENSES}/generate`, { targetName }),
    
    pauseLicense: (id: string) => 
        apiClient.post<ApiResponse<unknown>>(`${API_ENDPOINTS.USER.LICENSES}/${id}/pause`),
    
    unpauseLicense: (id: string) => 
        apiClient.post<ApiResponse<unknown>>(`${API_ENDPOINTS.USER.LICENSES}/${id}/unpause`),
    
    revokeLicense: (id: string) => 
        apiClient.post<ApiResponse<unknown>>(`${API_ENDPOINTS.USER.LICENSES}/${id}/revoke`),
};

// Backwards compatibility for the hook which expects LicenseAPI
export const LicenseAPI = {
    getAll: UserAPI.getAllLicenses,
    generate: UserAPI.generateLicense,
    pause: UserAPI.pauseLicense,
    unpause: UserAPI.unpauseLicense,
    revoke: UserAPI.revokeLicense
};
