import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSyncCalendar } from './useReminderHooks';
import { useUnlinkPhone, useUnlinkGoogle } from './useUserHooks';
import type { UserProfile } from '../types';
import { toast } from 'sonner';

export const useDashboardAction = (profile: UserProfile | null) => {
    const [searchParams] = useSearchParams();
    const [calendarStatus, setCalendarStatus] = useState<'success' | 'error' | null>(null);
    const [isLinking, setIsLinking] = useState(false);
    
    const { mutate: syncCalendar } = useSyncCalendar();
    const unlinkPhoneMutation = useUnlinkPhone();
    const unlinkGoogleMutation = useUnlinkGoogle();

    useEffect(() => {
        if (profile?.id && profile?.googleRefreshToken) {
            syncCalendar();
        }
    }, [profile?.id, profile?.googleRefreshToken]);

    useEffect(() => {
        const calendar = searchParams.get('calendar');
        if (calendar === 'success') {
            setCalendarStatus('success');
            setTimeout(() => setCalendarStatus(null), 5000);
        } else if (calendar === 'error') {
            setCalendarStatus('error');
            setTimeout(() => setCalendarStatus(null), 5000);
        }
    }, [searchParams]);

    const handleConnectCalendar = () => {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        window.location.href = `${apiUrl}/api/auth/google`;
    };

    const handleUnlinkPhone = async () => {
        try {
            await unlinkPhoneMutation.mutateAsync();
        } catch (err) {
            console.error('Failed to unlink phone', err);
        }
    };

    const handleUnlinkGoogle = async () => {
        try {
            await unlinkGoogleMutation.mutateAsync();
        } catch (err) {
            toast.error('Failed to unlink google');
            alert('Failed to unlink google');
        }
    };

    return {
        calendarStatus,
        isLinking,
        setIsLinking,
        handleConnectCalendar,
        handleUnlinkPhone,
        handleUnlinkGoogle,
        unlinkPhoneLoading: unlinkPhoneMutation.isPending,
        unlinkGoogleLoading: unlinkGoogleMutation.isPending
    };
};
