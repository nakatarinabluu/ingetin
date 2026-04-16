import React from 'react';
import { FileText } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Typography } from '../../ui/Typography';
import { LEGAL_COPY, COMMON_COPY } from '../../../constants/copy';

export type PolicyType = 'TERMS' | 'PRIVACY';

interface PolicyModalsProps {
    activePolicy: PolicyType | null;
    onClose: () => void;
}

/**
 * 🟢 WHATSAPP MODERN PRO - POLICY MODALS
 * Handles Terms of Service and Privacy Policy displays.
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
                <Typography variant="p" className="text-base leading-relaxed">
                    {activePolicy === 'TERMS' 
                        ? LEGAL_COPY.terms.desc
                        : LEGAL_COPY.privacy.desc}
                </Typography>
                <div className="flex justify-end pt-4">
                    <Button onClick={onClose} variant="outline" className="rounded-xl px-8 font-bold uppercase tracking-widest text-xs">
                        {COMMON_COPY.close || "Tutup"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
