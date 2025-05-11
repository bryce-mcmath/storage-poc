import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View, Button, ScrollView } from 'react-native'

// Import existing implementation components
import { StoreProvider } from './src/existing/StoreProvider'
import { StoreImplementation } from './src/existing/StoreImplementation'

// Import new implementation components
import { StoreExample } from './src/new/StoreExample'
import { PerformanceComparison } from './src/new/PerformanceComparison'

// Main app component
export default function App() {
  const [implementationView, setImplementationView] = useState<
    'context' | 'zustand' | 'performance'
  >('context')

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Context + Reducer"
          onPress={() => setImplementationView('context')}
          color={implementationView === 'context' ? '#2196F3' : '#ccc'}
        />
        <Button
          title="Zustand + MMKV"
          onPress={() => setImplementationView('zustand')}
          color={implementationView === 'zustand' ? '#2196F3' : '#ccc'}
        />
        <Button
          title="Performance"
          onPress={() => setImplementationView('performance')}
          color={implementationView === 'performance' ? '#2196F3' : '#ccc'}
        />
      </View>

      <ScrollView style={styles.contentContainer}>
        {implementationView === 'context' ? (
          <StoreProvider>
            <StoreImplementation />
          </StoreProvider>
        ) : implementationView === 'zustand' ? (
          <StoreExample />
        ) : (
          <PerformanceComparison />
        )}
      </ScrollView>

      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  contentContainer: {
    flex: 1,
  },
})
