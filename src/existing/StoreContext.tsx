import { createContext, useContext } from 'react'
import { StoreState, StoreAction } from './types'

// Define the context type with dispatch
export interface StoreContextType {
  store: StoreState
  dispatch: React.Dispatch<StoreAction>
}

// Initial state
export const initialState: StoreState = {
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  },
  settings: {
    theme: 'light',
    language: 'en',
    notifications: true,
  },
}

// Create the context
export const StoreContext = createContext<StoreContextType | undefined>(
  undefined,
)

// Create a hook for using the context
export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}
