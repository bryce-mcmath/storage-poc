// Common types for the existing implementation
export interface User {
  id: string
  name: string
  email: string
}

// State for authentication
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// State for settings
export interface SettingsState {
  theme: 'light' | 'dark'
  language: 'en' | 'fr' | 'es'
  notifications: boolean
}

// Combined state interface
export interface StoreState {
  // Auth state
  auth: AuthState
  //  settings state
  settings: SettingsState
}

// Action types
export type StoreAction =
  // Auth actions
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | {
      type: 'RESTORE_TOKEN'
      payload: { user: User | null; token: string | null }
    }
  //  setting actions
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'fr' | 'es' }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'LOAD_SETTINGS'; payload: Partial<SettingsState> }
