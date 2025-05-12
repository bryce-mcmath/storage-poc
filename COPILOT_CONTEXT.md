# GitHub Copilot Project Context

This file provides context about this project for GitHub Copilot to better assist with development tasks.

## Project Overview

This project is a proof of concept (POC) demonstrating a migration from traditional React Native state management and storage patterns to more modern and performant approaches:

### From:
- Context + Reducer for state management
- AsyncStorage for data storage
- react-native-keychain for secure credential storage

### To:
- Zustand for state management
- MMKV for data storage
- expo-secure-store for secure credential storage

## Project Structure

```
/src
  /existing - Traditional implementation
    StoreContext.tsx        - Context definition for the store
    StoreProvider.tsx       - Provider component with reducer implementation 
    StoreImplementation.tsx - Example component using Traditional implementation
    storage.ts             - AsyncStorage and react-native-keychain implementations
    types.ts               - TypeScript interfaces for the traditional implementation
  
  /new - Modern implementation
    appStore.ts         - App settings store using Zustand + MMKV
    authStore.ts        - Authentication store using Zustand + MMKV
    PerformanceComparison.tsx - Component to benchmark storage performance
    storage.ts          - MMKV and expo-secure-store implementations
    StoreExample.tsx    - Example component using Modern implementation
    types.ts            - TypeScript interfaces for the modern implementation
```

## Key Dependencies

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "1.21.0",
    "expo": "50.0.0",
    "expo-dev-client": "~3.3.12",
    "expo-secure-store": "~12.8.1",
    "expo-status-bar": "~1.7.0",
    "react": "18.2.0",
    "react-native": "0.73.11",
    "react-native-keychain": "^8.1.2",
    "react-native-mmkv": "^3.2.0",
    "zustand": "^5.0.4"
  }
}
```

## Key Components

### Traditional Implementation (src/existing)

1. **Single Store Context Approach**:
   - **StoreContext.tsx**: 
     - Defines the context and initial state
     - Provides a useStore hook for accessing store state and dispatch
   - **StoreProvider.tsx**:
     - Uses useReducer to manage state
     - Implements persistence with AsyncStorage and react-native-keychain
     - Handles loading and saving data

2. **storage.ts**:
   - Provides a wrapper around AsyncStorage for general data
   - Provides a wrapper around react-native-keychain for secure data
   - Handles common operations like get, set, remove, and clear

### Modern Implementation (src/new)

1. **appStore.ts**:
   - Uses Zustand for app settings state
   - Persists settings with MMKV
   - Provides same functionality as AppContext but with simpler API

2. **authStore.ts**:
   - Uses Zustand for authentication state
   - Stores auth token in expo-secure-store
   - Stores user data in MMKV
   - Automatically persists state across app restarts

3. **storage.ts**:
   - Provides a wrapper around MMKV for general data
   - Provides a wrapper around expo-secure-store for secure data
   - Synchronous API for general storage operations

4. **PerformanceComparison.tsx**:
   - Benchmarks performance of AsyncStorage vs MMKV
   - Demonstrates speed improvements for read/write operations

## Design Patterns

### Traditional Pattern
- Provider component hierarchy
- Context consumers using useContext
- Reducers for state updates
- Effects for persistence
- Async API for all storage operations

### Modern Pattern
- Flat state management with Zustand
- No provider hierarchy needed
- Store actions for state updates
- Built-in persistence middleware
- Synchronous API for MMKV operations

## Common Use Cases

1. **Storing user settings**:
   - Traditional: `useApp()` context + AsyncStorage
   - Modern: `useAppStore()` with MMKV persistence

2. **Authentication**:
   - Traditional: `useAuth()` context + react-native-keychain
   - Modern: `useAuthStore()` with expo-secure-store

3. **Performance testing**:
   - Use `PerformanceComparison` component to benchmark different storage approaches

## Migration Path

The project demonstrates a gradual migration path where you can:
1. Replace storage implementations first
2. Convert contexts to Zustand stores one by one
3. Remove provider wrappers when all contexts are migrated

## Documentation

1. **README.md**: Project overview
2. **MIGRATION_GUIDE.md**: Step-by-step migration instructions
3. **STORAGE_OPTIONS.md**: Detailed comparison of storage options

## Notes for GitHub Copilot

- When implementing new features, prefer the modern Zustand+MMKV pattern
- The project is an Expo app with native modules enabled (expo-dev-client)
- Secure storage uses expo-secure-store in the new implementation
- Performance is a key consideration, especially for storage operations
- App supports both light and dark themes
- Types for both implementations are available in their respective folders
