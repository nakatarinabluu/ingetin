import React, { useState } from 'react';
import { 
    Users, 
    Search, 
    MoreVertical, 
    Shield, 
    Mail, 
    Phone, 
    CheckCircle2,
    ArrowRight,
    Trash2,
    X,
    Clock,
    Activity,
    History as HistoryIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAllUsers } from '../../hooks/useWhatsApp';
import MainAppLayout from '../../layouts/MainAppLayout';
import { UserAPI, WhatsAppAPI } from '../../api/services';

export default function AdminUserManager() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [openActionId, setOpenActionId] = useState<string | null>(null);
    const navigate = useNavigate();

    const { data: usersData, isLoading, refetch } = useAllUsers(true, { 
        page, 
        limit: 10,
        search: searchTerm 
    });

    const users = usersData?.users || [];

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Permanently delete this user account?')) return;
        try {
            await UserAPI.deleteUser(id);
            refetch();
        } catch (err) {
            alert('Action failed.');
        }
    };

    return (
        <MainAppLayout 
            title="User Management" 
            subtitle="Manage Access & Workspace Accounts"
        >
            <div className="p-4 md:p-6 lg:p-10 space-y-6 md:space-y-8">
                
                {/* --- SEARCH & ACTIONS --- */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                            type="text" 
                            placeholder="Search registered accounts..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#25D366] transition-all outline-none text-[14px] placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                    
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Users Live</span>
                    </div>
                </div>

                {/* --- USERS LIST (Responsive) --- */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Account</th>
                                    <th className="hidden lg:table-cell px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                                    <th className="hidden xl:table-cell px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Security</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    [1,2,3,4,5].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-8 bg-slate-50/10" />
                                        </tr>
                                    ))
                                ) : users.length > 0 ? users.map((user: any) => (
                                    <tr key={(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-slate-200 flex-shrink-0 shadow-sm">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${((user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).username || 'ingetin').toLowerCase()}`} alt="Avatar" crossOrigin="anonymous" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[14px] text-slate-700 leading-none mb-1 truncate">{(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).fullName}</p>
                                                    <p className="text-[12px] text-slate-400 truncate">@{(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-[13px] text-slate-600">
                                                    <Mail size={14} className="text-slate-300" />
                                                    {(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).email}
                                                </div>
                                                {(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).phoneNumber && (
                                                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 tabular-nums">
                                                        <Phone size={12} className="text-slate-300" />
                                                        +{(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).phoneNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="hidden xl:table-cell px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                (user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200'
                                            }`}>
                                                <Shield size={10} />
                                                {(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).isActivated ? 'bg-[#25D366]' : 'bg-amber-500'}`} />
                                                <span className={`text-[12px] font-bold whitespace-nowrap ${(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).isActivated ? 'text-[#25D366]' : 'text-amber-500'}`}>
                                                    {(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).isActivated ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate(`/admin-user/${(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).username}/audit`)}
                                                    className="p-2 text-slate-400 hover:text-[#25D366] hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-200 shadow-none hover:shadow-sm"
                                                    title="Investigate Activity"
                                                >
                                                    <HistoryIcon size={16} />
                                                </button>
                                                
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setOpenActionId(openActionId === (user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).id ? null : (user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).id)}
                                                        className={`p-2 rounded-lg transition-all border ${openActionId === (user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).id ? 'bg-slate-100 text-slate-700 border-slate-300 shadow-inner' : 'text-slate-400 border-transparent hover:border-slate-200'}`}
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>

                                                    {openActionId === (user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).id && (
                                                        <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50">
                                                            <button 
                                                                onClick={() => { handleDeleteUser((user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).id); setOpenActionId(null); }}
                                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all text-[12px] font-bold"
                                                            >
                                                                <Trash2 size={14} />
                                                                Decommission
                                                            </button>
                                                            <button 
                                                                onClick={() => setOpenActionId(null)}
                                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all text-[12px] font-bold"
                                                            >
                                                                <X size={14} />
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3 opacity-20">
                                                <Activity size={48} />
                                                <p className="font-bold text-[11px] uppercase tracking-widest">No accounts detected</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="block md:hidden divide-y divide-slate-50">
                        {isLoading ? (
                            [1,2,3].map(i => <div key={i} className="p-6 animate-pulse bg-slate-50/10 h-32" />)
                        ) : users.length > 0 ? users.map((user: any) => (
                            <div key={(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).id} className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-white shadow-sm flex-shrink-0">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).username}`} alt="Avatar" crossOrigin="anonymous" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-[14px] text-slate-700 leading-tight truncate">{(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).fullName}</p>
                                            <p className="text-[12px] text-slate-400 truncate">@{(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).username}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).isActivated ? 'bg-green-50 text-[#25D366] border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).isActivated ? 'Active' : 'Inactive'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-[12px] text-slate-600">
                                        <Mail size={14} className="text-slate-300" />
                                        <span className="truncate">{(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).email}</span>
                                    </div>
                                    {(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).phoneNumber && (
                                        <div className="flex items-center gap-2 text-[12px] text-slate-600">
                                            <Phone size={14} className="text-slate-300" />
                                            <span>+{(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).phoneNumber}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        <Shield size={12} />
                                        {(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).role}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => navigate(`/admin-user/${(user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).username}/audit`)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 active:bg-slate-50"
                                        >
                                            <HistoryIcon size={14} />
                                            Audit Log
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteUser((user as { id: string, username?: string, fullName?: string, email?: string, phoneNumber?: string, role?: string, isActivated?: boolean }).id)}
                                            className="p-1.5 text-rose-500 bg-rose-50 rounded-lg border border-rose-100 active:scale-95"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center opacity-20 space-y-2">
                                <Activity size={32} className="mx-auto" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">No users found</p>
                            </div>
                        )}
                    </div>

                    {/* --- PAGINATION --- */}
                    <div className="px-4 md:px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Total Users: {usersData?.pagination?.total || 0}
                        </span>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                Previous
                            </button>
                            <button 
                                disabled={users.length < 10}
                                onClick={() => { setPage(p => p + 1); window.scrollTo(0,0); }}
                                className="flex-1 sm:flex-none px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-[11px] font-bold hover:bg-[#1eb956] disabled:opacity-30 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                Next
                                <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MainAppLayout>
    );
}