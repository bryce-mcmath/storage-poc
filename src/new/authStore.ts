import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { AuthState } from './types'
import { secureStorageService } from './storage'
import { zustandMMKVStorage } from './mmkvZustandAdapter'

// Create the auth store with persistence and secure storage
export const useAuthStore = create<
  AuthState & {
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    createAccount: () => Promise<void>;
    setDidAuthenticate: (value: boolean) => void;
  }
>()(
  persist(
    (set) => ({
      didAuthenticate: false,
      accountCreated: false,

      // Create account function
      createAccount: async () => {
        try {
          // Simulate account creation
          await new Promise(resolve => setTimeout(resolve, 500))

          // Update the store
          set({
            accountCreated: true,
            didAuthenticate: true,
          })
        } catch (error) {
          console.error('Account creation error:', error)
        }
      },

      // Set authentication status
      setDidAuthenticate: (value: boolean) => {
        set({ didAuthenticate: value })
      },

      // Login function
      login: async (email: string, password: string) => {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500))

          // Store token securely (simplified)
          await secureStorageService.setToken('auth-token')

          // Update the store
          set({
            didAuthenticate: true,
          })
        } catch (error) {
          console.error('Login error:', error)
        }
      },

      // Logout function
      logout: async () => {
        try {
          await secureStorageService.clearCredentials()

          set({
            didAuthenticate: false,
          })
        } catch (error) {
          console.error('Logout error:', error)
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
      partialize: state => ({
        accountCreated: state.accountCreated,
      }),
      onRehydrateStorage: () => async state => {
        if (state) {
          // Check if we have a token in secure storage
          const token = await secureStorageService.getToken()

          // Update state with the token
          if (token) {
            state.didAuthenticate = true
          }
        }
      },
    },
  ),
)
