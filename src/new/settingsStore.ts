import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { SettingsState } from './types'
import { zustandMMKVStorage } from './mmkvZustandAdapter'

const initialSettingsState: SettingsState = {
  theme: 'light',
  language: 'en',
  notifications: true,
  biometricsEnabled: false,
}

export const useSettingsStore = create<
  SettingsState & {
    setTheme: (theme: 'light' | 'dark') => void;
    setLanguage: (language: 'en' | 'fr' | 'es') => void;
    toggleNotifications: () => void;
    toggleBiometrics: () => void;
    resetState: () => void;
  }
>()(
  persist(
    set => ({
      ...initialSettingsState,
      setTheme: theme => set({ theme }),
      setLanguage: language => set({ language }),
      toggleNotifications: () =>
        set(state => ({ notifications: !state.notifications })),
      toggleBiometrics: () =>
        set(state => ({ biometricsEnabled: !state.biometricsEnabled })),
      resetState: () => {
        set(initialSettingsState)
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
)
