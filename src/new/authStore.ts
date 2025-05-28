import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { AuthState } from './types'
import { secureStorageService } from './storage'
import { zustandMMKVStorage } from './mmkvZustandAdapter'

// Create the auth store with persistence and secure storage
export const useAuthStore = create<
  AuthState & {
    createAccount: () => void;
    setDidAuthenticate: (value: boolean) => void;
  }
>()(
  persist(
    (set) => ({
      didAuthenticate: false,
      accountCreated: false,

      // Create account function
      createAccount: () => {
        // Update the store
        set({
          accountCreated: true,
          didAuthenticate: true,
        })
      },

      // Set authentication status
      setDidAuthenticate: (value: boolean) => {
        set({ didAuthenticate: value })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: state => ({
        accountCreated: state.accountCreated,
      }),
    },
  ),
)
