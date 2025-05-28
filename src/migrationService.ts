import { 
  loadWalletSecret as loadExistingSecret,
  clearAllKeychainData as clearExistingData
} from './existing/keychain';

import { 
  secureStorageService,
  storage,
  STORAGE_KEYS
} from './new/storage';

import { storageService as existingStorageService } from './existing/storage';
import { AuthState, SettingsState } from './existing/types';
import { useAuthStore } from './new/authStore';
import { useSettingsStore } from './new/settingsStore';

// Function to migrate from existing implementation to new implementation
export const migrateFromExistingToNew = async (): Promise<boolean> => {
  try {
    let migrationSuccess = true;
    
    // 1. Migrate wallet secrets (secure storage)
    const secret = await loadExistingSecret();
    
    if (secret) {
      // Get biometrics setting from AsyncStorage
      const settings = await existingStorageService.getItem<SettingsState>('app_settings');
      const biometricsEnabled = settings?.biometricsEnabled || false;
      
      // Store wallet secret in new implementation
      const walletSecretMigrated = await secureStorageService.storeWalletSecret(secret, biometricsEnabled);
      
      if (!walletSecretMigrated) {
        console.warn('Failed to migrate wallet secret');
        migrationSuccess = false;
      }
    } else {
      console.log('No wallet secrets to migrate');
    }
    
    // 2. Migrate authentication state
    const authState = await existingStorageService.getItem<AuthState>('authentication');
    if (authState) {
      // Update Zustand auth store
      useAuthStore.setState({
        didAuthenticate: authState.didAuthenticate,
        accountCreated: authState.accountCreated
      });
    } else {
      console.log('No authentication state to migrate');
    }
    
    // 3. Migrate settings state
    const settingsState = await existingStorageService.getItem<SettingsState>('app_settings');
    if (settingsState) {
      // Update Zustand settings store
      useSettingsStore.setState({
        theme: settingsState.theme,
        language: settingsState.language,
        notifications: settingsState.notifications,
        biometricsEnabled: settingsState.biometricsEnabled
      });
      
      // Also store biometrics state in regular storage for the secure storage service
      storage.set(STORAGE_KEYS.BIOMETRICS_ENABLED, JSON.stringify(settingsState.biometricsEnabled));
    } else {
      console.log('No settings state to migrate');
    }
    
    console.log('Migration completed with status:', migrationSuccess ? 'success' : 'partial failure');
    return migrationSuccess;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};

// Function to wipe all data from both implementations
export const wipeAllData = async (): Promise<void> => {
  try {
    // Clear existing implementation data
    await clearExistingData();
    await existingStorageService.clear();
    
    // Clear new implementation data
    await secureStorageService.clearAllKeychainData();
    storage.clearAll();
    
    // Reset Zustand stores to initial state
    useAuthStore.setState({
      didAuthenticate: false,
      accountCreated: false
    });
    
    useSettingsStore.setState({
      theme: 'light',
      language: 'en',
      notifications: true,
      biometricsEnabled: false
    });
    
    console.log('All data wiped successfully');
  } catch (error) {
    console.error('Error wiping data:', error);
  }
};
