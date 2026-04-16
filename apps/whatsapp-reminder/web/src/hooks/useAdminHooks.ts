import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPI } from '../api/admin.api';
import { LicenseAPI } from '../api/user.api'; // Assuming LicenseAPI is there or move it to license.api
import { 
    LicenseDTO, 
    PaginatedResponse 
} from '@ingetin/types';
import { unwrap } from '../utils/api.utils';
import { DashboardStats, ProviderHealth, PulseEntry } from '../types';

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
            return res.data.success ? res.data.data.pulse || [] : [];
        },
        enabled: isAdmin,
        staleTime: 10000,
    });
};

export const useLicenseRegistry = (isAdmin: boolean, options?: { page?: number; limit?: number; search?: string; status?: string }) => {
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
