import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View, Text, ScrollView } from 'react-native'
import { Picker } from '@react-native-picker/picker'

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
        <Text style={styles.headerLabel}>Select Implementation:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={implementationView}
            onValueChange={(itemValue) => setImplementationView(itemValue as 'context' | 'zustand' | 'performance')}
            style={styles.picker}
          >
            <Picker.Item label="Context + AsyncStorage" value="context" />
            <Picker.Item label="Zustand + MMKV" value="zustand" />
            <Picker.Item label="Performance" value="performance" />
          </Picker>
        </View>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    color: '#333',
    fontSize: 16,
    flexShrink: 1,
  },
  picker: {
    flexShrink: 1,
  },
  contentContainer: {
    flex: 1,
  },
})
