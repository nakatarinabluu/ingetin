import React from 'react';
import { FileText } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { LEGAL_COPY, COMMON_COPY } from '@/shared/config/copy';

export type PolicyType = 'TERMS' | 'PRIVACY';

interface PolicyModalsProps {
    activePolicy: PolicyType | null;
    onClose: () => void;
}

/**
 * PolicyModals — WhatsApp Official Style
 */
export const PolicyModals: React.FC<PolicyModalsProps> = ({ activePolicy, onClose }) => {
    return (
        <Modal 
            isOpen={!!activePolicy} 
            onClose={onClose} 
            title={activePolicy === 'TERMS' ? LEGAL_COPY.terms.badge : LEGAL_COPY.privacy.badge} 
            icon={<FileText />}
        >
            <div className="space-y-6 py-4">
                <p className="text-sm text-wa-icon leading-relaxed">
                    {activePolicy === 'TERMS' 
                        ? LEGAL_COPY.terms.desc
                        : LEGAL_COPY.privacy.desc}
                </p>
                <div className="flex justify-end pt-4 border-t border-wa-border mt-4">
                    <button 
                        onClick={onClose} 
                        className="h-10 px-6 rounded-full bg-wa-bg hover:bg-wa-border text-wa-dark font-semibold text-sm transition-colors"
                    >
                        {COMMON_COPY.close || "Tutup"}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
