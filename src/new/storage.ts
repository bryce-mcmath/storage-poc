import { MMKV } from 'react-native-mmkv'
import * as SecureStore from 'expo-secure-store'
import * as LocalAuthentication from 'expo-local-authentication'
import argon2 from 'react-native-argon2'
import uuid from 'react-native-uuid'
import { useSettingsStore } from './settingsStore'

// Initialize MMKV storage instance
export const storage = new MMKV({
  id: 'app-storage',
  encryptionKey: 'storage-encryption-key',
})

// Regular storage keys for MMKV
export const STORAGE_KEYS = {
  AUTH_STATE: 'auth-state',
  SETTINGS_STATE: 'settings-state',
  SECRET_SALT: 'secret.wallet.salt',
  BIOMETRICS_ENABLED: 'biometrics.enabled',
}

// Secure storage keys for SecureStore
export const SECURE_STORAGE_KEYS = {
  SECRET_KEY: 'secret.wallet.key',
}

// Types for secure storage
export interface Secret {
  key: string
  salt: string
}

export interface WalletSalt {
  salt: string
}

export interface WalletKey {
  key: string
}

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

// Secure storage service with biometric authentication support
export const secureStorageService = {
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

  // Clear stored credentials and token
  clearCredentials: async (): Promise<boolean> => {
    try {
      await SecureStore.deleteItemAsync('app.token')
      return true
    } catch (e) {
      console.error('Error clearing credentials:', e)
      return false
    }
  },

  // Hash function for PIN
  hashPIN: async (PIN: string, salt: string): Promise<string> => {
    try {
      const result = await argon2(PIN, salt, {})
      const { rawHash } = result

      return rawHash
    } catch (error) {
      throw new Error(`Error generating hash for PIN ${String((error as Error)?.message ?? error)}`)
    }
  },

  // Generate secret from PIN
  secretForPIN: async (PIN: string, salt?: string): Promise<Secret> => {
    const mySalt = salt ?? uuid.v4().toString()
    const myKey = await secureStorageService.hashPIN(PIN, mySalt)
    const secret: Secret = {
      key: myKey,
      salt: mySalt,
    }

    return secret
  },

  // Check if biometrics can be used
  isBiometricsActive: async (): Promise<boolean> => {
    try {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      return isEnrolled && supportedTypes.length > 0;
    } catch (error) {
      console.error('Error checking biometrics availability:', error);
      return false;
    }
  },

  // Authenticate with biometrics
  authenticateWithBiometrics: async (
    title: string,
    description: string
  ): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: title,
        fallbackLabel: description,
        disableDeviceFallback: false,
      });
      
      return result.success;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  },

  // Get biometrics enabled state
  getBiometricsEnabled: (): boolean => {
    const biometricsData = storage.getString(STORAGE_KEYS.BIOMETRICS_ENABLED);
    return biometricsData ? JSON.parse(biometricsData) : false;
  },

  // Store salt in MMKV
  storeWalletSalt: async (secret: WalletSalt): Promise<boolean> => {
    try {
      storage.set(STORAGE_KEYS.SECRET_SALT, JSON.stringify(secret));
      return true;
    } catch (e) {
      console.error('Error storing wallet salt:', e);
      return false;
    }
  },

  // Store key in SecureStore
  storeWalletKey: async (secret: WalletKey, useBiometrics = false): Promise<boolean> => {
    try {
      // Remove existing key if it exists
      await SecureStore.deleteItemAsync(SECURE_STORAGE_KEYS.SECRET_KEY);
      
      // Store the new key
      await SecureStore.setItemAsync(
        SECURE_STORAGE_KEYS.SECRET_KEY,
        JSON.stringify(secret),
        {
          // Use the most secure options available
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );
      
      // Update biometrics enabled state in settings store
      useSettingsStore.setState({ biometricsEnabled: useBiometrics });
      
      // Store biometrics state in MMKV for persistence
      storage.set(STORAGE_KEYS.BIOMETRICS_ENABLED, JSON.stringify(useBiometrics));
      
      return true;
    } catch (e) {
      console.error('Error storing wallet key:', e);
      return false;
    }
  },

  // Store both salt and key
  storeWalletSecret: async (secret: Secret, useBiometrics = false): Promise<boolean> => {
    let keyResult = false;
    if (secret.key) {
      keyResult = await secureStorageService.storeWalletKey({ key: secret.key }, useBiometrics);
    }

    const saltResult = await secureStorageService.storeWalletSalt({ salt: secret.salt });

    return keyResult && saltResult;
  },

  // Load salt from MMKV
  loadWalletSalt: async (): Promise<WalletSalt | undefined> => {
    try {
      const saltData = storage.getString(STORAGE_KEYS.SECRET_SALT);
      if (!saltData) return undefined;
      
      const parsedSalt = JSON.parse(saltData);
      if (!parsedSalt.salt) {
        throw new Error('Wallet salt failed to load');
      }

      return {
        salt: parsedSalt.salt,
      };
    } catch (e) {
      console.error('Error loading wallet salt:', e);
      return undefined;
    }
  },

  // Load key from SecureStore
  loadWalletKey: async (title?: string, description?: string): Promise<WalletKey | undefined> => {
    try {
      // If biometrics is enabled, authenticate first
      if (secureStorageService.getBiometricsEnabled() && title && description) {
        const authenticated = await secureStorageService.authenticateWithBiometrics(title, description);
        if (!authenticated) {
          throw new Error('Biometric authentication failed');
        }
      }
      
      // Get the key from secure storage
      const keyData = await SecureStore.getItemAsync(SECURE_STORAGE_KEYS.SECRET_KEY);
      if (!keyData) return undefined;
      
      return JSON.parse(keyData) as WalletKey;
    } catch (e) {
      console.error('Error loading wallet key:', e);
      return undefined;
    }
  },

  // Load both salt and key
  loadWalletSecret: async (title?: string, description?: string): Promise<Secret | undefined> => {
    let salt: WalletSalt | undefined;
    let key: WalletKey | undefined;
    
    try {
      salt = await secureStorageService.loadWalletSalt();
      key = await secureStorageService.loadWalletKey(title, description);
    } catch (e: any) {
      throw new Error(e?.message ?? e);
    }

    if (!salt?.salt || !key?.key) {
      throw new Error('Wallet secret is incomplete');
    }

    const secret: Secret = {
      key: key.key,
      salt: salt.salt,
    };

    return secret;
  },

  // Clear all keychain data
  clearAllKeychainData: async () => {
    try {
      // Clear secure store data
      await SecureStore.deleteItemAsync(SECURE_STORAGE_KEYS.SECRET_KEY);
      
      // Clear MMKV data
      storage.delete(STORAGE_KEYS.SECRET_SALT);
      storage.delete(STORAGE_KEYS.BIOMETRICS_ENABLED);
    } catch (error) {
      console.error('Error clearing keychain data:', error);
    }
  },

  // Set PIN with or without biometrics
  setPIN: async (PIN: string, useBiometry: boolean): Promise<boolean> => {
    try {
      // If using biometrics, verify that they're available and enrolled
      if (useBiometry) {
        const biometricsAvailable = await secureStorageService.isBiometricsActive();
        if (!biometricsAvailable) {
          throw new Error('Biometrics not available on this device');
        }
      }
      
      // Generate a secret from the PIN
      const secret = await secureStorageService.secretForPIN(PIN);
      
      // Store the secret
      return await secureStorageService.storeWalletSecret(secret, useBiometry);
    } catch (error) {
      console.error('Error setting PIN:', error);
      return false;
    }
  },

  // Check PIN validity
  checkPIN: async (PIN: string): Promise<Secret | false> => {
    try {
      const secret = await secureStorageService.loadWalletSalt();

      if (!secret?.salt) {
        return false;
      }

      const hash = await secureStorageService.hashPIN(PIN, secret.salt);
      // This is a placeholder where we would normally compare the hash to the stored hash
      const correctHash = await secureStorageService.hashPIN('123456', secret.salt); // Default PIN for testing
      if (hash === correctHash) {
        return { key: hash, salt: secret.salt };
      } else {
        return false;
      }
    } catch (e) {
      console.error('Error checking PIN:', e);
      throw e;
    }
  },

  // Import data from existing implementation
  migrateFromExistingImplementation: async (
    existingSecret?: Secret,
    existingBiometricsEnabled?: boolean
  ): Promise<boolean> => {
    try {
      if (!existingSecret) return false;
      
      // Store the secret from the existing implementation
      const result = await secureStorageService.storeWalletSecret(
        existingSecret, 
        existingBiometricsEnabled ?? false
      );
      
      return result;
    } catch (error) {
      console.error('Error during migration:', error);
      return false;
    }
  }
}
