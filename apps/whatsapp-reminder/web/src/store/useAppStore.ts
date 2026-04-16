import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * 🟢 WHATSAPP MODERN PRO - UI STORE
 * Purely for Client-Side State. API data belongs to React Query.
 */
interface AppState {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  // Add other UI states here (e.g. current modal type, theme preference if not in context)
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      name: 'ingetin-ui-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
