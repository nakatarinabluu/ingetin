import React from 'react';
import { useReminders, useMessages } from '../../hooks/useWhatsApp';
import MainAppLayout from '../../layouts/MainAppLayout';
import { useProfileAction } from '../../hooks/useProfileAction';

// Components
import { ProfileHeader } from './profile/ProfileHeader';
import { ProfileAccountSummary } from './profile/ProfileAccountSummary';
import { ProfileAnalytics } from './profile/ProfileAnalytics';
import { ProfileInfoDisplay } from './profile/ProfileInfoDisplay';
import { ProfileForms } from './profile/ProfileForms';
import { ProfileConfirmModal } from './profile/ProfileConfirmModal';

export default function ProfileView() {
    const action = useProfileAction();
    const { data: reminderData } = useReminders({ page: 1, limit: 1 });
    const { data: messageData } = useMessages('monitor', { page: 1, limit: 50 });
    
    if (action.isLoading) return (
        <MainAppLayout title="Profile" subtitle="Loading your account...">
            <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="w-10 h-10 border-2 border-slate-100 border-t-[#25D366] rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em]">Almost there...</p>
            </div>
        </MainAppLayout>
    );

    const { user } = action;
    const isAdmin = user?.role === 'ADMIN';
    const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '---';
    const lastSeen = user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today';

    const successRate = messageData?.messages?.length > 0 
        ? Math.round((messageData.messages.filter((m: any) => m.status === 'SENT' || m.status === 'DELIVERED').length / messageData.messages.length) * 100)
        : 100;

    return (
        <MainAppLayout 
            title={isAdmin ? "Admin Account" : "My Profile"} 
            subtitle={isAdmin ? "Manage your admin account." : "Manage your account."}
        >
            <div className="w-full p-6 lg:p-8 space-y-8 pb-20">
                
                <ProfileHeader 
                    user={user} 
                    isAdmin={isAdmin} 
                    memberSince={memberSince} 
                    formMode={action.formMode} 
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* --- LEFT: SUMMARY & ANALYTICS --- */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-8">
                            <ProfileAccountSummary user={user} isAdmin={isAdmin} />
                            {!isAdmin && (
                                <ProfileAnalytics 
                                    totalSchedules={reminderData?.pagination?.total || 0} 
                                    successRate={successRate} 
                                />
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT: INFORMATION / FORMS --- */}
                    <div className="lg:col-span-8">
                        {action.formMode === 'none' ? (
                            <ProfileInfoDisplay 
                                user={user} 
                                isAdmin={isAdmin} 
                                lastSeen={lastSeen} 
                                onStartEditDetails={action.startEditDetails}
                                onStartEditPassword={action.startEditPassword} 
                            />
                        ) : (
                            <ProfileForms 
                                formMode={action.formMode}
                                message={action.message}
                                isAdmin={isAdmin}
                                firstName={action.firstName}
                                setFirstName={action.setFirstName}
                                lastName={action.lastName}
                                setLastName={action.setLastName}
                                email={action.email}
                                setEmail={action.setEmail}
                                password={action.password}
                                setPassword={action.setPassword}
                                confirmPassword={action.confirmPassword}
                                setConfirmPassword={action.setConfirmPassword}
                                isUpdating={action.isUpdating}
                                onCancel={action.resetForm}
                                onSubmit={action.validateAndOpenModal}
                            />
                        )}
                    </div>
                </div>
            </div>

            <ProfileConfirmModal 
                show={action.showConfirmModal}
                formMode={action.formMode}
                isAdmin={isAdmin}
                onConfirm={action.executeUpdate}
                onCancel={() => action.setShowConfirmModal(false)}
            />
        </MainAppLayout>
    );
}
