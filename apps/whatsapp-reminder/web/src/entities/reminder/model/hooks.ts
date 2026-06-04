import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReminderAPI } from '@/entities/reminder/api';
import { UserAPI } from '@/entities/user/api';
import { 
    ReminderDTO, 
    ReminderInput, 
    PaginatedResponse 
} from '@ingetin/types';
import { unwrap } from '@/shared/lib/api.utils';

export const useReminders = (options?: { page?: number; limit?: number; search?: string; status?: string }) => {
    return useQuery<PaginatedResponse<ReminderDTO>>({
        queryKey: ["reminders", options?.page, options?.limit, options?.search, options?.status],
        queryFn: async () => {
            const res = await ReminderAPI.getReminders({
                page: options?.page || 1,
                limit: options?.limit || 100,
                search: options?.search,
                status: options?.status
            });
            return unwrap(res.data);
        },
        staleTime: 30000,
    });
};

export const useCreateReminder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ReminderInput) => ReminderAPI.createReminder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });
};

export const useUpdateReminder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<ReminderInput> }) => ReminderAPI.updateReminder(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });
};

export const useDeleteReminder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ReminderAPI.deleteReminder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });
};

export const useSyncCalendar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => ReminderAPI.syncReminders(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });
};

export const useUserReminders = (userId: string | null, options?: { page?: number; limit?: number; search?: string; status?: string }) => {
    return useQuery<PaginatedResponse<ReminderDTO>>({
        queryKey: ['reminders', userId, options?.page, options?.limit, options?.search, options?.status],
        queryFn: async () => {
            if (!userId) return { items: [], pagination: { total: 0, page: 1, limit: 100, totalPages: 1 } };
            const res = await UserAPI.getUserReminders(userId, {
                page: options?.page || 1,
                limit: options?.limit || 100,
                search: options?.search,
                status: options?.status
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
}
