import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/shared/lib/tw.utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: string
  className?: string
}

/**
 * Modal — WhatsApp Official Style
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = "max-w-[500px]",
  className,
}: ModalProps) => {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence mode="wait">
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[130] bg-wa-dark/60" // Standard solid semi-transparent overlay
              />
            </DialogPrimitive.Overlay>

            <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 md:p-6 pointer-events-none text-left">
              <DialogPrimitive.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  transition={{ duration: 0.2 }}
                  
                  className={cn(
                    "bg-white w-full relative flex flex-col max-h-[90vh] pointer-events-auto",
                    "rounded-2xl shadow-wa-md",
                    "overflow-hidden",
                    maxWidth,
                    className
                  )}
                >
                  {/* HEADER */}
                  <header className="flex items-center justify-between px-6 py-4 border-b border-wa-border shrink-0 bg-white">
                     <div className="flex items-center gap-3">
                        {icon && (
                          <div className="w-10 h-10 rounded-xl bg-wa-bg flex items-center justify-center text-wa-icon shrink-0">
                            {React.isValidElement(icon) 
                              ? React.cloneElement(icon as React.ReactElement<{ size?: number; strokeWidth?: number }>, { size: 20, strokeWidth: 2 }) 
                              : icon}
                          </div>
                        )}
                        <div>
                            <DialogPrimitive.Title asChild>
                                <h2 className="text-xl font-bold text-wa-dark">
                                    {title}
                                </h2>
                            </DialogPrimitive.Title>
                            {subtitle && (
                                <DialogPrimitive.Description asChild>
                                    <p className="text-[13px] text-wa-icon">
                                        {subtitle}
                                    </p>
                                </DialogPrimitive.Description>
                            )}
                        </div>
                     </div>

                     <DialogPrimitive.Close className="w-8 h-8 rounded-full flex items-center justify-center text-wa-icon hover:bg-wa-bg transition-colors focus:outline-none">
                       <X size={20} strokeWidth={2.5} />
                     </DialogPrimitive.Close>
                  </header>

                  {/* BODY */}
                  <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar bg-white text-left">
                    {children}
                  </div>

                  {/* FOOTER */}
                  {footer && (
                    <footer className="px-6 py-4 border-t border-wa-border bg-white shrink-0 text-left">
                        {footer}
                    </footer>
                  )}
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
