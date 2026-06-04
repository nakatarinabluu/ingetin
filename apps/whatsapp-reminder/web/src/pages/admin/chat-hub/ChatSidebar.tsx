import React from 'react';
import { 
    Search, 
    MessageCircle, 
    ShieldCheck, 
    Wifi
} from 'lucide-react';
import { ChatThreadDTO } from '@ingetin/types';
import { cn } from '@/shared/lib/tw.utils';
import { AnimatePresence } from 'framer-motion';

interface ChatSidebarProps {
    threads: ChatThreadDTO[];
    loadingThreads: boolean;
    isConnected: boolean;
    searchTerm: string;
    setSearchString: (s: string) => void;
    activeFilter: 'ALL' | 'VERIFIED' | 'UNVERIFIED';
    setActiveFilter: (f: 'ALL' | 'VERIFIED' | 'UNVERIFIED') => void;
    selectedPhone: string | null;
    setSelectedPhone: (p: string | null) => void;
    handleSelectThread: (p: string) => void;
    stats: {
        total: number;
        verified: number;
        unverified: number;
    };
}

/**
 * 🚀 CHAT SIDEBAR — WHATSAPP OFFICIAL STYLE
 * Concept: Clinical, Professional Hub.
 */
export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    threads,
    loadingThreads,
    isConnected,
    searchTerm,
    setSearchString,
    activeFilter,
    setActiveFilter,
    selectedPhone,
    handleSelectThread,
    stats
}) => {
    return (
        <div className="flex flex-col h-full bg-white">
            
            {/* 1. Header & Status */}
            <div className="p-4 bg-wa-bg border-b border-wa-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-wa-green/10 flex items-center justify-center border border-wa-green/20">
                        <ShieldCheck size={20} className="text-wa-green" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-wa-dark">Chat Hub Admin</h2>
                        <div className="flex items-center gap-1.5">
                            <span className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-wa-green" : "bg-red-500")} />
                            <span className="text-[10px] font-bold text-wa-icon uppercase tracking-wider">
                                {isConnected ? "Live Engine" : "Offline"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-wa-icon hover:bg-wa-border rounded-full transition-colors">
                        <Wifi size={18} />
                    </button>
                </div>
            </div>

            {/* 2. Search & Filters */}
            <div className="p-3 space-y-3">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wa-icon" />
                    <input 
                        type="text"
                        placeholder="Cari chat atau nomor..."
                        value={searchTerm}
                        onChange={(e) => setSearchString(e.target.value)}
                        className="w-full h-9 bg-wa-bg border-none rounded-lg pl-10 pr-4 text-sm focus:ring-1 focus:ring-wa-green placeholder:text-wa-icon/60"
                    />
                </div>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <FilterTab label="Semua" active={activeFilter === 'ALL'} onClick={() => setActiveFilter('ALL')} count={stats.total} />
                    <FilterTab label="Terverifikasi" active={activeFilter === 'VERIFIED'} onClick={() => setActiveFilter('VERIFIED')} count={stats.verified} />
                    <FilterTab label="Umum" active={activeFilter === 'UNVERIFIED'} onClick={() => setActiveFilter('UNVERIFIED')} count={stats.unverified} />
                </div>
            </div>

            {/* 3. Thread List */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
                <AnimatePresence mode="popLayout">
                    {loadingThreads ? (
                        Array(6).fill(0).map((_, i) => <SkeletonThread key={i} />)
                    ) : threads.length > 0 ? (
                        threads.map((thread) => (
                            <ThreadItem 
                                key={thread.phoneNumber}
                                thread={thread}
                                isActive={selectedPhone === thread.phoneNumber}
                                onClick={() => handleSelectThread(thread.phoneNumber)}
                            />
                        ))
                    ) : (
                        <div className="py-20 text-center px-8">
                            <MessageCircle size={32} className="mx-auto text-wa-border mb-3" />
                            <p className="text-sm font-semibold text-wa-icon">Antrean chat kosong</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

function FilterTab({ label, active, onClick, count }: { label: string, active: boolean, onClick: () => void, count?: number }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 border",
                active 
                    ? "bg-wa-green-light text-wa-teal border-[#c0eab9]" 
                    : "bg-wa-bg text-wa-icon border-transparent hover:bg-wa-border"
            )}
        >
            {label} {count !== undefined && <span className="ml-1 opacity-60">({count})</span>}
        </button>
    );
}

function ThreadItem({ thread, isActive, onClick }: { thread: ChatThreadDTO, isActive: boolean, onClick: () => void }) {
    const time = new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
        <button 
            onClick={onClick}
            className={cn(
                "w-full px-4 py-3 flex gap-3 border-b border-wa-bg transition-colors relative",
                isActive ? "bg-wa-bg" : "hover:bg-[#fcfcfc]"
            )}
        >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-wa-bg shrink-0 border border-wa-border">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${thread.phoneNumber}`} alt="Avatar" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <h4 className="text-[15px] font-bold text-wa-dark truncate">
                            {thread.username || `+${thread.phoneNumber}`}
                        </h4>
                        {thread.isVerified && <ShieldCheck size={14} className="text-wa-green shrink-0" />}
                    </div>
                    <span className={cn("text-[10px] font-medium", thread.unreadCount > 0 ? "text-wa-green font-bold" : "text-wa-muted")}>
                        {time}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <p className={cn(
                        "text-xs truncate max-w-[200px]",
                        thread.unreadCount > 0 ? "text-wa-dark font-bold" : "text-wa-muted"
                    )}>
                        {thread.body}
                    </p>
                    {thread.unreadCount > 0 && (
                        <span className="bg-wa-green text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                            {thread.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}

function SkeletonThread() {
    return (
        <div className="p-4 flex gap-3 border-b border-wa-bg animate-pulse">
            <div className="w-12 h-12 rounded-full bg-wa-bg" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-wa-bg rounded w-1/2" />
                <div className="h-3 bg-wa-bg rounded w-3/4" />
            </div>
        </div>
    );
}
