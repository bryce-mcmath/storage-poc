import { useAuthStore } from './authStore'
import { useSettingsStore } from './settingsStore'
import { storageService } from './storage'

/**
 * Reset all state to initial values.
 *
 * @param preserveStorage If true, only resets the in-memory state without affecting
 *                        the persisted state in storage. Default is false.
 */
export const resetState = async (
  preserveStorage: boolean = false,
): Promise<void> => {
  useAuthStore.getState().resetState()
  useSettingsStore.getState().resetState()

  if (!preserveStorage) {
    await storageService.removeItem('auth-storage')
    await storageService.removeItem('settings-storage')
  }
}
