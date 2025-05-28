import React, { useEffect, useState } from 'react'
import { useAuthStore } from './authStore'
import { useSettingsStore } from './settingsStore'
import {
  Text,
  View,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { secureStorageService } from './storage'
import { resetState } from './resetState'

type NewImplementationProps = {
  migrate: () => Promise<void>
}

export const NewImplementation: React.FC<NewImplementationProps> = ({
  migrate,
}) => {
  const { didAuthenticate, accountCreated, createAccount, setDidAuthenticate } =
    useAuthStore()

  const {
    theme,
    language,
    notifications,
    biometricsEnabled,
    setTheme,
    toggleNotifications,
    toggleBiometrics,
  } = useSettingsStore()

  const [biometricSupported, setBiometricSupported] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    checkBiometricAvailability()
  }, [])

  const checkBiometricAvailability = async () => {
    try {
      const isSupported = await secureStorageService.isBiometricsActive()
      setBiometricSupported(isSupported)

      if (!isSupported) {
        console.log('Biometrics not available or not enrolled')
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error)
    }
  }

  const handleCreateAccount = async () => {
    try {
      setLoading(true)
      if (biometricsEnabled) {
        await createAccountWithBiometrics()
      } else {
        await createAccountWithoutBiometrics()
      }
      await createAccount()
    } catch (error) {
      console.error('Account creation failed:', error)
      Alert.alert(
        'Error',
        `Failed to create account: ${(error as Error).message}`,
      )
    } finally {
      setLoading(false)
    }
  }

  const createAccountWithBiometrics = async () => {
    try {
      if (!biometricSupported) {
        Alert.alert(
          'Error',
          'Biometric authentication is not available on this device',
        )
        throw new Error('Biometrics not supported')
      }

      // For demo purposes, we're using a hardcoded PIN
      // In a real app, you'd get this from user input
      const pin = '123456'
      const valid = await secureStorageService.setPIN(pin, true)
      if (!valid) {
        Alert.alert('Error', 'Failed to store secret')
      }
    } catch (error) {
      console.error('Error saving secret with biometrics:', error)
      Alert.alert(
        'Error',
        `Failed to store secret: ${(error as Error).message}`,
      )
    }
  }

  const createAccountWithoutBiometrics = async () => {
    const pin = '123456'
    const valid = await secureStorageService.setPIN(pin, false)
    if (!valid) {
      Alert.alert('Error', 'Failed to store secret')
    }
  }

  const handleUnlock = async () => {
    try {
      setLoading(true)
      if (biometricsEnabled) {
        await unlockWithBiometrics()
      } else {
        await unlockWithPIN()
      }
    } catch (error) {
      console.error('Unlock failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const unlockWithBiometrics = async () => {
    try {
      if (!biometricSupported) {
        Alert.alert(
          'Error',
          'Biometric authentication is not available on this device',
        )
        throw new Error('Biometrics not supported')
      }

      const biometricPromptTitle = 'Authentication Required'
      const biometricPromptDesc =
        'Please authenticate using your biometrics to access your wallet'

      const secret = await secureStorageService.loadWalletSecret(
        biometricPromptTitle,
        biometricPromptDesc,
      )

      if (secret && secret.key) {
        setDidAuthenticate(true)
        Alert.alert('Success', 'Authentication successful')
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error)
      Alert.alert('Authentication Failed', `${(error as Error).message}`)
    }
  }

  const unlockWithPIN = async () => {
    try {
      // For demo purposes, we're using a hardcoded PIN
      // In a real app, you'd get this from user input
      const pin = '123456'

      const valid = await secureStorageService.checkPIN(pin)

      if (valid) {
        setDidAuthenticate(true)
        Alert.alert('Success', 'Authentication successful')
      } else {
        Alert.alert('Authentication Failed', 'Invalid PIN or secret mismatch')
      }
    } catch (error) {
      console.error('Error during PIN authentication:', error)
      Alert.alert('Authentication Failed', `${(error as Error).message}`)
    }
  }

  const handleLogout = async () => {
    setDidAuthenticate(false)
  }

  const handleToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const handleWipe = async () => {
    try {
      await secureStorageService.clearAllKeychainData()
      await resetState()
    } catch (error) {
      console.error('Failed to wipe data:', error)
    }
  }

  const handleMigrate = async () => {
    console.log('Switching to old implementation...')
    await migrate()
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === 'light' ? '#fff' : '#333' },
      ]}
    >
      <Text
        style={[styles.title, { color: theme === 'light' ? '#000' : '#fff' }]}
      >
        Zustand + MMKV
      </Text>
      <Text
        style={[styles.text, { color: theme === 'light' ? '#000' : '#fff' }]}
      >
        {didAuthenticate ? 'Welcome' : 'Please login'}
      </Text>

      {loading ? (
        <ActivityIndicator />
      ) : didAuthenticate ? (
        <>
          <Text
            style={[
              styles.text,
              { color: theme === 'light' ? '#000' : '#fff' },
            ]}
          >
            Current language: {language}
          </Text>

          <Text
            style={[
              styles.text,
              { color: theme === 'light' ? '#000' : '#fff' },
            ]}
          >
            Notifications: {notifications ? 'Enabled' : 'Disabled'}
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme`}
              onPress={handleToggleTheme}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={`${notifications ? 'Disable' : 'Enable'} Notifications`}
              onPress={toggleNotifications}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Logout" onPress={handleLogout} />
          </View>
        </>
      ) : (
        <>
          <View style={styles.buttonContainer}>
            <Text
              style={[
                styles.text,
                { color: theme === 'light' ? '#000' : '#fff' },
              ]}
            >
              Biometrics: {biometricsEnabled ? 'Enabled' : 'Disabled'}
            </Text>
            <Button
              title={
                biometricsEnabled ? 'Disable Biometrics' : 'Enable Biometrics'
              }
              onPress={toggleBiometrics}
            />
          </View>
          <View style={styles.buttonContainer}>
            {accountCreated ? (
              <Button title="Login" onPress={handleUnlock} />
            ) : (
              <Button title="Create account" onPress={handleCreateAccount} />
            )}
          </View>
        </>
      )}

      {!loading && (
        <>
          <View style={styles.buttonContainer}>
            <Button title="Wipe Data" onPress={handleWipe} />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Switch to Old View" onPress={handleMigrate} />
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
})
