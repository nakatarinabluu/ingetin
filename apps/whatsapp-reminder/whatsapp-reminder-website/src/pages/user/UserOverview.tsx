import React, { useState } from 'react';
import { MessageCircle, AlertTriangle, Smartphone, Globe } from 'lucide-react';
import { useProfile, useReminders, useMessages } from '../../hooks/useWhatsApp';
import { useAuth } from '../../context/AuthContext';
import { useDashboardAction } from '../../hooks/useDashboardAction';
import MainAppLayout from '../../layouts/MainAppLayout';
import OTPVerification from '../../components/features/whatsapp/OTPVerification';
import { Modal } from '../../components/ui';

import { DashboardHeader } from '../../components/parts/dashboard/DashboardHeader';
import { DashboardStatsGrid } from '../../components/parts/dashboard/DashboardStatsGrid';
import { DashboardConnections } from '../../components/parts/dashboard/DashboardConnections';
import { DashboardCalendarStatus } from '../../components/parts/dashboard/DashboardCalendarStatus';
import { DashboardUpcomingQueue } from '../../components/parts/dashboard/DashboardUpcomingQueue';

export default function UserOverview() {
    const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
    const { data: reminderData, refetch: refetchReminders } = useReminders({ page: 1, limit: 5 });
    
    const {
        isLinking,
        setIsLinking,
        handleConnectCalendar,
        handleUnlinkPhone,
        handleUnlinkGoogle,
        unlinkPhoneLoading,
        unlinkGoogleLoading
    } = useDashboardAction(profile);

    const [showUnlinkPhoneConfirm, setShowUnlinkPhoneConfirm] = useState(false);
    const [showUnlinkGoogleConfirm, setShowUnlinkGoogleConfirm] = useState(false);

    const { user: authUser, refreshUser } = useAuth();
    React.useEffect(() => {
        if (profile && profile.isActivated !== authUser?.isActivated) {
            refreshUser({ isActivated: profile.isActivated });
        }
    }, [profile, authUser, refreshUser]);

    if (profileLoading) return (
        <MainAppLayout title="Dashboard" subtitle="Loading...">
            <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="w-10 h-10 border-2 border-slate-100 border-t-[#25D366] rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em]">Loading...</p>
            </div>
        </MainAppLayout>
    );

    const googleReminders = reminderData?.reminders
        ?.filter((r: { externalId?: string }) => r.externalId?.startsWith('google_'))
        ?.slice(0, 3) || [];

    return (
        <MainAppLayout 
            title="Dashboard" 
            subtitle={`Welcome back, ${profile?.firstName || 'User'}`}
        >
            <div className="w-full p-6 lg:p-8 space-y-8 pb-20">
                <DashboardHeader firstName={profile?.firstName || 'User'} />
                <DashboardStatsGrid 
                    totalReminders={reminderData?.pagination?.total || 0}
                    successRate={100} 
                />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-4 space-y-6">
                        <DashboardConnections 
                            whatsappNumber={profile?.phoneNumber || null}
                            isGoogleConnected={!!profile?.googleRefreshToken}
                            onLinkPhone={() => setIsLinking(true)}
                            onUnlinkPhone={() => setShowUnlinkPhoneConfirm(true)}
                            onLinkGoogle={handleConnectCalendar}
                            onUnlinkGoogle={() => setShowUnlinkGoogleConfirm(true)}
                            unlinkPhoneLoading={unlinkPhoneLoading}
                            unlinkGoogleLoading={unlinkGoogleLoading}
                        />
                        <DashboardCalendarStatus events={googleReminders} />
                    </div>
                    <div className="lg:col-span-8 space-y-6 h-full">
                        <DashboardUpcomingQueue 
                            reminders={reminderData?.reminders || []}
                            onUpdate={refetchReminders}
                        />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isLinking}
                onClose={() => setIsLinking(false)}
                title="Connect WhatsApp"
                subtitle="Connect your WhatsApp number to get reminders."
                icon={<MessageCircle />}
                footer={
                    <div className="flex gap-3">
                        <button onClick={() => setIsLinking(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-[13px] text-slate-500 hover:bg-slate-50 transition-all shadow-sm">Cancel</button>
                        <button form="otp-handshake-form" type="submit" className="flex-1 bg-[#25D366] hover:bg-[#1eb956] text-white py-3 rounded-xl font-bold text-[13px] shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2">Connect</button>
                    </div>
                }
            >
                <OTPVerification headless={true} onSuccess={() => { setIsLinking(false); refetchProfile(); }} />
            </Modal>

            <Modal
                isOpen={showUnlinkPhoneConfirm}
                onClose={() => setShowUnlinkPhoneConfirm(false)}
                title="Disconnect WhatsApp"
                subtitle="Are you sure? This will stop all your scheduled reminders immediately."
                icon={<AlertTriangle className="text-rose-500" />}
                footer={
                    <div className="flex gap-3">
                        <button onClick={() => setShowUnlinkPhoneConfirm(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-[13px] text-slate-500 hover:bg-slate-50 transition-all shadow-sm">Keep Connected</button>
                        <button onClick={() => { handleUnlinkPhone(); setShowUnlinkPhoneConfirm(false); }} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-bold text-[13px] shadow-lg transition-all active:scale-[0.98]">Yes, Disconnect</button>
                    </div>
                }
            >
                <div />
            </Modal>

            <Modal
                isOpen={showUnlinkGoogleConfirm}
                onClose={() => setShowUnlinkGoogleConfirm(false)}
                title="Disconnect Google"
                subtitle="Remove access to your Google Calendar? Your reminders from Google will no longer sync."
                icon={<Globe className="text-blue-500" />}
                footer={
                    <div className="flex gap-3">
                        <button onClick={() => setShowUnlinkGoogleConfirm(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-[13px] text-slate-500 hover:bg-slate-50 transition-all shadow-sm">Keep Access</button>
                        <button onClick={() => { handleUnlinkGoogle(); setShowUnlinkGoogleConfirm(false); }} className="flex-1 bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-[13px] shadow-lg transition-all active:scale-[0.98]">Yes, Disconnect</button>
                    </div>
                }
            >
                <div />
            </Modal>
        </MainAppLayout>
    );
}