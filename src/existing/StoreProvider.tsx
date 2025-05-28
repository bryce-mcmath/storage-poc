import React, { useReducer, useEffect } from 'react'
import { StoreContext, initialState } from './StoreContext'
import { StoreState, StoreAction, AuthState, SettingsState } from './types'
import { storageService } from './storage'

// The reducer function
const storeReducer = (store: StoreState, action: StoreAction): StoreState => {
  switch (action.type) {
    case 'STATE_DISPATCH': {
      const newState: Partial<StoreState> = action?.payload ?? {}
      return { ...store, ...newState, stateLoaded: true }
    }

    case 'CREATE_ACCOUNT':
      return {
        ...store,
        authentication: {
          ...store.authentication,
          accountCreated: true,
        },
      }

    case 'DID_AUTHENTICATE':
      const didAuthenticate: boolean = action.payload ?? true
      return {
        ...store,
        authentication: { ...store.authentication, didAuthenticate },
      }

    case 'TOGGLE_BIOMETRICS':
      const biometricsEnabled: boolean = action.payload ?? !store.settings.biometricsEnabled
      return {
        ...store,
        settings: {
          ...store.settings,
          biometricsEnabled,
        }
      }

    // App settings cases
    case 'SET_THEME':
      return {
        ...store,
        settings: {
          ...store.settings,
          theme: action.payload,
        },
      }

    case 'SET_LANGUAGE':
      return {
        ...store,
        settings: {
          ...store.settings,
          language: action.payload,
        },
      }

    case 'TOGGLE_NOTIFICATIONS':
      return {
        ...store,
        settings: {
          ...store.settings,
          notifications: !store.settings.notifications,
        },
      }

    default:
      return store
  }
}

// Provider component
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [store, dispatch] = useReducer(storeReducer, initialState)

  useEffect(() => {
    // Load initial auth state from secure storage
    const loadState = async () => {
      try {
        const authentication = await storageService.getItem<AuthState>('authentication')
        const settings = await storageService.getItem<SettingsState>('app_settings')
        const state: Partial<StoreState> = {
          ...initialState,
          authentication: authentication || initialState.authentication,
          settings: settings || initialState.settings, 
        }
        
        dispatch({
            type: 'STATE_DISPATCH',
            payload: state
        })
      } catch (e) {
        console.error('Failed to load auth state:', e)
      }
    }

    loadState()
  }, [])

  return (
    <StoreContext.Provider value={[store, dispatch]}>
      {children}
    </StoreContext.Provider>
  )
}
