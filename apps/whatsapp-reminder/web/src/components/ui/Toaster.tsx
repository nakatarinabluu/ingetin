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
          toast: "group w-auto min-w-[280px] flex items-center justify-center gap-3 rounded-full bg-[#111b21] border border-white/10 shadow-wa p-4 font-sans pointer-events-auto",
          title: "text-[14px] font-bold text-white tracking-tight leading-none",
          description: "hidden", // Sembunyikan deskripsi untuk gaya minimalis WhatsApp
          actionButton: "bg-[#00a884] text-white h-8 px-4 text-[10px] font-bold uppercase tracking-widest rounded-full",
          cancelButton: "text-white/60 font-bold px-4 text-[10px] uppercase tracking-widest",
          success: "border-[#00a884]/50",
          error: "border-red-500/50",
        },
      }}
    />
  )
}
