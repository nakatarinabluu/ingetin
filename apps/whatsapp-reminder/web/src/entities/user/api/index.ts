import { 
    LoginInput, 
    RegisterInput, 
    UpdateProfileInput, 
    ActivateLicenseInput,
    ApiResponse,
    UserDTO,
    AuthResult,
    Profile,
    PaginatedResponse,
    ReminderDTO
} from '@ingetin/types';
import apiClient from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/api/endpoints';

/**
 * 🔐 AUTHENTICATION API
 * Identity verification and session management.
 */
export const AuthAPI = {
    checkUsername: (username: string) => 
        apiClient.get<ApiResponse<{ available: boolean }>>(API_ENDPOINTS.AUTH.CHECK_USERNAME, { params: { username } }),
    
    login: (data: LoginInput) => 
        apiClient.post<ApiResponse<AuthResult>>(API_ENDPOINTS.AUTH.LOGIN, data),
    
    register: (data: RegisterInput) => 
        apiClient.post<ApiResponse<AuthResult>>(API_ENDPOINTS.AUTH.REGISTER, data),
    
    updateProfile: (data: UpdateProfileInput) => 
        apiClient.post<ApiResponse<UserDTO>>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data),
    
    unlinkGoogle: () => 
        apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.AUTH.UNLINK_GOOGLE),
    
    unlinkPhone: () => 
        apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.AUTH.UNLINK_PHONE),

    activate: (data: ActivateLicenseInput) => 
        apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.AUTH.ACTIVATE, data),
};

/**
 * 👤 USER & PROFILE API
 * Core identity and personal data management.
 */
export const UserAPI = {
    getProfile: () => 
        apiClient.get<ApiResponse<Profile>>(API_ENDPOINTS.USER.PROFILE),

    /** Admin-scoped: get reminders for a specific user */
    getUserReminders: (userId: string, params?: { page?: number; limit?: number; search?: string; status?: string }) =>
        apiClient.get<ApiResponse<PaginatedResponse<ReminderDTO>>>(
            `${API_ENDPOINTS.REMINDERS.BASE}/user/${userId}`,
            { params }
        ),

    /** Deep sync Google Calendar for a specific user (admin action) */
    deepSync: (userId: string) =>
        apiClient.post<ApiResponse<{ synced: number }>>(`${API_ENDPOINTS.REMINDERS.SYNC}/deep/${userId}`),
};

