import { 
    ReminderInput,
    ApiResponse,
    ReminderDTO,
    PaginatedResponse,
} from '@ingetin/types';
import apiClient from '@/shared/api/client';
import { API_ENDPOINTS } from '@/shared/api/endpoints';

/**
 * ⏰ REMINDERS API
 * CRUD operations for user schedules and calendar synchronization.
 */
export const ReminderAPI = {
    getReminders: (params?: { page: number; limit: number; search?: string; status?: string }) => 
        apiClient.get<ApiResponse<PaginatedResponse<ReminderDTO>>>(API_ENDPOINTS.REMINDERS.BASE, { params }),
    
    createReminder: (data: ReminderInput) => 
        apiClient.post<ApiResponse<ReminderDTO>>(API_ENDPOINTS.REMINDERS.BASE, data),
    
    updateReminder: (id: string, data: Partial<ReminderInput>) => 
        apiClient.put<ApiResponse<ReminderDTO>>(`${API_ENDPOINTS.REMINDERS.BASE}/${id}`, data),
    
    deleteReminder: (id: string) => 
        apiClient.delete<ApiResponse<unknown>>(`${API_ENDPOINTS.REMINDERS.BASE}/${id}`),
    
    syncReminders: () => 
        apiClient.post<ApiResponse<unknown>>(`${API_ENDPOINTS.REMINDERS.SYNC}`),
};
