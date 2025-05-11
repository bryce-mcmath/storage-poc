import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { AppState } from './types'
import { zustandMMKVStorage } from './mmkvZustandAdapter'

// Create the settings store with persistence
export const useSettingsStore = create<AppState>()(
  persist(
    set => ({
      theme: 'light',
      language: 'en',
      notifications: true,

      // Action to set theme
      setTheme: theme => set({ theme }),

      // Action to set language
      setLanguage: language => set({ language }),

      // Action to toggle notifications
      toggleNotifications: () =>
        set(state => ({ notifications: !state.notifications })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
)
