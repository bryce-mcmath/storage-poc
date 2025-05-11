import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Keychain from 'react-native-keychain'

// Storage service using AsyncStorage
export const storageService = {
  // Store a value
  setItem: async (key: string, value: any): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
    } catch (e) {
      console.error('Error storing value:', e)
      throw e
    }
  },

  // Get a value
  getItem: async <T>(key: string): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (e) {
      console.error('Error retrieving value:', e)
      return null
    }
  },

  // Remove a value
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key)
    } catch (e) {
      console.error('Error removing value:', e)
      throw e
    }
  },

  // Clear all storage
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear()
    } catch (e) {
      console.error('Error clearing storage:', e)
      throw e
    }
  },
}

// Keychain service for secure storage
export const secureStorageService = {
  // Store credentials securely
  setCredentials: async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const result = await Keychain.setGenericPassword(username, password, {
        service: 'app.credentials',
      })
      return result !== false
    } catch (e) {
      console.error('Error storing credentials:', e)
      return false
    }
  },

  // Get stored credentials
  getCredentials: async (): Promise<
    { username: string; password: string } | false
  > => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: 'app.credentials',
      })
      return credentials || false
    } catch (e) {
      console.error('Error retrieving credentials:', e)
      return false
    }
  },

  // Store an access token
  setToken: async (token: string): Promise<boolean> => {
    try {
      const result = await Keychain.setGenericPassword('token', token, {
        service: 'app.token',
      })
      return result !== false
    } catch (e) {
      console.error('Error storing token:', e)
      return false
    }
  },

  // Get stored token
  getToken: async (): Promise<string | null> => {
    try {
      const result = await Keychain.getGenericPassword({
        service: 'app.token',
      })
      return result ? result.password : null
    } catch (e) {
      console.error('Error retrieving token:', e)
      return null
    }
  },

  // Clear stored credentials
  clearCredentials: async (): Promise<boolean> => {
    try {
      await Keychain.resetGenericPassword({
        service: 'app.credentials',
      })
      await Keychain.resetGenericPassword({
        service: 'app.token',
      })
      return true
    } catch (e) {
      console.error('Error clearing credentials:', e)
      return false
    }
  },
}
