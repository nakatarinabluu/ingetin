import React from 'react';
import { Smartphone, Calendar } from 'lucide-react';
import { ConnectionStatusBadge } from '../../atoms/ConnectionStatusBadge';

interface ConnectionItemProps {
    label: string;
    isConnected: boolean;
    value: string;
    icon: React.ReactNode;
    onAction: () => void;
    isUnlinking?: boolean;
}

const ConnectionItem: React.FC<ConnectionItemProps> = ({ label, isConnected, value, icon, onAction, isUnlinking }) => (
    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:border-slate-200 hover:shadow-md">
        <ConnectionStatusBadge 
            isConnected={isConnected}
            label={label}
            subLabel={value}
            icon={icon}
        />
        <button 
            onClick={onAction}
            disabled={isUnlinking}
            className={`w-full py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                isConnected 
                    ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' 
                    : 'bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-50 shadow-sm'
            }`}
        >
            {isConnected ? (isUnlinking ? 'Wait...' : 'Disconnect') : 'Link Service'}
        </button>
    </div>
);

interface DashboardConnectionsProps {
    whatsappNumber: string | null;
    isGoogleConnected: boolean;
    onUnlinkPhone: () => void;
    onLinkPhone: () => void;
    onUnlinkGoogle: () => void;
    onLinkGoogle: () => void;
    unlinkPhoneLoading?: boolean;
    unlinkGoogleLoading?: boolean;
}

export const DashboardConnections: React.FC<DashboardConnectionsProps> = ({ 
    whatsappNumber, 
    isGoogleConnected, 
    onUnlinkPhone, 
    onLinkPhone, 
    onUnlinkGoogle, 
    onLinkGoogle,
    unlinkPhoneLoading,
    unlinkGoogleLoading
}) => {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#25D366]" />
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-400">
                    <Smartphone size={18} />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Account Connections</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            </header>

            <div className="space-y-6">
                <ConnectionItem 
                    label="WhatsApp"
                    isConnected={!!whatsappNumber}
                    value={whatsappNumber ? `+${whatsappNumber}` : 'Not connected'}
                    icon={<Smartphone size={20} />}
                    onAction={whatsappNumber ? onUnlinkPhone : onLinkPhone}
                    isUnlinking={unlinkPhoneLoading}
                />
                <ConnectionItem 
                    label="Google Calendar"
                    isConnected={isGoogleConnected}
                    value={isGoogleConnected ? 'Synchronized' : 'Not connected'}
                    icon={<Calendar size={20} />}
                    onAction={isGoogleConnected ? onUnlinkGoogle : onLinkGoogle}
                    isUnlinking={unlinkGoogleLoading}
                />
            </div>
        </div>
    );
};
