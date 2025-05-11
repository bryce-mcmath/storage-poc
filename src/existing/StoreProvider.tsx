import React, { useReducer, useEffect, useMemo } from 'react'
import { StoreContext, initialState } from './StoreContext'
import { StoreState, StoreAction, User } from './types'
import { secureStorageService, storageService } from './storage'

// The reducer function
const storeReducer = (store: StoreState, action: StoreAction): StoreState => {
  switch (action.type) {
    // Auth cases
    case 'LOGIN_START':
      return {
        ...store,
        auth: {
          ...store.auth,
          isLoading: true,
          error: null,
        },
      }

    case 'LOGIN_SUCCESS':
      return {
        ...store,
        auth: {
          ...store.auth,
          isAuthenticated: true,
          isLoading: false,
          user: action.payload.user,
          token: action.payload.token,
          error: null,
        },
      }

    case 'LOGIN_FAILURE':
      return {
        ...store,
        auth: {
          ...store.auth,
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
          error: action.payload,
        },
      }

    case 'LOGOUT':
      return {
        ...store,
        auth: {
          ...store.auth,
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
        },
      }

    case 'RESTORE_TOKEN':
      return {
        ...store,
        auth: {
          ...store.auth,
          isAuthenticated: !!action.payload.token,
          isLoading: false,
          user: action.payload.user,
          token: action.payload.token,
          error: null,
        },
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

    case 'LOAD_SETTINGS':
      return {
        ...store,
        settings: {
          ...store.settings,
          ...action.payload,
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

  // Effect to bootstrap auth store and settings
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Load auth store
        const token = await secureStorageService.getToken()
        const user = token ? await storageService.getItem<User>('user') : null

        // Restore token and user
        dispatch({
          type: 'RESTORE_TOKEN',
          payload: { user, token: token || null },
        })

        // Load app settings
        const savedSettings = await storageService.getItem('app_settings')
        if (savedSettings) {
          dispatch({
            type: 'LOAD_SETTINGS',
            payload: savedSettings,
          })
        }
      } catch (e) {
        console.error('Failed to load persisted store:', e)
        dispatch({
          type: 'LOGIN_FAILURE',
          payload: 'Failed to restore application store',
        })
      }
    }

    bootstrapAsync()
  }, [])

  // Effect to save settings when they change
  useEffect(() => {
    if (store.auth.isLoading) return // Skip initial load

    const saveSettings = async () => {
      try {
        await storageService.setItem('app_settings', store.settings)
      } catch (e) {
        console.error('Failed to save settings:', e)
      }
    }

    saveSettings()
  }, [store.settings])

  // Memoize the context value to prevent unnecessary renders
  const contextValue = useMemo(() => {
    return { store, dispatch }
  }, [store])

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  )
}
