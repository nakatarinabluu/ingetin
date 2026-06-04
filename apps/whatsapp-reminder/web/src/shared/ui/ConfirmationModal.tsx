import React from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/shared/lib/tw.utils';

export type ConfirmationType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: ConfirmationType;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  isLoading = false,
  type = 'danger',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={28} />;
      case 'warning':
        return <AlertCircle size={28} />;
      case 'success':
        return <CheckCircle size={28} />;
      case 'info':
      default:
        return <Info size={28} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-50',
          text: 'text-red-500',
          btn: 'bg-red-500 hover:bg-red-600',
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-500',
          btn: 'bg-orange-500 hover:bg-orange-600',
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          text: 'text-green-500',
          btn: 'bg-green-500 hover:bg-green-600',
        };
      case 'info':
      default:
        return {
          bg: 'bg-wa-green-light',
          text: 'text-wa-teal',
          btn: 'bg-wa-green hover:bg-wa-green-dark',
        };
    }
  };

  const colors = getColors();

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => {
      if (!open && !isLoading) onClose();
    }}>
      <AnimatePresence mode="wait">
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[130] bg-wa-dark/60 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>

            <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 pointer-events-none">
              <DialogPrimitive.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7 text-center pointer-events-auto"
                >
                  <div
                    className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5',
                      colors.bg,
                      colors.text
                    )}
                  >
                    {getIcon()}
                  </div>
                  <DialogPrimitive.Title asChild>
                    <h3 className="text-lg font-bold text-wa-dark mb-2">{title}</h3>
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description asChild>
                    <div className="text-sm text-wa-icon mb-7 leading-relaxed">
                      {description}
                    </div>
                  </DialogPrimitive.Description>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isLoading}
                      className="flex-1 h-12 rounded-2xl border border-wa-border text-wa-icon font-semibold hover:bg-wa-bg transition-colors disabled:opacity-50"
                    >
                      {cancelText}
                    </button>
                    <button
                      type="button"
                      onClick={onConfirm}
                      disabled={isLoading}
                      className={cn(
                        'flex-1 h-12 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50',
                        colors.btn
                      )}
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        confirmText
                      )}
                    </button>
                  </div>
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
};
