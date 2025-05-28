import AsyncStorage from '@react-native-async-storage/async-storage'

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