import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { SettingsState } from './types'
import { zustandMMKVStorage } from './mmkvZustandAdapter'

// Create the settings store with persistence
export const useSettingsStore = create<
  SettingsState & {
    setTheme: (theme: 'light' | 'dark') => void;
    setLanguage: (language: 'en' | 'fr' | 'es') => void;
    toggleNotifications: () => void;
    toggleBiometrics: () => void;
  }
>()(
  persist(
    set => ({
      theme: 'light',
      language: 'en',
      notifications: true,
      biometricsEnabled: false,

      // Action to set theme
      setTheme: theme => set({ theme }),

      // Action to set language
      setLanguage: language => set({ language }),

      // Action to toggle notifications
      toggleNotifications: () =>
        set(state => ({ notifications: !state.notifications })),
        
      // Action to toggle biometrics
      toggleBiometrics: () =>
        set(state => ({ biometricsEnabled: !state.biometricsEnabled })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
)
