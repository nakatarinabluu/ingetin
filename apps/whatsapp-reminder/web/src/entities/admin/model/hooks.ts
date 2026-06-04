import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPI, AdminUserAPI, AdminLicenseAPI } from '@/entities/admin/api';
import { 
    LicenseDTO, 
    PaginatedResponse,
    UserDTO,
    UserProfile
} from '@ingetin/types';
import { unwrap } from '@/shared/lib/api.utils';
import { DashboardStats, ProviderHealth, PulseEntry } from '@ingetin/types';

export const useAllUsers = (isAdmin: boolean, options?: { page?: number; limit?: number; search?: string }) => {
    return useQuery<PaginatedResponse<UserDTO>>({
        queryKey: ['users', options?.page, options?.limit, options?.search],
        queryFn: async () => {
            const res = await AdminUserAPI.getAllUsers({ 
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

export const useUserDetails = (userId: string | null) => {
    return useQuery<UserProfile | null>({
        queryKey: ['user-details', userId],
        queryFn: async () => {
            if (!userId) return null;
            const res = await AdminUserAPI.getUserDetails(userId);
            return unwrap(res.data);
        },
        enabled: !!userId,
        staleTime: 60000,
    });
};

export const useDashboardStats = (isAdmin: boolean) => {
    return useQuery<DashboardStats>({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await AdminAPI.getDashboardStats();
            return unwrap(res.data) as DashboardStats;
        },
        enabled: isAdmin,
        staleTime: 10000,
    });
};

export const useProviderHealth = (isAdmin: boolean) => {
    return useQuery<ProviderHealth>({
        queryKey: ['admin-provider-health'],
        queryFn: async () => {
            const res = await AdminAPI.getProviderHealth();
            return unwrap(res.data) as ProviderHealth;
        },
        enabled: isAdmin,
        staleTime: 60000,
    });
};

export const useSystemPulse = (isAdmin: boolean) => {
    return useQuery<PulseEntry[]>({
        queryKey: ['admin-system-pulse'],
        queryFn: async () => {
            const res = await AdminAPI.getSystemPulse();
            // Fix [TS-01]: was using (data as any).pulse — now typed correctly
            const data = unwrap(res.data) as { pulse: PulseEntry[] };
            return data.pulse ?? [];
        },
        enabled: isAdmin,
        staleTime: 10000,
    });
};

type TrafficEntry = { name: string; sent: number; received: number };

export const useTrafficStats = (isAdmin: boolean) => {
    return useQuery<TrafficEntry[]>({
        queryKey: ['admin-traffic-stats'],
        queryFn: async () => {
            const res = await AdminAPI.getTraffic();
            // Fix [TS-02]: was using double-cast `as unknown as T[]`
            return unwrap(res.data) as TrafficEntry[];
        },
        enabled: isAdmin,
        staleTime: 60000,
    });
};

export const useLicenseRegistry = (isAdmin: boolean, options?: { page?: number; limit?: number; search?: string; status?: string }) => {
    return useQuery<PaginatedResponse<LicenseDTO>>({
        queryKey: ['licenses', options?.page, options?.limit, options?.search, options?.status],
        queryFn: async () => {
            const res = await AdminLicenseAPI.getAll({
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

export const useGenerateLicense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { targetName?: string }) => AdminLicenseAPI.generate(data.targetName || ''),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['licenses'] });
        },
    });
};

export const usePauseLicense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => AdminLicenseAPI.pause(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['licenses'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUnpauseLicense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => AdminLicenseAPI.unpause(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['licenses'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useRevokeLicense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => AdminLicenseAPI.revoke(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['licenses'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};
