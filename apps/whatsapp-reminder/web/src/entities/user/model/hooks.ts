import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserAPI, AuthAPI } from '@/entities/user/api';
import { UpdateProfileInput } from '@ingetin/types';
import { unwrap } from '@/shared/lib/api.utils';
import { Profile } from '@ingetin/types';

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
