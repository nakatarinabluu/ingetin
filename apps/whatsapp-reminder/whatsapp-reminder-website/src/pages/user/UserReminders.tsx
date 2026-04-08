import React, { useState } from 'react';
import { Send, RefreshCw, Zap, Lock, Grid, List as ListIcon, Plus, MessageCircle, Clock, Calendar, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useProfile, useReminders } from '../../hooks/useWhatsApp';
import MainAppLayout from '../../layouts/MainAppLayout';
import ReminderForm from '../../components/features/whatsapp/ReminderForm';
import ReminderList from '../../components/features/whatsapp/ReminderList';

export default function UserReminders() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [reminderPage, setReminderPage] = useState(1);
    
    const view = (searchParams.get('mode') as 'list' | 'create') || 'list';
    const setView = (mode: string) => setSearchParams({ mode });

    // Force scroll to top on view change (Fixes mobile glitch)
    React.useEffect(() => {
        window.scrollTo(0, 0);
        const container = document.getElementById('main-scroll-container');
        if (container) {
            container.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, [view]);

    const { data: profile, isLoading: profileLoading } = useProfile();
    const { data: reminderData, refetch: refetchReminders } = useReminders({ page: reminderPage, limit: 10 });

    const isSetupComplete = profile?.phoneNumber && profile?.googleRefreshToken;
    const isRestrictedView = true;
    const showSetupOverlay = !profileLoading && !isSetupComplete && isRestrictedView && profile?.role !== 'ADMIN';

    const activeMeta = view === 'list' 
        ? { title: 'My Scheduled Reminders', subtitle: 'Manage your reminders and messages.' }
        : { title: 'Create Reminder', subtitle: 'Create a new reminder.' };

    if (profileLoading) return (
        <MainAppLayout title={activeMeta.title} subtitle="Loading...">
            <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="w-10 h-10 border-2 border-slate-100 border-t-[#25D366] rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em]">Just a moment...</p>
            </div>
        </MainAppLayout>
    );

    return (
        <MainAppLayout 
            title={activeMeta.title}
            subtitle={activeMeta.subtitle}
        >
            <div className="w-full p-6 lg:p-10 space-y-8 pb-20">
                
                {/* --- SETUP OVERLAY --- */}
                {showSetupOverlay && (
                    <div className="fixed inset-0 z-[100] backdrop-blur-md bg-slate-900/40 flex items-center justify-center p-6">
                        <div className="bg-white max-w-lg w-full p-8 text-center rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center">
                            <div className="w-16 h-16 bg-[#25D366] rounded-xl flex items-center justify-center text-white shadow-xl mb-6 border-4 border-slate-50">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-[20px] font-bold text-[#0F172A] mb-2 tracking-tight">Finish Setting Up</h2>
                            <p className="text-slate-500 text-[13px] font-medium leading-relaxed mb-8 px-4">
                                To authorize automated messaging, you must link your WhatsApp account and Google Calendar stream via the dashboard.
                            </p>
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="bg-[#25D366] hover:bg-[#1eb956] text-white w-full py-3.5 rounded-xl font-bold text-[13px] shadow-lg shadow-[#25D366]/10 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
                            >
                                <RefreshCw size={16} />
                                <span>Return to Dashboard</span>
                            </button>
                        </div>
                    </div>
                )}

                {view === 'create' ? (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#25D366]/5 blur-3xl -mr-32 -mt-32 rounded-full" />
                            
                            <header className="mb-8 relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-[#25D366] border border-slate-100">
                                        <Plus size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-[18px] font-bold text-[#0F172A] tracking-tight leading-none">New Reminder</h2>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Quick Setup</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setView('list')}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                    <ArrowLeft size={14} />
                                    Back to My List
                                </button>
                            </header>

                            <div className="relative z-10">
                                <ReminderForm 
                                    hasPhone={!!profile?.phoneNumber} 
                                    onSuccess={() => {
                                        refetchReminders();
                                        setView('list');
                                    }} 
                                    onCancel={() => setView('list')}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* --- TOP BAR --- */}
                        <header className="flex flex-col md:flex-row justify-between items-center bg-white px-8 py-5 rounded-2xl border border-slate-200 shadow-sm gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#25D366] border border-slate-100 shadow-inner">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <h2 className="text-[18px] font-bold text-[#0F172A] tracking-tight leading-none">Active Reminders</h2>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="w-1 h-1 rounded-full bg-[#25D366] animate-pulse" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {reminderData?.pagination?.total || 0} Scheduled Reminders
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setView('create')}
                                className="bg-[#25D366] hover:bg-[#1eb956] text-white px-6 py-2.5 rounded-xl font-bold text-[12px] shadow-lg shadow-[#25D366]/10 transition-all flex items-center justify-center gap-2.5 w-full md:w-auto active:scale-[0.98] uppercase tracking-widest"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Schedule New</span>
                            </button>
                        </header>
                        
                        {/* --- LIST --- */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                            <ReminderList 
                                reminders={reminderData?.reminders || []} 
                                pagination={reminderData?.pagination}
                                onPageChange={setReminderPage}
                                onUpdate={() => {
                                    refetchReminders();
                                }} 
                            />
                        </div>
                    </div>
                )}
            </div>
        </MainAppLayout>
    );
}
