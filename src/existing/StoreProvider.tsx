import React, { useReducer, useEffect } from 'react'
import { StoreContext, initialState } from './StoreContext'
import { StoreState, StoreAction, AuthState, SettingsState } from './types'
import { storageService } from './storage'

const persistState = (state: StoreState) => {
  if (state.stateLoaded) {
    storageService.setItem('authentication', state.authentication);
    storageService.setItem('app_settings', state.settings);
  }
};

// Reset state to initial values
export const resetState = async (
  dispatch: React.Dispatch<StoreAction>,
  preserveStorage: boolean = false
): Promise<void> => {
  dispatch({
    type: 'STATE_DISPATCH',
    payload: { ...initialState, stateLoaded: true }
  });
  
  if (!preserveStorage) {
    await storageService.removeItem('authentication');
    await storageService.removeItem('app_settings');
  }
};

const storeReducer = (store: StoreState, action: StoreAction): StoreState => {
  let newState: StoreState;
  
  switch (action.type) {
    case 'STATE_DISPATCH': {
      const stateUpdate: Partial<StoreState> = action?.payload ?? {}
      newState = { ...store, ...stateUpdate, stateLoaded: true };
      break;
    }

    case 'CREATE_ACCOUNT':
      newState = {
        ...store,
        authentication: {
          ...store.authentication,
          accountCreated: true,
        },
      };
      break;

    case 'DID_AUTHENTICATE':
      const didAuthenticate: boolean = action.payload ?? true
      newState = {
        ...store,
        authentication: { ...store.authentication, didAuthenticate },
      };
      break;

    case 'TOGGLE_BIOMETRICS':
      const biometricsEnabled: boolean = action.payload ?? !store.settings.biometricsEnabled
      newState = {
        ...store,
        settings: {
          ...store.settings,
          biometricsEnabled,
        }
      };
      break;

    case 'SET_THEME':
      newState = {
        ...store,
        settings: {
          ...store.settings,
          theme: action.payload,
        },
      };
      break;

    case 'SET_LANGUAGE':
      newState = {
        ...store,
        settings: {
          ...store.settings,
          language: action.payload,
        },
      };
      break;

    case 'TOGGLE_NOTIFICATIONS':
      newState = {
        ...store,
        settings: {
          ...store.settings,
          notifications: !store.settings.notifications,
        },
      };
      break;

    default:
      return store;
  }
  
  persistState(newState);
  return newState;
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [store, dispatch] = useReducer(storeReducer, initialState)

  useEffect(() => {
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
