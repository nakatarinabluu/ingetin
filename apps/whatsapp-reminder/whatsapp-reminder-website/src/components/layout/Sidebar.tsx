import React, { useState } from 'react';
import { LogOut, Menu, X, Globe, Shield, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface SidebarProps {
    role: 'ADMIN' | 'USER';
    navItems: NavItem[];
    activeView: string;
    onViewChange: (view: any) => void;
    onLogout: () => void;
    profile?: any;
    nodeLabel?: string;
}

export default function Sidebar({ 
    role, 
    navItems, 
    activeView, 
    onViewChange, 
    onLogout, 
    profile,
    nodeLabel = 'SYSTEM NODE'
}: SidebarProps) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleNavClick = (id: string) => {
        onViewChange(id);
        setIsOpen(false);
    };

    const isUser = role === 'USER';

    return (
        <>
            {/* --- MOBILE HEADER --- */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-[60] flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                        {isUser ? <Globe size={18} className="text-indigo-600" /> : <Shield size={18} className="text-indigo-600" />}
                    </div>
                    <span className="font-black text-[10px] tracking-[0.2em] text-slate-900 uppercase">{nodeLabel}</span>
                </div>
                <button 
                    onClick={toggleSidebar}
                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* --- BACKDROP FOR MOBILE --- */}
            {isOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[70] animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* --- SIDEBAR CONTAINER --- */}
            <aside className={`
                fixed lg:sticky top-0 left-0 h-[100dvh] w-80 bg-white border-r border-slate-100 
                flex flex-col z-[80] transition-transform duration-500 ease-out shadow-lg shadow-slate-200/20
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="p-10 pb-6 border-b border-slate-50 lg:border-none">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
                            {isUser ? (
                                <Globe size={28} className="text-indigo-600" />
                            ) : (
                                <Shield size={28} className="text-indigo-600" />
                            )}
                        </div>
                        <div>
                            <span className="block font-black tracking-tight text-slate-900 uppercase text-lg italic">
                                {isUser ? nodeLabel : 'SYSTEM'}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                                {isUser ? 'Neural Node' : 'Root Control'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Nav - Scrollable Area */}
                <nav className="px-6 flex-1 space-y-2 overflow-y-auto custom-scrollbar pt-8">
                    {!isUser && (
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-6 mb-4">Security Nodes</div>
                    )}
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`
                                w-full flex items-center gap-4 px-6 py-4.5 rounded-[20px] transition-all duration-300 font-black text-[11px] uppercase tracking-widest group relative overflow-hidden
                                ${activeView === item.id 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}
                            `}
                        >
                            <div className={`${activeView === item.id ? 'text-white' : 'text-slate-300 group-hover:text-indigo-600 transition-colors'}`}>
                                {item.icon}
                            </div>
                            <span className="tracking-[0.1em]">{item.label}</span>
                            {activeView === item.id && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                            )}
                        </button>
                    ))}

                    <div className="pt-10 pb-4">
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-6 mb-4">Environment</div>
                        <button
                            onClick={() => navigate('/profile')}
                            className={`
                                w-full flex items-center gap-4 px-6 py-4.5 rounded-[20px] transition-all duration-300 font-black text-[11px] uppercase tracking-widest group relative overflow-hidden
                                ${activeView === 'profile' 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}
                            `}
                        >
                            <div className={`${activeView === 'profile' ? 'text-white' : 'text-slate-300 group-hover:text-indigo-600 transition-colors'}`}>
                                <UserCircle size={18} />
                            </div>
                            <span className="tracking-[0.1em]">Identity</span>
                            {activeView === 'profile' && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                            )}
                        </button>
                    </div>
                </nav>

                {/* Profile & Footer */}
                <div className="p-8 border-t border-slate-50 bg-slate-50/30">
                    {isUser && profile && (
                        <div className="flex items-center gap-4 mb-8 px-2">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                                <span className="text-indigo-600 font-black text-sm uppercase">{profile.fullName?.[0]}</span>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{profile.fullName}</p>
                                <p className="text-[10px] text-slate-400 truncate font-bold tracking-widest mt-0.5">@{profile.username}</p>
                            </div>
                        </div>
                    )}
                    <button 
                        onClick={onLogout} 
                        className="w-full flex items-center justify-between px-6 py-4 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all font-black text-[11px] uppercase tracking-[0.2em] group rounded-2xl border border-transparent hover:border-rose-100"
                    >
                        Terminated <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </aside>
        </>
    );
}
