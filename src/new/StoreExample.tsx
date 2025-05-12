import React from 'react'
import { useAuthStore } from './authStore'
import { useSettingsStore } from './settingsStore'
import { Text, View, Button, StyleSheet } from 'react-native'

// Example component that uses both stores
export const StoreExample: React.FC = () => {
  // Auth store values and actions
  const { user, isAuthenticated, isLoading, login, logout } = useAuthStore()

  // App store values and actions
  const { theme, language, notifications, setTheme, toggleNotifications } =
    useSettingsStore()

  // Handle login
  const handleLogin = async () => {
    await login('user@example.com', 'password123')
  }

  // Handle logout
  const handleLogout = async () => {
    await logout()
  }

  // Toggle theme
  const handleToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  if (isLoading) {
    return <Text>Loading...</Text>
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === 'light' ? '#fff' : '#333' },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: theme === 'light' ? '#000' : '#fff' },
        ]}
      >
        Zustand + MMKV
      </Text>
      <Text
        style={[styles.text, { color: theme === 'light' ? '#000' : '#fff' }]}
      >
        {isAuthenticated ? `Welcome, ${user?.name}` : 'Please login'}
      </Text>

      <Text
        style={[styles.text, { color: theme === 'light' ? '#000' : '#fff' }]}
      >
        Current language: {language}
      </Text>

      <Text
        style={[styles.text, { color: theme === 'light' ? '#000' : '#fff' }]}
      >
        Notifications: {notifications ? 'Enabled' : 'Disabled'}
      </Text>

      <View style={styles.buttonContainer}>
        {!isAuthenticated ? (
          <Button title="Login" onPress={handleLogin} />
        ) : (
          <Button title="Logout" onPress={handleLogout} />
        )}
      </View>

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
