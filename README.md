# Storage and State Management Migration POC

This project demonstrates a migration from a traditional React Native state management approach to a more modern and performant one. It provides a side-by-side comparison of both implementations, along with performance benchmarks.

## Existing Implementation (`src/existing/`)

The existing implementation uses:

- **State Management**: React Context API with useReducer
- **Data Storage**: AsyncStorage for general data
- **Secure Storage**: react-native-keychain for sensitive data (v8.x.x)

This represents a common pattern used in many React Native applications built in recent years.

## New Implementation (`src/new/`)

The new implementation uses:

- **State Management**: Zustand
- **Data Storage**: React Native MMKV
- **Secure Storage**: Expo Secure Store

## Key Differences

### State Management

**Context + Reducer (Existing)**
- Verbose boilerplate code
- Requires provider wrapping
- Explicit separation of state and actions
- Makes testing components slightly more complex
- No built-in persistence

**Zustand (New)**
- Minimal boilerplate
- No providers needed
- Integrated state and actions in one store
- Easier to test components
- Built-in persistence middleware

### Storage

**AsyncStorage (Existing)**
- Asynchronous API
- Serialization required (JSON.stringify/parse)
- String-only storage
- Less performant for large datasets or frequent access

**MMKV (New)**
- Synchronous API
- Multiple data types supported
- Up to 10x faster than AsyncStorage
- Native implementation with high performance

### Secure Storage

**react-native-keychain (Existing)**
- Uses Keychain (iOS) and Keystore (Android)
- Limited to username/password and generic secure items
- More complex API

**expo-secure-store (New)**
- Similar security guarantees 
- Simpler, more consistent API across platforms
- Better integrated with Expo ecosystem

## Performance Comparison

The MMKV storage implementation is significantly faster than AsyncStorage, especially for:
- App startup time
- Frequent read/write operations
- Large datasets

## Usage

This app demonstrates both implementations side-by-side for comparison. Toggle between them using the header buttons.

## Migration Tips

When migrating from the existing approach to the new one:

1. Start by replacing AsyncStorage with MMKV for an immediate performance boost
2. Convert your contexts and reducers to Zustand stores one by one
3. Replace react-native-keychain usage with expo-secure-store
4. Remove provider wrappers as they're no longer needed with Zustand
