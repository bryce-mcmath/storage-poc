// Common types for the modern implementation
export interface User {
  id: string
  name: string
  email: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export interface AppState {
  theme: 'light' | 'dark'
  language: 'en' | 'fr' | 'es'
  notifications: boolean
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: 'en' | 'fr' | 'es') => void
  toggleNotifications: () => void
}
