import { loadWalletSecret as loadExistingSecret } from './existing/keychain'

import { secureStorageService } from './new/storage'

import { storageService as existingStorageService } from './existing/storage'
import { AuthState, SettingsState } from './existing/types'
import { useAuthStore } from './new/authStore'
import { useSettingsStore } from './new/settingsStore'

export const migrateFromExistingToNew = async (): Promise<boolean> => {
  try {
    // Transfer state management
    const settingsState = await existingStorageService.getItem<SettingsState>(
      'app_settings',
    )
    const authState = await existingStorageService.getItem<AuthState>(
      'authentication',
    )

    if (authState) {
      useAuthStore.setState({ ...authState, didMigrate: true })
    }
    if (settingsState) {
      useSettingsStore.setState({ ...settingsState })
    }

    // Transfer secret
    try {
      const secret = await loadExistingSecret()
      if (secret) {
        const biometricsEnabled = settingsState?.biometricsEnabled || false
        await secureStorageService.storeWalletSecret(secret, biometricsEnabled)
      }
    } catch (error) {
      console.error(
        "Error transferring existing secret, maybe it doesn't exist:",
        error,
      )
    }

    console.log('Migration completed')
    return true
  } catch (error) {
    console.error('Migration failed:', error)
    return false
  }
}
