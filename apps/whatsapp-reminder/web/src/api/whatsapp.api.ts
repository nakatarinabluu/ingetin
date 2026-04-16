import { 
    ReminderInput,
    OTPSendInput,
    OTPVerifyInput,
    ApiResponse,
    MessageDTO,
    ReminderDTO,
    PaginatedResponse,
    StatsDTO,
    ChatThreadDTO,
    ThreadHistoryDTO
} from '@ingetin/types';
import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

export const WhatsAppAPI = {
    // Stats & Monitoring
    getStats: (cb?: number) => 
        apiClient.get<ApiResponse<StatsDTO>>(`${API_ENDPOINTS.WHATSAPP.STATS}${cb ? `?cb=${cb}` : ''}`),
    
    getMessages: (params?: { page: number; limit: number; cb?: number }) => 
        apiClient.get<ApiResponse<PaginatedResponse<MessageDTO>>>(API_ENDPOINTS.WHATSAPP.MESSAGES, { params }),
    
    // Chats
    getChatThreads: (params?: { page: number; limit: number; filter?: string; cb?: number }) => 
        apiClient.get<ApiResponse<PaginatedResponse<ChatThreadDTO>>>(API_ENDPOINTS.WHATSAPP.CHATS, { params }),
    
    getThreadHistory: (phone: string, params?: { page: number; limit: number; cb?: number }) => 
        apiClient.get<ApiResponse<ThreadHistoryDTO>>(`${API_ENDPOINTS.WHATSAPP.CHATS}/${phone}`, { params }),
    
    markAsRead: (phone: string) => 
        apiClient.post<ApiResponse<unknown>>(`${API_ENDPOINTS.WHATSAPP.CHATS}/${phone}/read`),

    // Reminders
    getReminders: (params?: { page: number; limit: number; search?: string }) => 
        apiClient.get<ApiResponse<PaginatedResponse<ReminderDTO>>>(API_ENDPOINTS.REMINDERS.BASE, { params }),
    
    createReminder: (data: ReminderInput) => 
        apiClient.post<ApiResponse<ReminderDTO>>(API_ENDPOINTS.REMINDERS.BASE, data),
    
    deleteReminder: (id: string) => 
        apiClient.delete<ApiResponse<unknown>>(`${API_ENDPOINTS.REMINDERS.BASE}/${id}`),
    
    syncReminders: () => 
        apiClient.post<ApiResponse<unknown>>(`${API_ENDPOINTS.REMINDERS.SYNC}`),

    // OTP
    sendOTP: (data: OTPSendInput) => 
        apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.WHATSAPP.OTP_SEND, data),
    
    verifyOTP: (data: OTPVerifyInput) => 
        apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.WHATSAPP.OTP_VERIFY, data),
};
