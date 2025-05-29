import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import {
  StyleSheet,
  View,
  ScrollView,
  Button,
  SafeAreaView,
  Alert,
} from 'react-native'

import { StoreProvider } from './src/existing/StoreProvider'
import { OldImplementation } from './src/existing/OldImplementation'

import { NewImplementation } from './src/new/NewImplementation'
import { PerformanceComparison } from './src/new/PerformanceComparison'

import { migrateFromExistingToNew } from './src/migrationService'
import { secureStorageService, storageService } from './src/new/storage'
import { useAuthStore } from './src/new/authStore'

export default function App() {
  const { didMigrate } = useAuthStore()
  const [implementationView, setImplementationView] = useState<
    'context' | 'zustand' | 'performance'
  >(didMigrate ? 'zustand' : 'context')

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.contentContainer}>
        {implementationView === 'context' ? (
          <StoreProvider>
            <OldImplementation
              migrate={async () => {
                console.log('Migrating from old to new implementation...')
                const migrated = await migrateFromExistingToNew()
                if (migrated) {
                  setImplementationView('zustand')
                }
              }}
            />
          </StoreProvider>
        ) : implementationView === 'zustand' ? (
          <NewImplementation
            migrate={async () => {
              console.log(
                'Migration from new to old is not supported, clearing all data and switching to old implementation',
              )
              await secureStorageService.clearAllKeychainData()
              await storageService.clear()
              setImplementationView('context')
            }}
          />
        ) : (
          <PerformanceComparison />
        )}
        {implementationView !== 'performance' ? (
          <View style={styles.buttonContainer}>
            <Button
              title="View Performance Comparison"
              onPress={() => setImplementationView('performance')}
            />
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <Button
              title="Back to Implementations"
              onPress={() => setImplementationView('context')}
            />
          </View>
        )}
      </ScrollView>

      <StatusBar style="auto" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
  },
  buttonContainer: {
    marginBottom: 20,
  },
})
