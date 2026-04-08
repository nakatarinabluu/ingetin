import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, 
    MoreVertical, 
    CheckCircle2, 
    Activity,
    Smartphone,
    Globe,
    ChevronLeft,
    Database,
    Shield,
    MessageCircle,
    ChevronDown,
    Volume2,
    VolumeX
} from 'lucide-react';
import { useChatThreads, useThreadHistory, useMarkAsRead } from '../../hooks/useWhatsApp';
import MainAppLayout from '../../layouts/MainAppLayout';

type ThreadFilter = 'ALL' | 'VERIFIED' | 'UNVERIFIED';

export default function AdminChatHub() {
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
    const [searchTerm, setSearchString] = useState('');
    const [activeFilter, setActiveFilter] = useState<ThreadFilter>('VERIFIED');
    const [showNewMessageNotice, setShowNewMessageNotice] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [readyForRead, setReadyForRead] = useState(false);
    const [isWindowFocused, setIsWindowFocused] = useState(document.hasFocus());
    const unreadRef = useRef<HTMLDivElement>(null);
    const notificationSound = useRef<HTMLAudioElement | null>(null);
    
    const { data: threadsData, isLoading: loadingThreads } = useChatThreads(true, { 
        page: 1, 
        limit: 100,
        filter: activeFilter 
    });
    
    const { data: historyData, isLoading: loadingHistory } = useThreadHistory(selectedPhone || '');
    const markAsRead = useMarkAsRead();
    const scrollRef = useRef<HTMLDivElement>(null);

    const history = historyData?.messages || [];
    const threads = threadsData?.chats || [];
    const stats = threadsData?.stats || { 
        total: 0, 
        registered: 0, 
        anonymous: 0,
        verified: 0,
        unverified: 0,
        verifiedUnread: 0,
        unverifiedUnread: 0
    };
    const selectedUser = threads.find((t: any) => t.phoneNumber === selectedPhone);

    // Track window focus to prevent auto-read when away
    useEffect(() => {
        const onFocus = () => setIsWindowFocused(true);
        const onBlur = () => setIsWindowFocused(false);
        window.addEventListener('focus', onFocus);
        window.addEventListener('blur', onBlur);
        return () => {
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('blur', onBlur);
        };
    }, []);

    // Initialize notification sound
    useEffect(() => {
        notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    }, []);

    // Tab title notification logic
    useEffect(() => {
        const totalUnread = (stats.verifiedUnread || 0) + (stats.unverifiedUnread || 0);
        const originalTitle = "Ingetin | Admin";
        
        if (totalUnread > 0) {
            document.title = `(${totalUnread}) New Signals | Ingetin`;
            
            // Sound notification on new message arrive
            const lastMessage = history[history.length - 1];
            if (lastMessage?.direction === 'INBOUND' && !isMuted) {
                notificationSound.current?.play().catch(() => {});
            }
        } else {
            document.title = originalTitle;
        }
        
        return () => { document.title = originalTitle; };
    }, [stats.verifiedUnread, stats.unverifiedUnread, history.length]);

    // Track scroll position
    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const atBottom = scrollHeight - scrollTop - clientHeight < 30;
            setIsAtBottom(atBottom);
            
            if (atBottom && readyForRead && isWindowFocused) {
                setShowNewMessageNotice(false);
                setFirstUnreadId(null); // Clear the unread line when hitting bottom
                if (selectedPhone && selectedUser?.unreadCount > 0) {
                    markAsRead.mutate(selectedPhone);
                }
            }
        }
    };

    // Capture the first unread message ID when opening a chat
    useEffect(() => {
        if (selectedPhone && history.length > 0 && !loadingHistory && !firstUnreadId) {
            const unread = history.find((m: any) => m.direction === 'INBOUND' && m.status === 'DELIVERED');
            if (unread) {
                setFirstUnreadId(unread.id);
            }
        }
    }, [selectedPhone, history, loadingHistory]);

    useEffect(() => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const lastMessage = history[history.length - 1];
            const isOutbound = lastMessage?.direction === 'OUTBOUND';

            if (isAtBottom || isOutbound) {
                container.scrollTop = container.scrollHeight;
                setShowNewMessageNotice(false);
                
                // Auto mark as read ONLY if window is focused
                if (selectedPhone && selectedUser?.unreadCount > 0 && (isAtBottom || isOutbound) && readyForRead && isWindowFocused) {
                    markAsRead.mutate(selectedPhone);
                }
            } else if (history.length > 0) {
                setShowNewMessageNotice(true);
            }
        }
    }, [history, selectedUser?.unreadCount, selectedPhone, readyForRead, isWindowFocused]);

    // If window regains focus and we are at the bottom, mark as read
    useEffect(() => {
        if (isWindowFocused && isAtBottom && selectedPhone && selectedUser?.unreadCount > 0 && readyForRead) {
            markAsRead.mutate(selectedPhone);
        }
    }, [isWindowFocused]);

    // Scroll to unread or bottom when changing chat
    useEffect(() => {
        if (selectedPhone && scrollRef.current && !loadingHistory) {
            setReadyForRead(false); // Lock read state during initial jump
            
            setTimeout(() => {
                if (unreadRef.current) {
                    unreadRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
                    setIsAtBottom(false);
                } else if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                    setIsAtBottom(true);
                }
                setShowNewMessageNotice(false);
                
                // Unlock after scroll finishes
                setTimeout(() => setReadyForRead(true), 200);
            }, 100);
        }
    }, [selectedPhone, loadingHistory]);

    // Reset local unread state when switching chat
    useEffect(() => {
        setFirstUnreadId(null);
        setReadyForRead(false);
    }, [selectedPhone]);

    const handleNewMessageClick = () => {
        if (scrollRef.current) {
            if (unreadRef.current) {
                // If there's an unread divider, scroll to it first so they can read from the start
                unreadRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setShowNewMessageNotice(false);
                // We DON'T set isAtBottom=true yet, because they are at the line, not the bottom
            } else {
                // Otherwise jump to absolute bottom
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                setShowNewMessageNotice(false);
                setIsAtBottom(true);
                setFirstUnreadId(null);
                if (selectedPhone) markAsRead.mutate(selectedPhone);
            }
        }
    };

    const handleSelectThread = (phone: string) => {
        if (selectedPhone === phone) return;
        setSelectedPhone(phone);
        const user = threads.find((t: any) => t.phoneNumber === phone);
        if (user && user.unreadCount === 0) {
            markAsRead.mutate(phone);
        }
    };

    const filteredThreads = threads.filter((t: any) => 
        t.phoneNumber.includes(searchTerm) || 
        (t.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- SIDEBAR CONTENT (SIGNAL LIST) ---
    const sidebar = (
        <div className="flex flex-col h-full bg-white min-h-0">
            <div className="p-4 border-b border-slate-50 space-y-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Signals</h3>
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-1.5 rounded-lg transition-all ${isMuted ? 'bg-rose-50 text-rose-500' : 'text-slate-300 hover:text-[#25D366] hover:bg-green-50'}`}
                    >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                        type="text" 
                        placeholder="Search registry..."
                        value={searchTerm}
                        onChange={(e) => setSearchString(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent rounded-lg focus:bg-white focus:border-[#25D366] transition-all outline-none text-[13px] placeholder:text-slate-400"
                    />
                </div>
                <div className="flex gap-1 p-1 bg-slate-50 rounded-lg">
                    <FilterButton 
                        label="Account Members" 
                        active={activeFilter === 'VERIFIED'} 
                        onClick={() => { setActiveFilter('VERIFIED'); setSelectedPhone(null); }}
                        unreadCount={stats.verifiedUnread}
                        totalCount={stats.verified}
                    />
                    <FilterButton 
                        label="Guest Signals" 
                        active={activeFilter === 'UNVERIFIED'} 
                        onClick={() => { setActiveFilter('UNVERIFIED'); setSelectedPhone(null); }}
                        unreadCount={stats.unverifiedUnread}
                        totalCount={stats.unverified}
                    />
                </div>            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 touch-pan-y">
                {loadingThreads ? (
                    <div className="p-4 space-y-3">
                        {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-slate-50 rounded-lg animate-pulse" />)}
                    </div>
                ) : filteredThreads.length > 0 ? (
                    filteredThreads.map((thread: any) => (
                        <button
                            key={thread.phoneNumber}
                            onClick={() => handleSelectThread(thread.phoneNumber)}
                            className={`w-full p-4 flex items-center gap-3 transition-all border-b border-slate-50 ${
                                selectedPhone === thread.phoneNumber ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                            }`}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(thread.username || thread.phoneNumber || 'ingetin').toLowerCase()}`} className="w-full h-full object-cover" alt="Avatar" crossOrigin="anonymous" />
                                </div>
                                {!thread.isRegistered && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#25D366] border-2 border-white rounded-full flex items-center justify-center text-white shadow-sm">
                                        <Globe size={8} strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <p className={`text-[14px] truncate ${thread.unreadCount > 0 ? 'font-black text-[#111b21]' : 'font-bold text-slate-700'}`}>{thread.fullName || `+${thread.phoneNumber}`}</p>
                                    <span className={`text-[10px] tabular-nums ${thread.unreadCount > 0 ? 'font-bold text-[#25D366]' : 'text-slate-400'}`}>
                                        {new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                    <p className={`text-[12px] truncate leading-relaxed ${thread.unreadCount > 0 ? 'font-bold text-slate-600' : 'text-slate-400'}`}>{thread.body}</p>
                                    {thread.unreadCount > 0 && (
                                        <div className="flex-shrink-0 min-w-[18px] h-[18px] bg-[#25D366] rounded-full flex items-center justify-center px-1">
                                            <span className="text-[10px] font-bold text-white leading-none">{thread.unreadCount}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="p-20 text-center space-y-2 opacity-20">
                        <Activity size={32} className="mx-auto" />
                        <p className="font-bold text-[10px] uppercase tracking-widest">No Signals</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <MainAppLayout 
            title={selectedUser ? (selectedUser.fullName || `+${selectedPhone}`) : undefined} 
            subtitle={selectedUser ? `+${selectedPhone}` : undefined}
            listTitle="Live Monitor"
            listSubtitle="Signal Stream"
            headerAvatarSeed={selectedUser ? (selectedUser.username || selectedPhone || undefined) : undefined}
            sidebarContent={sidebar}
            onBack={selectedPhone ? () => setSelectedPhone(null) : undefined}
        >
            <div className="h-full flex flex-col relative overflow-hidden">
                {selectedPhone ? (
                    <>
                        {/* CHAT AREA - Solid, consistent padding */}
                        <div 
                            ref={scrollRef} 
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-transparent"
                        >
                            {loadingHistory ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-slate-200 border-t-[#25D366] rounded-full animate-spin" />
                                </div>
                            ) : history.map((msg: any) => (
                                <React.Fragment key={msg.id}>
                                    {msg.id === firstUnreadId && (
                                        <div ref={unreadRef} className="flex justify-center my-6 sticky top-2 z-10">
                                            <div className="bg-white/80 backdrop-blur-sm border border-slate-100 px-4 py-1.5 rounded-full shadow-sm">
                                                <span className="text-[10px] font-bold text-[#25D366] uppercase tracking-widest">Unread Messages Below</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className={`flex w-full ${msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-2.5 px-3.5 shadow-sm relative max-w-[85%] md:max-w-[70%] ${
                                            msg.direction === 'OUTBOUND' 
                                                ? 'bg-[#D9FDD3] rounded-lg rounded-tr-none border border-[#c7e9b4]' 
                                                : 'bg-white rounded-lg rounded-tl-none border border-slate-100'
                                        }`}>
                                            <p className="text-[13px] text-[#111b21] leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1 opacity-40">
                                                <span className="text-[9px] tabular-nums">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {msg.direction === 'OUTBOUND' && <CheckCircle2 size={10} className={msg.status === 'READ' ? 'text-[#53bdeb]' : 'text-slate-400'} />}
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            ))}
                        </div>

                        {/* NEW MESSAGE NOTICE */}
                        {showNewMessageNotice && (
                            <button 
                                onClick={handleNewMessageClick}
                                className="absolute bottom-6 right-6 bg-white shadow-lg border border-slate-100 rounded-full w-10 h-10 flex items-center justify-center text-[#25D366] hover:scale-110 active:scale-95 transition-all z-20 group"
                            >
                                <ChevronDown size={20} />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#25D366] rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">!</div>
                            </button>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center space-y-4 md:flex hidden">
                        <div className="w-20 h-20 bg-white rounded-3xl border border-slate-100 flex items-center justify-center shadow-sm">
                            <MessageCircle size={32} className="text-[#25D366]" fill="currentColor" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-[16px] font-bold text-slate-700 tracking-tight">Chat Monitor</h3>
                            <p className="text-[12px] font-medium text-slate-400">Select a conversation to see live messages.</p>
                        </div>
                    </div>
                )}
            </div>
        </MainAppLayout>
    );
}

function FilterButton({ label, active, onClick, unreadCount, totalCount }: { label: string, active: boolean, onClick: () => void, unreadCount?: number, totalCount?: number }) {
    return (
        <button 
            onClick={onClick}
            className={`flex-1 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 relative ${
                active ? 'bg-white text-[#25D366] shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
        >
            <span className="flex items-center gap-1.5">
                {label}
                {totalCount !== undefined && <span className="opacity-40 tabular-nums">({totalCount})</span>}
            </span>
            {unreadCount !== undefined && unreadCount > 0 && (
                <div className="px-1.5 py-0.5 min-w-[18px] h-4 bg-[#25D366] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm shadow-green-200">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </div>
            )}
        </button>
    );
}