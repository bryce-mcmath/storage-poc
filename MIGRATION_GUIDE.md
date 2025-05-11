# Migration Guide: Context+AsyncStorage to Zustand+MMKV

This guide provides step-by-step instructions for migrating from the traditional Context+Reducer+AsyncStorage pattern to the more modern and performant Zustand+MMKV approach.

## Step 1: Install Dependencies

First, install the required dependencies:

```bash
# Install MMKV storage
npm install react-native-mmkv

# Install Zustand
npm install zustand

# Install Expo Secure Store (if using Expo)
npx expo install expo-secure-store
```

## Step 2: Set Up MMKV Storage Service

Create a storage service using MMKV that follows a similar API to AsyncStorage for easier migration:

```typescript
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV storage instance
export const storage = new MMKV({
  id: 'app-storage',
  encryptionKey: 'storage-encryption-key',
});

// MMKV storage service
export const storageService = {
  setItem: <T>(key: string, value: T): void => {
    try {
      const jsonValue = JSON.stringify(value);
      storage.set(key, jsonValue);
    } catch (e) {
      console.error('Error storing value:', e);
      throw e;
    }
  },

  getItem: <T>(key: string): T | null => {
    try {
      const value = storage.getString(key);
      return value ? JSON.parse(value) as T : null;
    } catch (e) {
      console.error('Error retrieving value:', e);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      storage.delete(key);
    } catch (e) {
      console.error('Error removing value:', e);
      throw e;
    }
  },

  clear: (): void => {
    try {
      storage.clearAll();
    } catch (e) {
      console.error('Error clearing storage:', e);
      throw e;
    }
  },
};
```

## Step 3: Set Up Secure Storage Service

Replace react-native-keychain with expo-secure-store:

```typescript
import * as SecureStore from 'expo-secure-store';

export const secureStorageService = {
  setCredentials: async (username: string, password: string): Promise<boolean> => {
    try {
      await SecureStore.setItemAsync('app.credentials.username', username);
      await SecureStore.setItemAsync('app.credentials.password', password);
      return true;
    } catch (e) {
      console.error('Error storing credentials:', e);
      return false;
    }
  },

  getCredentials: async (): Promise<{ username: string; password: string } | null> => {
    try {
      const username = await SecureStore.getItemAsync('app.credentials.username');
      const password = await SecureStore.getItemAsync('app.credentials.password');
      
      if (username && password) {
        return { username, password };
      }
      return null;
    } catch (e) {
      console.error('Error retrieving credentials:', e);
      return null;
    }
  },

  // Additional methods for token management, etc.
};
```

## Step 4: Convert Context+Reducer to Zustand Store

For each Context+Reducer combination:

### Original Context+Reducer:

```typescript
// AuthContext.tsx
import React, { createContext, useReducer, useEffect, useContext } from 'react';

// Action types, reducer, initial state...

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Effects, methods, etc.
  
  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### Zustand Equivalent:

```typescript
// authStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storage } from './storage';

// Create a custom storage adapter for MMKV
const zustandMMKVStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    storage.set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    storage.delete(name);
  },
};

// Create the auth store
export const useAuthStore = create(
  persist(
    (set) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      
      // Methods (actions) - these replace reducer actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // API call, etc.
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },
      
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
```

## Step 5: Update Component Usage

### Before (with Context):

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from './AuthContext';

const ProfileScreen = () => {
  const { state, login, logout } = useAuth();
  
  return (
    <View>
      {state.isAuthenticated ? (
        <>
          <Text>Welcome, {state.user.name}</Text>
          <Button title="Logout" onPress={logout} />
        </>
      ) : (
        <Button title="Login" onPress={() => login('email', 'password')} />
      )}
    </View>
  );
};
```

### After (with Zustand):

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuthStore } from './authStore';

const ProfileScreen = () => {
  const { isAuthenticated, user, login, logout } = useAuthStore();
  
  return (
    <View>
      {isAuthenticated ? (
        <>
          <Text>Welcome, {user.name}</Text>
          <Button title="Logout" onPress={logout} />
        </>
      ) : (
        <Button title="Login" onPress={() => login('email', 'password')} />
      )}
    </View>
  );
};
```

## Step 6: Remove Provider Wrappers

Since Zustand doesn't require providers, you can remove Context providers from your app:

### Before (with Context):

```tsx
// App.tsx
import React from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import MainApp from './MainApp';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### After (with Zustand):

```tsx
// App.tsx
import React from 'react';
import MainApp from './MainApp';

export default function App() {
  return <MainApp />;
}
```

## Step 7: Test and Verify Performance

Run performance tests to verify the improvements:

1. App startup time should be faster
2. Storage operations should be more responsive
3. UI interactions should feel snappier

## Common Pitfalls and Solutions

1. **Zustand store updates not triggering re-renders**
   - Make sure you're selecting only the specific state you need in components

2. **Migration path issues**
   - Consider running both systems in parallel during migration
   - Migrate one context at a time, starting with the simplest ones

3. **MMKV storage limitations**
   - MMKV has a size limit (~100MB), plan accordingly for very large datasets
   
4. **Debugging Zustand state**
   - Use the Zustand devtools middleware for easier debugging
