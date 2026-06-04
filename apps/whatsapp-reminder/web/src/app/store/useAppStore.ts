import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * 🟢 WHATSAPP MODERN PRO - UI STORE
 * Purely for Client-Side State. API data belongs to React Query.
 */
interface AppState {
  theme: 'official-wa' | 'modern-dark' | 'glassmorphism';
  setTheme: (theme: 'official-wa' | 'modern-dark' | 'glassmorphism') => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'official-wa',
      setTheme: (theme) => set({ theme }),
      isSidebarOpen: false,
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      name: 'ingetin-ui-storage',
      version: 1, // Added versioning for robust local storage migration
      storage: createJSONStorage(() => localStorage),
    }
  )
);
