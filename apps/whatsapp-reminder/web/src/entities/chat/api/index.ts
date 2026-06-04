import { 
    ApiResponse,
    MessageDTO,
    PaginatedResponse,
    ChatThreadDTO,
    ThreadHistoryDTO,
    OTPSendInput,
    OTPVerifyInput
} from '@ingetin/types';
import apiClient from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/api/endpoints';

/**
 * 💬 CHAT & MESSAGING API
 * Handles WhatsApp conversations and OTP verification.
 */
export const ChatAPI = {
    // Message Browsing
    getMessages: (params?: { page: number; limit: number; cb?: number }) => 
        apiClient.get<ApiResponse<PaginatedResponse<MessageDTO>>>(API_ENDPOINTS.WHATSAPP.MESSAGES, { params }),
    
    // Conversation Threads
    getChatThreads: (params?: { page: number; limit: number; filter?: string; cb?: number }) => 
        apiClient.get<ApiResponse<PaginatedResponse<ChatThreadDTO>>>(API_ENDPOINTS.WHATSAPP.CHATS, { params }),
    
    getThreadHistory: (phone: string, params?: { page: number; limit: number; cb?: number }) => 
        apiClient.get<ApiResponse<ThreadHistoryDTO>>(`${API_ENDPOINTS.WHATSAPP.CHATS}/${phone}`, { params }),
    
    markAsRead: (phone: string) => 
        apiClient.post<ApiResponse<unknown>>(`${API_ENDPOINTS.WHATSAPP.CHATS}/${phone}/read`),

    // OTP Services
    sendOTP: (data: OTPSendInput) => 
        apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.WHATSAPP.OTP_SEND, data),
    
    verifyOTP: (data: OTPVerifyInput) => 
        apiClient.post<ApiResponse<unknown>>(API_ENDPOINTS.WHATSAPP.OTP_VERIFY, data),
};
