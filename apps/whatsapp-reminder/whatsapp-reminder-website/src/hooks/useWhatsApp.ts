import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WhatsAppAPI, UserAPI, LicenseAPI, AuthAPI, AdminAPI } from '../api/services';
import { 
    MessageDTO, 
    UserDTO, 
    ApiResponse, 
    ReminderInput,
    UpdateProfileInput,
    ReminderDTO,
    PaginationDTO,
    PaginatedResponse,
    LicenseDTO
} from '@ingetin/types';

// --- FRONTEND SPECIFIC TYPES ---

export interface Stats {
    summary: {
        totalOTP: number;
        totalNotif: number;
    };
    details: Record<string, unknown>[];
}

export interface ChatThread {
    phone: string;
    phoneNumber: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    isRegistered: boolean;
    username?: string | null;
    fullName?: string | null;
}

export interface Profile extends UserDTO {
    rank?: string;
    isActivated: boolean;
    googleRefreshToken?: string | null;
    createdAt?: string | null;
    lastLogin?: string | null;
    license?: {
        status: 'AVAILABLE' | 'USED' | 'REVOKED';
        key: string;
    } | null;
}

// --- UTILS ---

const unwrap = <T>(res: ApiResponse<T>): T => {
    if (res.success) return res.data;
    throw new Error(res.error.message || 'API Error');
};

// --- HOOKS ---

export const useReminders = (options?: { page?: number; limit?: number }) => {
    return useQuery<PaginatedResponse<ReminderDTO>>({
        queryKey: ["reminders", options?.page, options?.limit],
        queryFn: async () => {
            try {
                const res = await WhatsAppAPI.getReminders({
                    page: options?.page || 1,
                    limit: options?.limit || 100
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

export const useProfile = () => {
    return useQuery<Profile>({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await UserAPI.getProfile();
            return unwrap(res.data) as Profile;
        },
        staleTime: 60000,
    });
};

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

export const useStats = (isAdmin: boolean) => {
    return useQuery<Stats>({
        queryKey: ['stats'],
        queryFn: async () => {
            const res = await WhatsAppAPI.getStats();
            const data = res.data;
            if (data.success && !Array.isArray(data.data.details)) {
                data.data.details = [];
            }
            return unwrap(res.data);
        },
        enabled: isAdmin,
        staleTime: 30000,
    });
};

export const useDashboardStats = (isAdmin: boolean) => {
    return useQuery<unknown>({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await AdminAPI.getDashboardStats();
            return unwrap(res.data);
        },
        enabled: isAdmin,
        staleTime: 10000,
    });
};

export const useProviderHealth = (isAdmin: boolean) => {
    return useQuery<unknown>({
        queryKey: ['admin-provider-health'],
        queryFn: async () => {
            const res = await AdminAPI.getProviderHealth();
            return unwrap(res.data);
        },
        enabled: isAdmin,
        staleTime: 60000,
    });
};

export const useSystemPulse = (isAdmin: boolean) => {
    return useQuery<Record<string, unknown>[]>({
        queryKey: ['admin-system-pulse'],
        queryFn: async () => {
            const res = await AdminAPI.getSystemPulse();
            return res.data.success ? res.data.data.pulse || [] : [];
        },
        enabled: isAdmin,
        staleTime: 10000,
    });
};

export interface ChatThreadsResponse extends PaginatedResponse<ChatThread> {
    stats?: { 
        total: number, 
        registered: number, 
        anonymous: number,
        verified: number,
        unverified: number,
        verifiedUnread: number,
        unverifiedUnread: number
    }
}

export const useChatThreads = (isAdmin: boolean, options?: { page?: number; limit?: number; filter?: string }) => {
    return useQuery<ChatThreadsResponse>({
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

export const useLicenses = (isAdmin: boolean, options?: { page?: number; limit?: number; search?: string; status?: string }) => {
    return useQuery<PaginatedResponse<LicenseDTO>>({
        queryKey: ['licenses', options?.page, options?.limit, options?.search, options?.status],
        queryFn: async () => {
            const res = await LicenseAPI.getAll({
                page: options?.page || 1,
                limit: options?.limit || 100,
                search: options?.search,
                status: options?.status
            });
            return unwrap(res.data);
        },
        enabled: isAdmin,
        staleTime: 60000,
    });
};

export const useAllUsers = (isAdmin: boolean, options?: { page?: number; limit?: number; search?: string }) => {
    return useQuery<PaginatedResponse<UserDTO>>({
        queryKey: ['users', options?.page, options?.limit, options?.search],
        queryFn: async () => {
            const res = await UserAPI.getAllUsers({ 
                page: options?.page || 1, 
                limit: options?.limit || 100, 
                search: options?.search 
            });
            return unwrap(res.data);
        },
        enabled: isAdmin,
        staleTime: 60000,
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

// --- MUTATIONS ---

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

export const useGenerateLicense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { targetName?: string }) => LicenseAPI.generate(data.targetName || ''),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['licenses'] });
        },
    });
};

export const usePauseLicense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => LicenseAPI.pause(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['licenses'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUnpauseLicense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => LicenseAPI.unpause(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['licenses'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useRevokeLicense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => LicenseAPI.revoke(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['licenses'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
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

export const useUserReminders = (userId: string | null, options?: { page?: number; limit?: number }) => {
    return useQuery<PaginatedResponse<ReminderDTO>>({
        queryKey: ['reminders', userId, options?.page, options?.limit],
        queryFn: async () => {
            if (!userId) return { items: [], pagination: { total: 0, page: 1, limit: 100, totalPages: 1 } };
            const res = await UserAPI.getUserReminders(userId, {
                page: options?.page || 1,
                limit: options?.limit || 100
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

export const useUserDetails = (userId: string | null) => {
    return useQuery<UserDTO | null>({
        queryKey: ['user-details', userId],
        queryFn: async () => {
            if (!userId) return null;
            const res = await UserAPI.getUserDetails(userId);
            return unwrap(res.data);
        },
        enabled: !!userId,
        staleTime: 60000,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateProfileInput) => AuthAPI.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useUnlinkPhone = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => AuthAPI.unlinkPhone(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useUnlinkGoogle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => AuthAPI.unlinkGoogle(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
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
