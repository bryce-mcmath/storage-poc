// Common types for the modern implementation

// State for authentication
export interface AuthState {
  didAuthenticate: boolean
  accountCreated: boolean
  didMigrate: boolean
}

export interface SettingsState {
  theme: 'light' | 'dark'
  language: 'en' | 'fr' | 'es'
  notifications: boolean
  biometricsEnabled: boolean
}
