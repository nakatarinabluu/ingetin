import { 
    LoginInput, 
    RegisterInput, 
    UpdateProfileInput, 
    ActivateLicenseInput,
    ReminderInput,
    OTPSendInput,
    OTPVerifyInput,
    ApiResponse,
    UserDTO,
    AuthResult,
    MessageDTO,
    ReminderDTO,
    LicenseDTO,
    PaginatedResponse,
    PaginationDTO,
    StatsDTO,
    ChatThreadDTO,
    ThreadHistoryDTO
} from '@ingetin/types';
import apiClient from './client';

const WHATSAPP_BASE = '/api/whatsapp';
const USER_BASE = '/api/users';
const AUTH_BASE = '/api/auth';
const HEALTH_BASE = '/api'; // Maps to health.routes.ts

export const WhatsAppAPI = {
    // Stats & Monitoring
    getStats: (cb?: number) => apiClient.get<ApiResponse<StatsDTO>>(`${WHATSAPP_BASE}/stats${cb ? `?cb=${cb}` : ''}`),
    getMessages: (params?: { page: number; limit: number; cb?: number }) => 
        apiClient.get<ApiResponse<PaginatedResponse<MessageDTO>>>(`${WHATSAPP_BASE}/messages`, { params }),
    
    // Chats
    getChatThreads: (params?: { page: number; limit: number; filter?: string; cb?: number }) => 
        apiClient.get<ApiResponse<PaginatedResponse<ChatThreadDTO>>>(`${WHATSAPP_BASE}/chats`, { params }),
    getThreadHistory: (phone: string, params?: { page: number; limit: number; cb?: number }) => 
        apiClient.get<ApiResponse<ThreadHistoryDTO>>(`${WHATSAPP_BASE}/chats/${phone}`, { params }),
    markAsRead: (phone: string) => apiClient.post<ApiResponse<unknown>>(`${WHATSAPP_BASE}/chats/${phone}/read`),

    // Reminders
    getReminders: (params?: { page: number; limit: number }) => 
        apiClient.get<ApiResponse<PaginatedResponse<ReminderDTO>>>(`${WHATSAPP_BASE}/reminders`, { params }),
    createReminder: (data: ReminderInput) => apiClient.post<ApiResponse<ReminderDTO>>(`${WHATSAPP_BASE}/reminders`, data),
    deleteReminder: (id: string) => apiClient.delete<ApiResponse<unknown>>(`${WHATSAPP_BASE}/reminders/${id}`),
    syncReminders: () => apiClient.post<ApiResponse<unknown>>(`${WHATSAPP_BASE}/reminders/sync`),

    // OTP (Messaging logic)
    sendOTP: (data: OTPSendInput) => apiClient.post<ApiResponse<unknown>>(`${WHATSAPP_BASE}/otp/send`, data),
    verifyOTP: (data: OTPVerifyInput) => apiClient.post<ApiResponse<unknown>>(`${WHATSAPP_BASE}/otp/verify`, data),
};

export const UserAPI = {
    getProfile: () => apiClient.get<ApiResponse<UserDTO>>(`${USER_BASE}/profile`),
    getAllUsers: (params?: { page: number; limit: number; search?: string; cb?: number }) => 
        apiClient.get<ApiResponse<PaginatedResponse<UserDTO>>>(USER_BASE, { params }),
    deleteUser: (id: string) => apiClient.delete<ApiResponse<unknown>>(`${USER_BASE}/${id}`),
    getUserReminders: (id: string, params?: { page: number; limit: number }) => 
        apiClient.get<ApiResponse<PaginatedResponse<ReminderDTO>>>(`${USER_BASE}/${id}/reminders`, { params }),
    getUserDetails: (id: string) => apiClient.get<ApiResponse<UserDTO>>(`${USER_BASE}/${id}/details`),
    deepSync: (id: string) => apiClient.post<ApiResponse<unknown>>(`${USER_BASE}/${id}/sync/deep`),
    
    // License sub-routes under /api/users
    getAllLicenses: (params?: { page: number; limit: number; search?: string; status?: string; cb?: number }) => 
        apiClient.get<ApiResponse<PaginatedResponse<LicenseDTO>>>(`${USER_BASE}/licenses`, { params }),
    generateLicense: (targetName: string) => apiClient.post<ApiResponse<LicenseDTO>>(`${USER_BASE}/licenses/generate`, { targetName }),
    pauseLicense: (id: string) => apiClient.post<ApiResponse<unknown>>(`${USER_BASE}/licenses/${id}/pause`),
    unpauseLicense: (id: string) => apiClient.post<ApiResponse<unknown>>(`${USER_BASE}/licenses/${id}/unpause`),
    revokeLicense: (id: string) => apiClient.post<ApiResponse<unknown>>(`${USER_BASE}/licenses/${id}/revoke`),
};

// Backwards compatibility for the hook which expects LicenseAPI
export const LicenseAPI = {
    getAll: UserAPI.getAllLicenses,
    generate: UserAPI.generateLicense,
    pause: UserAPI.pauseLicense,
    unpause: UserAPI.unpauseLicense,
    revoke: UserAPI.revokeLicense
};

export const AuthAPI = {
    checkUsername: (username: string) => apiClient.get<ApiResponse<{ available: boolean }>>(`${AUTH_BASE}/check-username`, { params: { username } }),
    login: (data: LoginInput) => apiClient.post<ApiResponse<AuthResult>>(`${AUTH_BASE}/login`, data),
    register: (data: RegisterInput) => apiClient.post<ApiResponse<AuthResult>>(`${AUTH_BASE}/register`, data),
    activate: (data: ActivateLicenseInput) => apiClient.post<ApiResponse<AuthResult>>(`${AUTH_BASE}/activate`, data),
    updateProfile: (data: UpdateProfileInput) => apiClient.post<ApiResponse<UserDTO>>(`${AUTH_BASE}/update-profile`, data),
    unlinkGoogle: () => apiClient.post<ApiResponse<unknown>>(`${AUTH_BASE}/google/unlink`),
    unlinkPhone: () => apiClient.post<ApiResponse<unknown>>(`${AUTH_BASE}/otp/unlink`),
};

export const AdminAPI = {
    getEngineStatus: () => apiClient.get<ApiResponse<unknown>>(`${HEALTH_BASE}/admin/health/engine`),
    getSystemPulse: () => apiClient.get<ApiResponse<{ pulse: any[] }>>(`${HEALTH_BASE}/admin/health/pulse`), // Still any for logs
    getProviderHealth: () => apiClient.get<ApiResponse<unknown>>(`${HEALTH_BASE}/admin/health/providers`),
    getDashboardStats: () => apiClient.get<ApiResponse<unknown>>(`${HEALTH_BASE}/admin/health/dashboard`),
};
