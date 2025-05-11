import React from 'react'
import { StyleSheet, Text, View, Button } from 'react-native'
import { useStore } from './StoreContext'
import { User } from './types'
import { secureStorageService, storageService } from './storage'

// Component that demonstrates using the store hooks
export const StoreImplementation: React.FC = () => {
  // Get auth state and actions
  const { store, dispatch } = useStore()

  // Event handlers
  const handleLogin = async () => {
    dispatch({ type: 'LOGIN_START' })

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      const email = 'joe@example.com'
      // Mock response
      const user: User = { id: '123', name: 'John Doe', email }
      const token = 'mock-token-123'

      // Store auth data
      await secureStorageService.setToken(token)
      await storageService.setItem('user', user)

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      })
    }
  }

  const handleLogout = async () => {
    try {
      await secureStorageService.clearCredentials()
      await storageService.removeItem('user')

      dispatch({ type: 'LOGOUT' })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleNotifications = () => {
    dispatch({ type: 'TOGGLE_NOTIFICATIONS' })
  }

  const handleToggleTheme = () => {
    const newTheme = store.settings.theme === 'light' ? 'dark' : 'light'
    dispatch({ type: 'SET_THEME', payload: newTheme })
  }

  // Show loading state
  if (store.auth.isLoading) {
    return <Text>Loading...</Text>
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
        Single Context + Reducer Store
      </Text>

      {store.auth.error && <Text style={styles.error}>{store.auth.error}</Text>}

      <Text
        style={[
          styles.text,
          { color: store.settings.theme === 'light' ? '#000' : '#fff' },
        ]}
      >
        {store.auth.isAuthenticated
          ? `Welcome, ${store.auth.user?.name}`
          : 'Please login'}
      </Text>

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
        Notifications: {store.settings.notifications ? 'Enabled' : 'Disabled'}
      </Text>

      <View style={styles.buttonContainer}>
        {!store.auth.isAuthenticated ? (
          <Button title="Login" onPress={handleLogin} />
        ) : (
          <Button title="Logout" onPress={handleLogout} />
        )}
      </View>

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
