import React from 'react';
import { ChevronDown, MessageCircle, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import { MessageDTO, MessageStatus, ChatThreadDTO } from '@ingetin/types';
import { Typography } from '../../../components/ui/Typography';
import { cn } from '../../../utils/tw.utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
    selectedPhone: string | null;
    selectedUser: ChatThreadDTO | undefined;
    history: MessageDTO[];
    loadingHistory: boolean;
    scrollRef: React.RefObject<HTMLDivElement>;
    unreadRef: React.RefObject<HTMLDivElement>;
    firstUnreadId: string | null;
    showNewMessageNotice: boolean;
    handleScroll: () => void;
    handleNewMessageClick: () => void;
    onBack?: () => void;
}

/**
 * 🚀 THE MODERN PRO CHAT WINDOW - v9.0
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({
    selectedPhone, selectedUser, history, loadingHistory, scrollRef, 
    unreadRef, firstUnreadId, showNewMessageNotice, handleScroll, handleNewMessageClick, onBack
}) => {
    return (
        <div className="flex-1 flex flex-col relative overflow-hidden bg-background text-left">
            {/* 01. SECURE SESSION HEADER */}
            <AnimatePresence mode="wait">
                {selectedPhone && selectedUser ? (
                    <motion.div 
                        key="header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 md:px-10 border-b border-border flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-xl z-20 shadow-sm"
                    >
                        <div className="flex items-center gap-4 md:gap-6">
                            {onBack && (
                                <button 
                                    onClick={onBack} 
                                    className="lg:hidden p-2 -ml-2 text-muted-foreground/40 hover:text-accent transition-all bg-secondary rounded-lg border border-border"
                                >
                                    <ChevronDown className="rotate-90" size={18} />
                                </button>
                            )}
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-secondary border border-border overflow-hidden shrink-0 shadow-sm group">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username || selectedPhone}&backgroundColor=F1F5F9`} alt="Avatar" crossOrigin="anonymous" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left space-y-1.5">
                                <Typography variant="h2" className="text-xl md:text-2xl font-bold tracking-tight mb-0">{selectedUser.username || `+${selectedPhone}`}</Typography>
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-widest",
                                        selectedUser.isRegistered ? "bg-accent/5 border-accent/20 text-accent" : "bg-secondary border-border text-muted-foreground/60"
                                    )}>
                                        {selectedUser.isRegistered ? <ShieldCheck size={10} /> : <User size={10} />}
                                        {selectedUser.isRegistered ? 'Akun Terverifikasi' : 'Sinyal Tamu'}
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                    <Typography variant="small" className="font-bold text-[9px] uppercase tracking-widest text-muted-foreground/30">Sesi Aktif</Typography>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* 02. MESSAGE LIST AREA */}
            {selectedPhone ? (
                <>
                    <div 
                        ref={scrollRef} 
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 space-y-10 bg-secondary/20 relative scroll-smooth"
                    >
                        {loadingHistory ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4">
                                <div className="w-10 h-10 border-4 border-accent/10 border-t-accent rounded-full animate-spin" />
                                <Typography variant="small" className="font-bold opacity-30 uppercase tracking-[0.3em]">Memuat Registry...</Typography>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                                <MessageCircle size={48} className="text-accent" />
                                <Typography variant="small" className="font-bold uppercase tracking-[0.4em]">Belum Ada Transmisi</Typography>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {history.map((msg: MessageDTO, idx: number) => (
                                    <React.Fragment key={msg.id}>
                                        {msg.id === firstUnreadId && (
                                            <div ref={unreadRef} className="flex justify-center my-16 sticky top-6 z-10">
                                                <div className="bg-accent text-white px-5 py-1.5 rounded-full shadow-lg shadow-accent/20 border border-white/20">
                                                    <span className="font-bold text-[10px] uppercase tracking-widest">Sinyal Baru Terintersepsi</span>
                                                </div>
                                            </div>
                                        )}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: Math.min(idx * 0.05, 1) }}
                                            className={cn("flex w-full group", msg.direction === 'OUTBOUND' ? 'justify-end' : 'justify-start')}
                                        >
                                            <div className={cn(
                                                "p-5 px-6 relative max-w-[85%] md:max-w-[70%] lg:max-w-xl transition-all shadow-subtle",
                                                msg.direction === 'OUTBOUND' 
                                                    ? 'bg-primary text-white rounded-2xl rounded-tr-sm border border-primary/10' 
                                                    : 'bg-white text-foreground rounded-2xl rounded-tl-sm border border-border'
                                            )}>
                                                <p className="text-[13.5px] font-medium leading-[1.6] whitespace-pre-wrap tracking-normal">{msg.body}</p>
                                                <div className={cn(
                                                "flex items-center justify-end gap-2 mt-3.5",
                                                msg.direction === 'OUTBOUND' ? 'opacity-60' : 'opacity-30'
                                                )}>
                                                    <span className="font-bold text-[9px] tabular-nums uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {msg.direction === 'OUTBOUND' && <CheckCircle2 size={12} strokeWidth={2.5} className={msg.status === MessageStatus.READ ? 'text-white' : 'text-white/30'} />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* NEW MESSAGE ANCHOR */}
                    <AnimatePresence>
                        {showNewMessageNotice && (
                            <motion.button 
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                                onClick={handleNewMessageClick}
                                className="absolute bottom-10 right-10 bg-accent shadow-elevated rounded-2xl w-14 h-14 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all z-30 group border border-accent/20"
                            >
                                <ChevronDown size={28} strokeWidth={2.5} />
                                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white border-2 border-accent flex items-center justify-center text-[10px] font-bold text-accent rounded-full shadow-sm">!</div>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-10">
                    <div className="w-24 h-24 bg-secondary rounded-[2.5rem] flex items-center justify-center shadow-subtle border border-border relative">
                        <MessageCircle size={36} strokeWidth={2.5} className="text-accent/30" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-border rounded-xl flex items-center justify-center shadow-sm">
                            <ShieldCheck size={18} className="text-accent" />
                        </div>
                    </div>
                    <div className="space-y-4 max-w-sm">
                        <Typography variant="h3" className="text-2xl font-bold tracking-tight text-foreground">Pemantauan Registry</Typography>
                        <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed px-6">Pilih saluran komunikasi yang aman dari direktori untuk memantau transmisi sinyal secara real-time.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
