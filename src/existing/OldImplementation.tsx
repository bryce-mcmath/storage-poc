import React, { useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, View, Button, Alert, Platform } from 'react-native'
import { initialState, useStore } from './StoreContext'
import {
  clearAllKeychainData,
  isBiometricsActive,
  loadWalletSecret,
  checkPIN,
  setPIN,
} from './keychain'
import { storageService } from './storage'

type OldImplementationProps = {
  migrate: () => Promise<void>
}

// Component that demonstrates using the store hooks
export const OldImplementation: React.FC<OldImplementationProps> = ({ migrate }) => {
  // Get auth state and actions
  const [store, dispatch] = useStore()
  const [biometricSupported, setBiometricSupported] = useState<boolean>(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const checkBiometricAvailability = async () => {
    try {
      const isSupported = await isBiometricsActive()
      setBiometricSupported(isSupported)

      if (!isSupported) {
        console.log('Biometrics not available or not enrolled')
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error)
    }
  }

  useEffect(() => {
    checkBiometricAvailability()
  }, [])

  const toggleBiometrics = () => {
    dispatch({ type: 'TOGGLE_BIOMETRICS' })
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
      const valid = await setPIN(pin, true)
      if (valid) {
        Alert.alert('Success', 'Secret stored with biometric protection')
        dispatch({ type: 'CREATE_ACCOUNT' })
        dispatch({ type: 'DID_AUTHENTICATE', payload: true })
      } else {
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
    const valid = await setPIN(pin, false)
    if (valid) {
      Alert.alert('Success', 'Secret stored with pin')
      dispatch({ type: 'CREATE_ACCOUNT' })
      dispatch({ type: 'DID_AUTHENTICATE', payload: true })
    } else {
      Alert.alert('Error', 'Failed to store secret')
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

      const secret = await loadWalletSecret(
        biometricPromptTitle,
        biometricPromptDesc,
      )

      if (secret && secret.key) {
        dispatch({ type: 'DID_AUTHENTICATE', payload: true })
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

      // Generate the secret from the PIN
      const valid = await checkPIN(pin)

      if (valid) {
        dispatch({ type: 'DID_AUTHENTICATE', payload: true })
        Alert.alert('Success', 'Authentication successful')
      } else {
        Alert.alert('Authentication Failed', 'Invalid PIN or secret mismatch')
      }
    } catch (error) {
      console.error('Error during PIN authentication:', error)
      Alert.alert('Authentication Failed', `${(error as Error).message}`)
    }
  }

  const biometryType = useMemo(() => {
    if (!biometricSupported) return 'None'
    if (Platform.OS === 'ios') {
      return 'Face ID/Touch ID'
    } else {
      return 'Fingerprint/Biometrics'
    }
  }, [biometricSupported])

  const handleCreateAccount = async () => {
    try {
      setLoading(true)
      if (store.settings.biometricsEnabled) {
        await createAccountWithBiometrics()
      } else {
        await createAccountWithoutBiometrics()
      }
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

  // Event handlers
  const handleUnlock = async () => {
    try {
      setLoading(true)
      if (store.settings.biometricsEnabled) {
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

  const handleLogout = async () => {
    dispatch({ type: 'DID_AUTHENTICATE', payload: false })
  }

  const toggleNotifications = () => {
    dispatch({ type: 'TOGGLE_NOTIFICATIONS' })
  }

  const handleToggleTheme = () => {
    const newTheme = store.settings.theme === 'light' ? 'dark' : 'light'
    dispatch({ type: 'SET_THEME', payload: newTheme })
  }

  const handleWipe = async () => {
    try {
      dispatch({ type: 'STATE_DISPATCH', payload: initialState })
      await clearAllKeychainData()
      await storageService.clear()
    } catch (error) {
      console.error('Failed to wipe data:', error)
    }
  }

  const handleMigrate = async () => {
    console.log('Migrating from old to new...')
    await migrate()
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: store.settings.theme === 'light' ? '#fff' : '#333' },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: store.settings.theme === 'light' ? '#000' : '#fff' },
        ]}
      >
        Context + Reducer Store, with AsyncStorage
      </Text>

      <Text
        style={[
          styles.text,
          { color: store.settings.theme === 'light' ? '#000' : '#fff' },
        ]}
      >
        {store.authentication.didAuthenticate ? 'Welcome' : 'Please login'}
      </Text>

      {store.authentication.didAuthenticate ? (
        <>
          <Text
            style={[
              styles.text,
              { color: store.settings.theme === 'light' ? '#000' : '#fff' },
            ]}
          >
            Current language: {store.settings.language}
          </Text>

          <Text
            style={[
              styles.text,
              { color: store.settings.theme === 'light' ? '#000' : '#fff' },
            ]}
          >
            Notifications:{' '}
            {store.settings.notifications ? 'Enabled' : 'Disabled'}
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              title={`Switch to ${
                store.settings.theme === 'light' ? 'Dark' : 'Light'
              } Theme`}
              onPress={handleToggleTheme}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={`${
                store.settings.notifications ? 'Disable' : 'Enable'
              } Notifications`}
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
                { color: store.settings.theme === 'light' ? '#000' : '#fff' },
              ]}
            >
              Biometrics:{' '}
              {store.settings.biometricsEnabled ? 'Enabled' : 'Disabled'}
            </Text>
            <Button
              title={
                store.settings.biometricsEnabled
                  ? 'Disable Biometrics'
                  : 'Enable Biometrics'
              }
              onPress={toggleBiometrics}
            />
          </View>
          <View style={styles.buttonContainer}>
            {store.authentication.accountCreated ? (
              <Button title="Login" onPress={handleUnlock} />
            ) : (
              <Button title="Create account" onPress={handleCreateAccount} />
            )}
          </View>
        </>
      )}
      
      {/* Always visible buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Wipe Data" onPress={handleWipe} />
        <Button title="Migrate to New Store" onPress={handleMigrate} />
      </View>
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
  error: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
})
