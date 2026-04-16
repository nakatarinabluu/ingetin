import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../utils/tw.utils"
import { Typography } from "./Typography"

/**
 * 🚀 THE OFFICIAL WHATSAPP STYLE MODAL & BOTTOM SHEET
 * Responsive: Center Modal on Desktop, Bottom Sheet on Mobile.
 */

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
 * 🚀 THE MODREN PRO MODAL - v9.0 "Glass Shield"
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = "max-w-md",
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
                className="fixed inset-0 z-[130] bg-[#111b21]/40 backdrop-blur-[8px]"
              />
            </DialogPrimitive.Overlay>

            <div className="fixed inset-0 z-[140] flex items-center justify-center md:p-8 p-0 pointer-events-none overflow-hidden text-left">
              <DialogPrimitive.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  
                  className={cn(
                    "bg-white/80 backdrop-blur-3xl w-full relative flex flex-col max-h-[95vh] md:max-h-[90vh] pointer-events-auto",
                    "shadow-modern md:rounded-[2.5rem] rounded-t-[3rem] mt-auto md:mt-0",
                    "border border-white/60",
                    "p-0 overflow-hidden",
                    maxWidth,
                    className
                  )}
                >
                  {/* LUXURY DECORATIVE ELEMENT */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                  {/* MOBILE HANDLE */}
                  <div className="md:hidden w-12 h-1.5 bg-gray-200/50 rounded-full mx-auto mt-5 mb-1" />

                  <div className="absolute top-8 right-8 z-20">
                    <DialogPrimitive.Close className="p-2.5 text-gray-400 hover:text-accent hover:bg-white/50 transition-all rounded-full focus:outline-none border border-transparent hover:border-accent/10 shadow-sm">
                      <X size={20} />
                    </DialogPrimitive.Close>
                  </div>

                  <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden custom-scrollbar p-10 md:p-14 text-left pt-8 md:pt-14">
                    <header className="flex flex-col gap-5 mb-10 shrink-0 md:pr-10 text-left">
                        {icon && (
                        <div className="w-16 h-16 bg-white border border-gray-100/50 rounded-2xl flex items-center justify-center text-accent mb-1 shadow-modern rotate-3 hover:rotate-0 transition-transform duration-500">
                            {React.isValidElement(icon) 
                            ? React.cloneElement(icon as React.ReactElement, { size: 28, strokeWidth: 2.5 }) 
                            : icon}
                        </div>
                        )}
                        <div className="space-y-3">
                            <DialogPrimitive.Title asChild>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111b21] text-left uppercase italic leading-none">
                                {title}
                            </h2>
                            </DialogPrimitive.Title>
                            {subtitle && (
                            <DialogPrimitive.Description asChild>
                                <p className="text-lg text-gray-400 font-bold leading-relaxed max-w-sm italic">
                                    {subtitle}
                                </p>
                            </DialogPrimitive.Description>
                            )}
                        </div>
                    </header>

                    <div className="flex-1 text-left relative z-10">
                        {children}
                    </div>

                    {footer && (
                        <footer className="pt-10 mt-10 border-t border-gray-100/50 shrink-0 text-left">
                            {footer}
                        </footer>
                    )}
                  </div>
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}
