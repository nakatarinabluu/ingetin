import React, { useMemo } from 'react';
import { Search, Globe, Activity, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChatThreadDTO } from '@ingetin/types';
import { cn } from '../../../utils/tw.utils';
import { Typography } from '../../../components/ui/Typography';

type ThreadFilter = 'ALL' | 'VERIFIED' | 'UNVERIFIED';

interface ChatSidebarProps {
    threads: ChatThreadDTO[];
    loadingThreads: boolean;
    isConnected: boolean;
    searchTerm: string;
    setSearchString: (val: string) => void;
    activeFilter: ThreadFilter;
    setActiveFilter: (filter: ThreadFilter) => void;
    selectedPhone: string | null;
    setSelectedPhone: (val: string | null) => void;
    handleSelectThread: (phone: string) => void;
    stats: {
        verifiedUnread?: number;
        verified?: number;
        unverifiedUnread?: number;
        unverified?: number;
    };
}

/**
 * 🚀 THE MODERN PRO CHAT SIDEBAR - v9.0
 */
export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    threads, loadingThreads, isConnected, searchTerm, setSearchString, 
    activeFilter, setActiveFilter, selectedPhone, setSelectedPhone, 
    handleSelectThread, stats
}) => {
    const queryClient = useQueryClient();

    const filteredThreads = useMemo(() => threads.filter((t: ChatThreadDTO) => 
        t.phoneNumber.includes(searchTerm) || 
        (t.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [threads, searchTerm]);

    return (
        <div className="flex flex-col h-full bg-white min-h-0 text-left">
            {/* 01. REGISTRY HEADER */}
            <div className="p-6 border-b border-border space-y-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Typography variant="small" className="font-bold tracking-[0.2em] text-[10px] uppercase text-muted-foreground/40">Sinyal Masuk</Typography>
                        <button 
                            onClick={() => {
                                queryClient.invalidateQueries({ queryKey: ['chats'] });
                                if (selectedPhone) queryClient.invalidateQueries({ queryKey: ['thread', selectedPhone] });
                                toast.success('Registry Disegarkan');
                            }}
                            className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground/30 hover:text-accent group"
                        >
                            <RefreshCw size={12} className={cn("transition-transform", loadingThreads && 'animate-spin text-accent')} />
                        </button>
                    </div>
                    <div className={cn(
                        "flex items-center gap-2 px-2.5 py-1 rounded-full border shadow-sm transition-all animate-in fade-in zoom-in-95",
                        isConnected ? "bg-accent/5 border-accent/10 text-accent" : "bg-destructive/5 border-destructive/10 text-destructive"
                    )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? 'bg-accent animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-destructive')} />
                        <span className="font-bold text-[9px] tracking-widest uppercase">
                            {isConnected ? 'LIVE' : 'OFFLINE'}
                        </span>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-accent transition-colors" strokeWidth={2.5} />
                    <input 
                        type="text" 
                        placeholder="Cari dalam registry..."
                        value={searchTerm}
                        onChange={(e) => setSearchString(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-secondary border border-transparent rounded-xl focus:bg-white focus:border-accent/40 focus:shadow-sm transition-all outline-none text-xs font-medium placeholder:text-muted-foreground/30"
                    />
                </div>

                <div className="flex bg-secondary p-1 rounded-xl border border-border/50">
                    <FilterButton 
                        label="Akun" 
                        active={activeFilter === 'VERIFIED'} 
                        onClick={() => { setActiveFilter('VERIFIED'); setSelectedPhone(null); }}
                        unreadCount={stats.verifiedUnread}
                        totalCount={stats.verified}
                    />
                    <FilterButton 
                        label="Tamu" 
                        active={activeFilter === 'UNVERIFIED'} 
                        onClick={() => { setActiveFilter('UNVERIFIED'); setSelectedPhone(null); }}
                        unreadCount={stats.unverifiedUnread}
                        totalCount={stats.unverified}
                    />
                </div>            
            </div>
            
            {/* 02. THREAD LIST */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 touch-pan-y scroll-smooth">
                {loadingThreads ? (
                    <div className="p-6 space-y-3">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-16 bg-secondary animate-pulse rounded-xl border border-border/40" />)}
                    </div>
                ) : filteredThreads.length > 0 ? (
                    <div className="divide-y divide-border/40 px-2 lg:px-4">
                        {filteredThreads.map((thread: ChatThreadDTO) => (
                            <button
                                key={thread.phoneNumber}
                                onClick={() => handleSelectThread(thread.phoneNumber)}
                                className={cn(
                                    "w-full p-4 my-1 flex items-center gap-4 transition-all rounded-xl relative group text-left",
                                    selectedPhone === thread.phoneNumber ? 'bg-secondary' : 'hover:bg-secondary/40'
                                )}
                            >
                                {selectedPhone === thread.phoneNumber && (
                                    <motion.div layoutId="active-thread-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-accent rounded-full" />
                                )}
                                
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary border border-border group-hover:border-accent/30 transition-all shadow-sm">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(thread.username || thread.phoneNumber || 'ingetin').toLowerCase()}&backgroundColor=F1F5F9`} className="w-full h-full object-cover transition-all" alt="Avatar" crossOrigin="anonymous" />
                                    </div>
                                    {!thread.isRegistered && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-lg border-2 border-white flex items-center justify-center text-primary-foreground shadow-sm">
                                            <Globe size={8} strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <Typography variant="h4" className={cn(
                                            "text-sm font-bold tracking-tight truncate",
                                            thread.unreadCount > 0 ? 'text-accent' : 'text-foreground'
                                        )}>
                                            {thread.username || `+${thread.phoneNumber}`}
                                        </Typography>
                                        <span className={cn(
                                            "font-bold text-[9px] tabular-nums tracking-widest uppercase",
                                            thread.unreadCount > 0 ? 'text-accent' : 'text-muted-foreground/30'
                                        )}>
                                            {new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center gap-3">
                                        <Typography variant="p" className={cn(
                                            "text-[11px] font-medium truncate",
                                            thread.unreadCount > 0 ? 'text-foreground font-bold' : 'text-muted-foreground/60'
                                        )}>
                                            {thread.body}
                                        </Typography>
                                        {thread.unreadCount > 0 && (
                                            <div className="flex-shrink-0 min-w-[18px] h-[18px] bg-accent rounded-full flex items-center justify-center px-1.5 shadow-md shadow-accent/20">
                                                <span className="text-[9px] font-bold text-white leading-none">{thread.unreadCount}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center flex flex-col items-center gap-6 opacity-20">
                        <Activity size={32} strokeWidth={2.5} className="mx-auto" />
                        <Typography variant="small" className="font-bold uppercase tracking-[0.4em] text-[10px]">Registry Kosong</Typography>
                    </div>
                )}
            </div>
        </div>
    );
}

function FilterButton({ label, active, onClick, unreadCount, totalCount }: { label: string, active: boolean, onClick: () => void, unreadCount?: number, totalCount?: number }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 relative shadow-sm",
                active ? 'bg-white text-primary border border-border' : 'text-muted-foreground/40 hover:text-muted-foreground'
            )}
        >
            <span className="flex items-center gap-2">
                {label}
                {totalCount !== undefined && <span className="text-[9px] opacity-30 tabular-nums">[{totalCount}]</span>}
            </span>
            {unreadCount !== undefined && unreadCount > 0 && (
                <div className="px-1.5 py-0.5 min-w-[18px] h-4 bg-accent text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </div>
            )}
        </button>
    );
}
