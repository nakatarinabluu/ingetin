import React, { useState } from 'react';
import { 
    Send, 
    MoreVertical, 
    ArrowLeft, 
    CheckCheck, 
    ShieldCheck,
    MessageCircle,
    Info,
    Calendar,
    Phone
} from 'lucide-react';
import { MessageDTO, ChatThreadDTO } from '@ingetin/types';
import { cn } from '@/shared/lib/tw.utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
    selectedPhone: string | null;
    selectedUser?: ChatThreadDTO;
    history: MessageDTO[];
    loadingHistory: boolean;
    scrollRef: React.RefObject<HTMLDivElement>;
    unreadRef: React.RefObject<HTMLDivElement>;
    firstUnreadId: string | null;
    showNewMessageNotice: boolean;
    handleScroll: () => void;
    handleNewMessageClick: () => void;
    onBack: () => void;
}

/**
 * 🚀 CHAT WINDOW — WHATSAPP OFFICIAL STYLE
 * Concept: Clinical, Minimal, Professional.
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({
    selectedPhone,
    selectedUser,
    history,
    loadingHistory,
    scrollRef,
    unreadRef,
    firstUnreadId,
    showNewMessageNotice,
    handleScroll,
    handleNewMessageClick,
    onBack
}) => {
    const [messageInput, setMessageInput] = useState('');

    if (!selectedPhone) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-wa-bg border-b-[6px] border-wa-green">
                <div className="text-center space-y-4 max-w-sm px-8">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <MessageCircle size={40} className="text-wa-border" />
                    </div>
                    <h3 className="text-2xl font-bold text-wa-icon">Ingetin Admin Hub</h3>
                    <p className="text-sm text-wa-icon/70 leading-relaxed">
                        Pilih percakapan dari daftar samping untuk memantau aktivitas atau memberikan bantuan kepada anggota.
                    </p>
                    <div className="pt-4 flex items-center justify-center gap-2 text-wa-green opacity-50">
                        <ShieldCheck size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted Registry</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#efeae2] relative">
            
            {/* WhatsApp Doodle Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none wa-doodle-premium" />

            {/* 1. Header */}
            <header className="p-3 bg-wa-bg border-b border-wa-border flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="lg:hidden p-2 text-wa-icon hover:bg-wa-border rounded-full">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-white overflow-hidden border border-wa-border shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPhone}`} alt="User" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-wa-dark truncate">
                                {selectedUser?.username || `+${selectedPhone}`}
                            </h3>
                            {selectedUser?.isVerified && <ShieldCheck size={14} className="text-wa-green" />}
                        </div>
                        <p className="text-[10px] font-bold text-wa-icon uppercase tracking-wider">
                            ID: #{selectedPhone.slice(-6)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 text-wa-icon hover:bg-wa-border rounded-full"><Phone size={18} /></button>
                    <button className="p-2 text-wa-icon hover:bg-wa-border rounded-full"><Info size={20} /></button>
                    <button className="p-2 text-wa-icon hover:bg-wa-border rounded-full"><MoreVertical size={20} /></button>
                </div>
            </header>

            {/* 2. Chat History */}
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 no-scrollbar relative z-0"
            >
                <div className="sticky top-0 z-20 flex justify-center mb-6">
                    <div className="bg-white/80 backdrop-blur-md border border-wa-border px-4 py-1.5 rounded-xl shadow-sm">
                        <p className="text-[10px] font-black text-wa-icon uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={12} /> Registry Aktivitas Sesi
                        </p>
                    </div>
                </div>

                <AnimatePresence>
                    {loadingHistory ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-2 border-wa-green/20 border-t-wa-green rounded-full animate-spin" />
                        </div>
                    ) : (
                        history.map((msg) => {
                            const isMe = msg.direction === 'OUTBOUND';
                            const isNew = msg.id === firstUnreadId;
                            return (
                                <React.Fragment key={msg.id}>
                                    {isNew && (
                                        <div ref={unreadRef} className="flex justify-center my-8 relative">
                                            <div className="bg-wa-green-light text-wa-teal border border-[#c0eab9] px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm z-10">
                                                Pesan Belum Terbaca
                                            </div>
                                            <div className="absolute top-1/2 left-0 w-full h-px bg-[#c0eab9]/50" />
                                        </div>
                                    )}
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className={cn(
                                            "flex flex-col max-w-[85%] md:max-w-[70%]",
                                            isMe ? "ml-auto items-end" : "mr-auto items-start"
                                        )}
                                    >
                                        <div className={cn(
                                            "px-3 py-2 rounded-xl shadow-sm relative group",
                                            isMe ? "bg-[#dcf8c6] rounded-tr-none text-wa-dark" : "bg-white rounded-tl-none text-wa-dark"
                                        )}>
                                            {/* Chat Bubble Tail */}
                                            <div className={cn(
                                                "absolute top-0 w-3 h-4 bg-inherit",
                                                isMe ? "-right-2 clip-path-wa-right" : "-left-2 clip-path-wa-left"
                                            )} />
                                            
                                            <p className="text-[14px] leading-relaxed pr-10">{msg.body}</p>
                                            
                                            <div className="flex items-center gap-1 mt-0.5 justify-end">
                                                <span className="text-[10px] text-wa-muted font-bold tabular-nums">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && (
                                                    <CheckCheck size={14} className={cn(
                                                        msg.status === 'SENT' ? "text-wa-green" : "text-wa-muted/40"
                                                    )} />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </React.Fragment>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* 3. Input Bar */}
            <footer className="p-3 bg-wa-bg flex items-center gap-3 z-10">
                <div className="flex-1 relative">
                    <input 
                        type="text"
                        placeholder="Tulis pesan..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="w-full h-11 bg-white border-none rounded-xl px-4 text-sm focus:ring-1 focus:ring-wa-green shadow-sm"
                    />
                </div>
                <button 
                    disabled={!messageInput.trim()}
                    className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95",
                        messageInput.trim() ? "bg-wa-green text-white" : "bg-white text-wa-icon"
                    )}
                >
                    <Send size={18} fill={messageInput.trim() ? "currentColor" : "none"} />
                </button>
            </footer>

            {/* Floating New Message Notice */}
            <AnimatePresence>
                {showNewMessageNotice && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={handleNewMessageClick}
                        className="absolute bottom-20 right-8 bg-white text-wa-green p-3 rounded-full shadow-xl border border-wa-border z-20 group hover:bg-wa-green hover:text-white transition-all"
                    >
                        <MessageCircle size={20} className="group-hover:animate-bounce" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};
