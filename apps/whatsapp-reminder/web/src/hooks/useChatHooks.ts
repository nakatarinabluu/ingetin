import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WhatsAppAPI } from '../api/whatsapp.api';
import { 
    MessageDTO, 
    ChatThreadDTO, 
    PaginatedResponse 
} from '@ingetin/types';
import { unwrap } from '../utils/api.utils';

export const useMessages = (view: string, options?: { page?: number; limit?: number }) => {
    return useQuery<PaginatedResponse<MessageDTO>>({
        queryKey: ['messages', options?.page, options?.limit],
        queryFn: async () => {
            const res = await WhatsAppAPI.getMessages({ 
                page: options?.page || 1, 
                limit: options?.limit || 100 
            });
            return unwrap(res.data);
        },
        enabled: view === 'messages' || view === 'monitor',
        staleTime: 30000,
    });
};

export const useChatThreads = (isAdmin: boolean, options?: { page?: number; limit?: number; filter?: string }) => {
    return useQuery<PaginatedResponse<ChatThreadDTO>>({
        queryKey: ['chats', options?.page, options?.limit, options?.filter],
        queryFn: async () => {
            const res = await WhatsAppAPI.getChatThreads({
                page: options?.page || 1,
                limit: options?.limit || 100,
                filter: options?.filter || 'ALL'
            });
            return unwrap(res.data);
        },
        enabled: isAdmin,
        staleTime: 30000,
    });
};

export const useThreadHistory = (phone: string | null, options?: { page?: number; limit?: number }) => {
    return useQuery<PaginatedResponse<MessageDTO>>({
        queryKey: ['thread', phone, options?.page, options?.limit],
        queryFn: async () => {
            if (!phone) return { items: [], pagination: { total: 0, page: 1, limit: 100, totalPages: 1 } };
            const res = await WhatsAppAPI.getThreadHistory(phone, {
                page: options?.page || 1,
                limit: options?.limit || 100
            });
            return unwrap(res.data);
        },
        enabled: !!phone,
        staleTime: 5000,
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (phone: string) => WhatsAppAPI.markAsRead(phone),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            queryClient.invalidateQueries({ queryKey: ['thread'] });
        },
    });
};
