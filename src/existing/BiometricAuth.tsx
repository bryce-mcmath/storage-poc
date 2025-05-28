import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native'
import {
  isBiometricsActive,
  storeWalletSecret,
  loadWalletSecret,
  secretForPIN,
} from './keychain'

interface BiometricAuthProps {
  onAuthSuccess?: () => void
  onAuthFail?: (error: Error) => void
}

export const BiometricAuth: React.FC<BiometricAuthProps> = ({
  onAuthSuccess,
  onAuthFail,
}) => {
  const [biometricSupported, setBiometricSupported] = useState<boolean>(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    checkBiometricAvailability()
  }, [])

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

  const saveSecretWithBiometrics = async () => {
    try {
      if (!biometricSupported) {
        Alert.alert(
          'Error',
          'Biometric authentication is not available on this device',
        )
        return
      }

      // For demo purposes, we're using a hardcoded PIN
      // In a real app, you'd get this from user input
      const pin = '123456'

      // Generate a secret from the PIN
      const secret = await secretForPIN(pin)

      // Store the secret with biometric protection
      const result = await storeWalletSecret(secret, true)

      if (result) {
        Alert.alert('Success', 'Secret stored with biometric protection')
      } else {
        Alert.alert('Error', 'Failed to store secret')
      }
    } catch (error) {
      console.error('Error saving secret with biometrics:', error)
      Alert.alert(
        'Error',
        `Failed to store secret: ${(error as Error).message}`,
      )

      if (onAuthFail) {
        onAuthFail(error as Error)
      }
    }
  }

  const loadSecretWithBiometrics = async () => {
    try {
      if (!biometricSupported) {
        Alert.alert(
          'Error',
          'Biometric authentication is not available on this device',
        )
        return
      }

      const biometricPromptTitle = 'Authentication Required'
      const biometricPromptDesc =
        'Please authenticate using your biometrics to access your wallet'

      const secret = await loadWalletSecret(
        biometricPromptTitle,
        biometricPromptDesc,
      )

      if (secret && secret.key) {
        setIsAuthenticated(true)
        Alert.alert('Success', 'Authentication successful')

        if (onAuthSuccess) {
          onAuthSuccess()
        }
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error)
      Alert.alert('Authentication Failed', `${(error as Error).message}`)

      if (onAuthFail) {
        onAuthFail(error as Error)
      }
    }
  }

  const getBiometricType = () => {
    if (!biometricSupported) return 'None'
    if (Platform.OS === 'ios') {
      return 'Face ID/Touch ID'
    } else {
      return 'Fingerprint/Biometrics'
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Biometric Authentication Demo</Text>

      <Text style={styles.infoText}>
        Biometric Type Available: {getBiometricType()}
      </Text>

      <Text style={styles.statusText}>
        Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </Text>

      <TouchableOpacity
        style={[styles.button, !biometricSupported && styles.disabledButton]}
        onPress={saveSecretWithBiometrics}
        disabled={!biometricSupported}
      >
        <Text style={styles.buttonText}>Store Secret with Biometrics</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !biometricSupported && styles.disabledButton]}
        onPress={loadSecretWithBiometrics}
        disabled={!biometricSupported}
      >
        <Text style={styles.buttonText}>Authenticate with Biometrics</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
