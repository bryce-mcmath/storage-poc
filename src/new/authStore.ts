import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { AuthState } from './types'
import { zustandMMKVStorage } from './mmkvZustandAdapter'

const initialAuthState: AuthState = {
  didAuthenticate: false,
  accountCreated: false,
  didMigrate: false,
}

export const useAuthStore = create<
  AuthState & {
    createAccount: () => void;
    setDidAuthenticate: (value: boolean) => void;
    resetState: () => void;
  }
>()(
  persist(
    (set) => ({
      ...initialAuthState,

      createAccount: () => {
        set({
          accountCreated: true,
          didAuthenticate: true,
          didMigrate: true,
        })
      },

      setDidAuthenticate: (value: boolean) => {
        set({ didAuthenticate: value })
      },
      
      resetState: () => {
        set(initialAuthState)
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    },
  ),
)
