import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { AuthState, User } from './types'
import { secureStorageService } from './storage'
import { zustandMMKVStorage } from './mmkvZustandAdapter'

// Create the auth store with persistence and secure storage
export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      // Login function
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Mock response
          const user: User = { id: '123', name: 'John Doe', email }
          const token = 'mock-token-123'

          // Store token securely
          await secureStorageService.setToken(token)

          // Update the store
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred'
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          })
        }
      },

      // Logout function
      logout: async () => {
        try {
          await secureStorageService.clearCredentials()

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
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
        user: state.user,
        // We don't persist the token in Zustand since it's stored in secure storage
      }),
      onRehydrateStorage: () => async state => {
        if (state) {
          // Check if we have a token in secure storage
          const token = await secureStorageService.getToken()

          // Update state with the token
          if (token) {
            state.token = token
            state.isAuthenticated = true
          }

          // Mark loading as complete
          state.isLoading = false
        }
      },
    },
  ),
)
