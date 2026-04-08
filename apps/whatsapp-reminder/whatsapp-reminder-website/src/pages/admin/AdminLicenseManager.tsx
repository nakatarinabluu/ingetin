import React, { useState } from 'react';
import { 
    Ticket, 
    Search, 
    Filter,
    ArrowRight,
    X,
    ChevronLeft,
    Copy,
    CheckCircle2,
    Activity,
    Shield,
    Key
} from 'lucide-react';
import { useLicenses, useGenerateLicense } from '../../hooks/useWhatsApp';
import MainAppLayout from '../../layouts/MainAppLayout';
import { Modal } from '../../components/ui';

type LicenseFilter = 'ALL' | 'AVAILABLE' | 'USED';

export default function AdminLicenseManager() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<LicenseFilter>('ALL');
    const [showFilters, setShowFilters] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [targetName, setTargetName] = useState('');
    
    const { data: licensesData, isLoading, refetch } = useLicenses(true, { 
        page, 
        limit: 12, 
        search: searchTerm,
        status: activeFilter === 'ALL' ? undefined : activeFilter
    });
    const generateLicense = useGenerateLicense();

    const licenses = Array.isArray(licensesData?.licenses) ? licensesData.licenses : [];
    const pagination = licensesData?.pagination;

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key);
    };

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetName.trim()) return;
        generateLicense.mutate({ targetName }, {
            onSuccess: () => {
                refetch();
                setIsGenerating(false);
                setTargetName('');
            }
        });
    };

    const filterLabels: Record<LicenseFilter, string> = {
        'ALL': 'Filter',
        'AVAILABLE': 'Available',
        'USED': 'Assigned'
    };

    return (
        <MainAppLayout 
            title="Access Registry" 
            subtitle="License Key Management"
        >
            <div className="p-6 lg:p-10 space-y-8 pb-20">
                
                {/* --- ACTION BAR --- */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                            type="text" 
                            placeholder="Find license key..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#25D366] transition-all outline-none text-[14px] placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto relative">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex-1 md:flex-none px-4 py-2 border rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-2 ${showFilters ? 'bg-slate-50 border-slate-300 text-slate-700 shadow-inner' : 'bg-white text-slate-500 border-slate-200 shadow-sm'}`}
                        >
                            <Filter size={14} />
                            {filterLabels[activeFilter]}
                        </button>

                        <button 
                            onClick={() => setIsGenerating(true)}
                            className="flex-1 md:flex-none px-6 py-2 bg-[#25D366] hover:bg-[#1eb956] text-white rounded-xl text-[12px] font-bold transition-all shadow-lg shadow-green-500/10"
                        >
                            Generate Key
                        </button>

                        {showFilters && (
                            <div className="absolute top-full right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50">
                                <FilterOption label="All Keys" active={activeFilter === 'ALL'} onClick={() => { setActiveFilter('ALL'); setPage(1); setShowFilters(false); }} />
                                <FilterOption label="Available" active={activeFilter === 'AVAILABLE'} onClick={() => { setActiveFilter('AVAILABLE'); setPage(1); setShowFilters(false); }} />
                                <FilterOption label="Assigned" active={activeFilter === 'USED'} onClick={() => { setActiveFilter('USED'); setPage(1); setShowFilters(false); }} />
                            </div>
                        )}
                    </div>
                </div>

                {/* --- ACCESS KEYS GRID --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        [1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-48 bg-white border border-slate-100 rounded-2xl animate-pulse" />)
                    ) : licenses.length > 0 ? (
                        licenses.map((license: any) => (
                            <div key={license.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-[#25D366] transition-all flex flex-col justify-between min-h-[220px] group relative overflow-hidden">
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${license.status === 'AVAILABLE' ? 'bg-green-50 border-green-100 text-[#25D366]' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                            <Ticket size={18} />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${license.status === 'AVAILABLE' ? 'bg-[#25D366]' : 'bg-slate-300'}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-tight ${license.status === 'AVAILABLE' ? 'text-[#25D366]' : 'text-slate-400'}`}>
                                                    {license.status === 'AVAILABLE' ? 'Available' : 'Assigned'}
                                                </span>
                                            </div>
                                            {license.targetName && (
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[120px]">
                                                    {license.targetName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div 
                                        className={`p-3 rounded-xl border transition-all overflow-hidden relative ${
                                            license.status === 'AVAILABLE' 
                                                ? 'bg-slate-50 border-slate-100 cursor-pointer active:scale-[0.98] group/key' 
                                                : 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-60'
                                        }`}
                                        onClick={() => license.status === 'AVAILABLE' && handleCopy(license.key)}
                                    >
                                        <p className="text-[13px] font-mono font-bold text-slate-600 truncate">{license.key}</p>
                                        {license.status === 'AVAILABLE' && (
                                            <div className="absolute inset-0 bg-[#25D366] text-white flex items-center justify-center opacity-0 group-hover/key:opacity-100 transition-opacity">
                                                <Copy size={14} className="mr-2" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Copy License</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-50 relative z-10">
                                    {license.user ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D1D7DB] bg-white">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(license.user.username || 'ingetin').toLowerCase()}`} alt="Avatar" crossOrigin="anonymous" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[12px] font-bold text-slate-700 truncate leading-none mb-0.5">{license.user.fullName}</p>
                                                <p className="text-[10px] text-slate-400">@{license.user.username}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Shield size={12} />
                                            <p className="text-[10px] font-bold uppercase tracking-[0.15em]">Unassigned User</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center opacity-20 space-y-3">
                            <Activity size={48} className="mx-auto" />
                            <p className="text-[11px] font-bold uppercase tracking-widest">Registry Empty</p>
                        </div>
                    )}
                </div>

                {/* --- PAGINATION --- */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                        <button 
                            disabled={page === 1}
                            onClick={() => { setPage(p => p - 1); window.scrollTo(0,0); }}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="px-4 py-1.5 bg-white border border-slate-200 text-[#0F172A] rounded-lg text-[11px] font-bold tracking-widest uppercase shadow-sm">
                            {page} / {pagination.totalPages}
                        </div>
                        <button 
                            disabled={page >= pagination.totalPages}
                            onClick={() => { setPage(p => p + 1); window.scrollTo(0,0); }}
                            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isGenerating}
                onClose={() => setIsGenerating(false)}
                title="Provision License Key"
                subtitle="Specify a reference for this credential."
                icon={<Key />}
                footer={
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsGenerating(false)}
                            className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-[13px] text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            form="license-gen-form"
                            type="submit"
                            disabled={generateLicense.isPending || !targetName.trim()}
                            className="flex-1 bg-[#25D366] hover:bg-[#1eb956] text-white py-3 rounded-xl font-bold text-[13px] shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {generateLicense.isPending ? 'Provisioning...' : 'Confirm Generation'}
                        </button>
                    </div>
                }
            >
                <form id="license-gen-form" onSubmit={handleGenerate} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Name or Note</label>
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="e.g., Client Alpha, Enterprise Account"
                            value={targetName}
                            onChange={e => setTargetName(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-transparent rounded-lg focus:border-[#25D366] focus:bg-white transition-all text-[14px] text-slate-700 outline-none shadow-sm"
                        />
                    </div>
                </form>
            </Modal>
        </MainAppLayout>
    );
}

function FilterOption({ label, active, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-bold transition-all ${active ? 'bg-green-50 text-[#25D366]' : 'text-slate-500 hover:bg-slate-50'}`}
        >
            {label}
        </button>
    );
}
