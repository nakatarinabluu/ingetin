import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserDTO, ReminderDTO } from '@ingetin/types';

// Extend UserDTO for frontend-specific state if needed
export interface ProfileState extends UserDTO {
  phoneNumber: string | null;
  isActivated: boolean;
  licenseStatus: string;
}

interface AppState {
  profile: ProfileState | null;
  setProfile: (profile: ProfileState) => void;
  clearProfile: () => void;
  reminders: ReminderDTO[];
  setReminders: (reminders: ReminderDTO[]) => void;
  addReminder: (reminder: ReminderDTO) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
      reminders: [],
      setReminders: (reminders) => set({ reminders }),
      addReminder: (reminder) => set((state) => ({ reminders: [...state.reminders, reminder] })),
    }),
    {
      name: 'ingetin-app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
