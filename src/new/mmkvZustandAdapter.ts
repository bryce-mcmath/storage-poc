import { storage } from './storage'

// Custom storage adapter for Zustand that uses MMKV
export const zustandMMKVStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = storage.getString(name)
    return value ?? null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    storage.set(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    storage.delete(name)
  },
}
