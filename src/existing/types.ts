// State for authentication
export interface AuthState {
  didAuthenticate: boolean
  accountCreated: boolean
}

// State for settings
export interface SettingsState {
  theme: 'light' | 'dark'
  language: 'en' | 'fr' | 'es'
  notifications: boolean
  biometricsEnabled: boolean
}

// Combined state interface
export interface StoreState {
  // Auth state
  authentication: AuthState
  //  settings state
  settings: SettingsState
  stateLoaded: boolean
}

// Action types
export type StoreAction =
  | { type: 'STATE_DISPATCH', payload: Partial<StoreState> }
  | { type: 'CREATE_ACCOUNT' }
  | { type: 'DID_AUTHENTICATE', payload?: boolean }
  | { type: 'TOGGLE_BIOMETRICS', payload?: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'fr' | 'es' }
  | { type: 'TOGGLE_NOTIFICATIONS' }