import { Toaster as Sonner } from "sonner"

/**
 * 🚀 THE OFFICIAL WHATSAPP STYLE TOASTER
 * Concept: Minimalist, Discrete, and Green.
 */

export const Toaster = () => {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "group w-auto min-w-[300px] flex flex-col items-center justify-center gap-1 rounded-2xl bg-wa-dark border border-white/10 shadow-wa p-4 font-sans pointer-events-auto",
          title: "text-[14px] font-bold text-white tracking-tight leading-none text-center",
          description: "text-[12px] text-white/70 text-center leading-tight mt-1 px-2", 
          actionButton: "bg-wa-green text-white h-8 px-4 text-[10px] font-bold uppercase tracking-widest rounded-full",
          cancelButton: "text-white/60 font-bold px-4 text-[10px] uppercase tracking-widest",
          success: "border-wa-green/50",
          error: "border-red-500/50",
        },
      }}
    />
  )
}
