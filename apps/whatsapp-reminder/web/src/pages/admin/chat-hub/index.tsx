import { useState, useEffect, useRef, useMemo } from 'react';
import { useChatThreads, useThreadHistory, useMarkAsRead } from '@/entities/chat/model/hooks';
import { useWebSocket, LiveEvent, WSPayload } from '@/entities/chat/model/websocket';
import { useQueryClient } from '@tanstack/react-query';
import { ChatThreadDTO, MessageDTO, PaginatedResponse } from '@ingetin/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { cn } from '@/shared/lib/tw.utils';

type ThreadFilter = 'ALL' | 'VERIFIED' | 'UNVERIFIED';

interface ChatStats {
    total: number;
    registered: number;
    anonymous: number;
    verified: number;
    unverified: number;
    verifiedUnread: number;
    unverifiedUnread: number;
}

/**
 * 🚀 THE MODERN PRO ADMIN CHAT HUB - v9.0
 * Authority Command & Communication Center.
 */
export default function AdminChatHub() {
    const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
    const [searchTerm, setSearchString] = useState('');
    const [activeFilter, setActiveFilter] = useState<ThreadFilter>('VERIFIED');
    const [showNewMessageNotice, setShowNewMessageNotice] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [firstUnreadId, setFirstUnreadId] = useState<string | null>(null);
    const [isMuted] = useState(false); 
    const [readyForRead, setReadyForRead] = useState(false);
    const [isWindowFocused, setIsWindowFocused] = useState(document.hasFocus());
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const unreadRef = useRef<HTMLDivElement | null>(null);
    const queryClient = useQueryClient();
    
    const { data: threadsData, isLoading: loadingThreads } = useChatThreads(true, { 
        page: 1, 
        limit: 100,
        filter: activeFilter 
    });
    
    const { data: historyData, isLoading: loadingHistory } = useThreadHistory(selectedPhone || '');
    const markAsRead = useMarkAsRead();

    const normalizePhone = (p: string | null | undefined) => p?.replace(/\D/g, '') || '';

    // WebSocket Integration
    const { isConnected } = useWebSocket((payload: WSPayload) => {
        if (payload.event === LiveEvent.CHAT_UPDATE) {
            const update = payload.data as { phoneNumber: string; body: string; direction: 'INBOUND' | 'OUTBOUND'; timestamp: Date | string };
            const normalizedUpdatePhone = normalizePhone(update.phoneNumber);
            const normalizedSelectedPhone = normalizePhone(selectedPhone);

            if (update.direction === 'INBOUND' && !isMuted) {
                if (!isWindowFocused || normalizedUpdatePhone !== normalizedSelectedPhone) {
                    audioRef.current?.play().catch(() => {});
                    if (!isWindowFocused) {
                        toast(`Sinyal baru dari ${update.phoneNumber}`, { 
                            position: 'bottom-left',
                            description: update.body.substring(0, 40) + "..." 
                        });
                    }
                }
            }

            queryClient.setQueriesData({ queryKey: ['chats'] }, (oldData: PaginatedResponse<ChatThreadDTO> | undefined) => {
                if (!oldData || !oldData.items) return oldData;
                const items = [...oldData.items];
                const index = items.findIndex((t: ChatThreadDTO) => normalizePhone(t.phoneNumber) === normalizedUpdatePhone);
                const updatedThread: ChatThreadDTO = index !== -1 
                    ? { ...items[index], body: update.body, timestamp: new Date(update.timestamp), unreadCount: update.direction === 'INBOUND' && normalizedUpdatePhone !== normalizedSelectedPhone ? (items[index].unreadCount || 0) + 1 : items[index].unreadCount }
                    : { phoneNumber: update.phoneNumber, body: update.body, timestamp: new Date(update.timestamp), unreadCount: update.direction === 'INBOUND' ? 1 : 0, username: null, isRegistered: false, isVerified: false, id: `new-${normalizedUpdatePhone}`, direction: update.direction, status: 'SENT' };
                
                if (index !== -1) items.splice(index, 1);
                items.unshift(updatedThread);
                return { ...oldData, items };
            });

            queryClient.invalidateQueries({ queryKey: ['chats'], refetchType: 'none' });

            if (normalizedUpdatePhone === normalizedSelectedPhone) {
                queryClient.invalidateQueries({ queryKey: ['thread', selectedPhone], refetchType: 'none' });
                queryClient.setQueriesData({ queryKey: ['thread', selectedPhone] }, (oldData: PaginatedResponse<MessageDTO> | undefined) => {
                    if (!oldData) return oldData;
                    const newMessage: MessageDTO = { id: `ws-temp-${Date.now()}`, whatsappId: `ws-${Date.now()}`, messageType: 'NOTIF', body: update.body, direction: update.direction, timestamp: new Date(update.timestamp), status: 'SENT', from: update.direction === 'INBOUND' ? update.phoneNumber : 'INTERNAL', to: update.direction === 'OUTBOUND' ? update.phoneNumber : 'INTERNAL' };
                    const exists = oldData.items?.some((m: MessageDTO) => m.body === update.body && Math.abs(new Date(m.timestamp).getTime() - new Date(update.timestamp).getTime()) < 1000);
                    if (exists) return oldData;
                    return { 
                        ...oldData, 
                        items: [...(oldData.items || []), newMessage], 
                        pagination: {
                            ...oldData.pagination,
                            total: (oldData.pagination?.total || 0) + 1
                        }
                    };
                });
            }
        }
    });

    const history: MessageDTO[] = useMemo(() => historyData?.items || [], [historyData?.items]);
    const threads: ChatThreadDTO[] = useMemo(() => {
        const items = threadsData?.items || [];
        return [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [threadsData?.items]);
    
    const stats = useMemo(() => (threadsData?.stats as unknown as ChatStats) || { total: 0, registered: 0, anonymous: 0, verified: 0, unverified: 0, verifiedUnread: 0, unverifiedUnread: 0 }, [threadsData]);
    const selectedUser = useMemo(() => threads.find((t: ChatThreadDTO) => t.phoneNumber === selectedPhone), [threads, selectedPhone]);

    useEffect(() => {
        const onFocus = () => setIsWindowFocused(true);
        const onBlur = () => setIsWindowFocused(false);
        window.addEventListener('focus', onFocus);
        window.addEventListener('blur', onBlur);
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audioRef.current.volume = 0.5;
        return () => { window.removeEventListener('focus', onFocus); window.removeEventListener('blur', onBlur); };
    }, []);

    useEffect(() => {
        const totalUnread = (stats.verifiedUnread || 0) + (stats.unverifiedUnread || 0);
        const originalTitle = "Admin Chat Hub | Ingetin";
        if (totalUnread > 0) document.title = `(${totalUnread}) Sinyal Baru | Ingetin`;
        else document.title = originalTitle;
        return () => { document.title = originalTitle; };
    }, [stats.verifiedUnread, stats.unverifiedUnread, history.length]);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const atBottom = scrollHeight - scrollTop - clientHeight < 30;
            setIsAtBottom(atBottom);
            if (atBottom && readyForRead && isWindowFocused) {
                setShowNewMessageNotice(false);
                setFirstUnreadId(null);
                if (selectedPhone && selectedUser && selectedUser.unreadCount > 0) markAsRead.mutate(selectedPhone);
            }
        }
    };

    useEffect(() => {
        if (selectedPhone && history.length > 0 && !loadingHistory && !firstUnreadId) {
            const unread = history.find((m: MessageDTO) => m.direction === 'INBOUND' && (m.status as string) === 'DELIVERED');
            if (unread) setFirstUnreadId(unread.id);
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
                if (selectedPhone && selectedUser && selectedUser.unreadCount > 0 && (isAtBottom || isOutbound) && readyForRead && isWindowFocused) markAsRead.mutate(selectedPhone);
            } else if (history.length > 0) setShowNewMessageNotice(true);
        }
    }, [history, selectedUser?.unreadCount, selectedPhone, readyForRead, isWindowFocused]);

    useEffect(() => {
        if (isWindowFocused && isAtBottom && selectedPhone && selectedUser && selectedUser.unreadCount > 0 && readyForRead) markAsRead.mutate(selectedPhone);
    }, [isWindowFocused]);

    useEffect(() => {
        if (selectedPhone && scrollRef.current && !loadingHistory) {
            setReadyForRead(false);
            const timer = setTimeout(() => {
                if (unreadRef.current) { unreadRef.current.scrollIntoView({ behavior: 'auto', block: 'center' }); setIsAtBottom(false); }
                else if (scrollRef.current) { scrollRef.current.scrollTop = scrollRef.current.scrollHeight; setIsAtBottom(true); }
                setShowNewMessageNotice(false);
                const unlockTimer = setTimeout(() => setReadyForRead(true), 200);
                return () => clearTimeout(unlockTimer);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [selectedPhone, loadingHistory]);

    useEffect(() => { setFirstUnreadId(null); setReadyForRead(false); }, [selectedPhone]);

    const handleNewMessageClick = () => {
        if (scrollRef.current) {
            if (unreadRef.current) { unreadRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); setShowNewMessageNotice(false); }
            else { scrollRef.current.scrollTop = scrollRef.current.scrollHeight; setShowNewMessageNotice(false); setIsAtBottom(true); setFirstUnreadId(null); if (selectedPhone) markAsRead.mutate(selectedPhone); }
        }
    };

    const handleSelectThread = (phone: string) => {
        if (selectedPhone === phone) return;
        setSelectedPhone(phone);
        const thread = threads.find((t: ChatThreadDTO) => t.phoneNumber === phone);
        if (thread && thread.unreadCount > 0) markAsRead.mutate(phone);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-wa-md overflow-hidden border border-wa-border text-left mx-auto w-full max-w-7xl"
        >
            <div className="flex h-full text-left overflow-hidden">
                {/* 01. SIDEBAR REGISTRY */}
                <div className={cn(
                    "w-full lg:w-[360px] xl:w-[420px] border-r border-wa-border shrink-0 flex flex-col h-full bg-white",
                    selectedPhone ? "hidden lg:flex" : "flex"
                )}>
                    <ChatSidebar 
                        threads={threads} 
                        loadingThreads={loadingThreads} 
                        isConnected={isConnected} 
                        searchTerm={searchTerm} 
                        setSearchString={setSearchString} 
                        activeFilter={activeFilter} 
                        setActiveFilter={setActiveFilter} 
                        selectedPhone={selectedPhone} 
                        setSelectedPhone={setSelectedPhone} 
                        handleSelectThread={handleSelectThread} 
                        stats={stats} 
                    />
                </div>

                {/* 02. MAIN COMMUNICATION FIELD */}
                <div className={cn(
                    "flex-1 flex flex-col h-full bg-wa-bg/30",
                    selectedPhone ? "flex" : "hidden lg:flex"
                )}>
                    <ChatWindow 
                        selectedPhone={selectedPhone} 
                        selectedUser={selectedUser} 
                        history={history} 
                        loadingHistory={loadingHistory} 
                        scrollRef={scrollRef} 
                        unreadRef={unreadRef} 
                        firstUnreadId={firstUnreadId} 
                        showNewMessageNotice={showNewMessageNotice} 
                        handleScroll={handleScroll} 
                        handleNewMessageClick={handleNewMessageClick} 
                        onBack={() => setSelectedPhone(null)} 
                    />
                </div>
            </div>
        </motion.div>
    );
}

