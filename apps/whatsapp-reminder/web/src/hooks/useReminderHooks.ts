import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WhatsAppAPI } from '../api/whatsapp.api';
import { UserAPI } from '../api/user.api';
import { 
    ReminderDTO, 
    ReminderInput, 
    PaginatedResponse 
} from '@ingetin/types';
import { unwrap } from '../utils/api.utils';

export const useReminders = (options?: { page?: number; limit?: number; search?: string }) => {
    return useQuery<PaginatedResponse<ReminderDTO>>({
        queryKey: ["reminders", options?.page, options?.limit, options?.search],
        queryFn: async () => {
            try {
                const res = await WhatsAppAPI.getReminders({
                    page: options?.page || 1,
                    limit: options?.limit || 100,
                    search: options?.search
                });
                return unwrap(res.data);
            } catch (err: unknown) {
                const error = err as { response?: { status?: number } };
                if (error.response?.status === 403) {
                    return { items: [], pagination: { total: 0, page: 1, limit: 100, totalPages: 1 } };
                }
                throw err;
            }
        },
        staleTime: 30000,
    });
};

export const useCreateReminder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ReminderInput) => WhatsAppAPI.createReminder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });
};

export const useDeleteReminder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => WhatsAppAPI.deleteReminder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });
};

export const useSyncCalendar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => WhatsAppAPI.syncReminders(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });
};

export const useUserReminders = (userId: string | null, options?: { page?: number; limit?: number; search?: string }) => {
    return useQuery<PaginatedResponse<ReminderDTO>>({
        queryKey: ['reminders', userId, options?.page, options?.limit, options?.search],
        queryFn: async () => {
            if (!userId) return { items: [], pagination: { total: 0, page: 1, limit: 100, totalPages: 1 } };
            const res = await UserAPI.getUserReminders(userId, {
                page: options?.page || 1,
                limit: options?.limit || 100,
                search: options?.search
            });
            return unwrap(res.data);
        },
        enabled: !!userId,
        staleTime: 30000,
    });
};

export const useDeepSyncCalendar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => UserAPI.deepSync(userId),
        onSuccess: (_, userId) => {
            queryClient.invalidateQueries({ queryKey: ['reminders', userId] });
        },
    });
};
