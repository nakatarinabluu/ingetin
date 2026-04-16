import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserAPI } from '../api/user.api';
import { AuthAPI } from '../api/auth.api';
import { 
    UserDTO, 
    UpdateProfileInput, 
    PaginatedResponse 
} from '@ingetin/types';
import { unwrap } from '../utils/api.utils';
import { Profile } from '../types';

export const useProfile = () => {
    return useQuery<Profile>({
        queryKey: ['profile'],
        queryFn: async () => {
            const res = await UserAPI.getProfile();
            return unwrap(res.data);
        },
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

export const useUserDetails = (userId: string | null) => {
    return useQuery<UserProfile | null>({
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
