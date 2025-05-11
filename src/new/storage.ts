import { MMKV } from 'react-native-mmkv'
import * as SecureStore from 'expo-secure-store'

// Initialize MMKV storage instance
export const storage = new MMKV({
  id: 'app-storage',
  encryptionKey: 'storage-encryption-key',
})

// MMKV storage service
export const storageService = {
  // Store a value
  setItem: <T>(key: string, value: T): void => {
    try {
      const jsonValue = JSON.stringify(value)
      storage.set(key, jsonValue)
    } catch (e) {
      console.error('Error storing value:', e)
      throw e
    }
  },

  // Get a value
  getItem: <T>(key: string): T | null => {
    try {
      const value = storage.getString(key)
      return value ? (JSON.parse(value) as T) : null
    } catch (e) {
      console.error('Error retrieving value:', e)
      return null
    }
  },

  // Remove a value
  removeItem: (key: string): void => {
    try {
      storage.delete(key)
    } catch (e) {
      console.error('Error removing value:', e)
      throw e
    }
  },

  // Clear all storage
  clear: (): void => {
    try {
      storage.clearAll()
    } catch (e) {
      console.error('Error clearing storage:', e)
      throw e
    }
  },
}

// Secure storage service using expo-secure-store
export const secureStorageService = {
  // Store credentials securely
  setCredentials: async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      await SecureStore.setItemAsync('app.credentials.username', username)
      await SecureStore.setItemAsync('app.credentials.password', password)
      return true
    } catch (e) {
      console.error('Error storing credentials:', e)
      return false
    }
  },

  // Get stored credentials
  getCredentials: async (): Promise<{
    username: string
    password: string
  } | null> => {
    try {
      const username = await SecureStore.getItemAsync(
        'app.credentials.username',
      )
      const password = await SecureStore.getItemAsync(
        'app.credentials.password',
      )

      if (username && password) {
        return { username, password }
      }
      return null
    } catch (e) {
      console.error('Error retrieving credentials:', e)
      return null
    }
  },

  // Store token
  setToken: async (token: string): Promise<boolean> => {
    try {
      await SecureStore.setItemAsync('app.token', token)
      return true
    } catch (e) {
      console.error('Error storing token:', e)
      return false
    }
  },

  // Get stored token
  getToken: async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync('app.token')
    } catch (e) {
      console.error('Error retrieving token:', e)
      return null
    }
  },

  // Clear stored credentials
  clearCredentials: async (): Promise<boolean> => {
    try {
      await SecureStore.deleteItemAsync('app.credentials.username')
      await SecureStore.deleteItemAsync('app.credentials.password')
      await SecureStore.deleteItemAsync('app.token')
      return true
    } catch (e) {
      console.error('Error clearing credentials:', e)
      return false
    }
  },
}
