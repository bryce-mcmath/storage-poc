import React, { useState } from 'react'
import { StyleSheet, Text, View, Button, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { storage } from './storage'

interface PerformanceResult {
  operation: string
  asyncStorageTime: number
  mmkvTime: number
  improvement: string
}

const generateTestData = (size: 'small' | 'medium' | 'large'): any => {
  switch (size) {
    case 'small':
      return { id: 1, name: 'Test Item', value: 'Simple value' }
    case 'medium':
      return {
        id: 1,
        name: 'Test Item',
        description:
          'This is a medium sized test item with some additional data',
        items: Array(50)
          .fill(0)
          .map((_, i) => ({ id: i, value: `Item ${i}` })),
        metadata: {
          created: new Date().toISOString(),
          tags: ['test', 'medium', 'performance'],
        },
      }
    case 'large':
      return {
        id: 1,
        name: 'Test Item',
        description: 'This is a large sized test item with a lot of data',
        items: Array(500)
          .fill(0)
          .map((_, i) => ({
            id: i,
            value: `Item ${i}`,
            details: `Details for item ${i}`,
            attributes: {
              color: i % 3 === 0 ? 'red' : i % 3 === 1 ? 'green' : 'blue',
              size: i % 5,
              priority: i % 10,
            },
          })),
        metadata: {
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          tags: Array(100)
            .fill(0)
            .map((_, i) => `tag-${i}`),
          categories: Array(20)
            .fill(0)
            .map((_, i) => `category-${i}`),
        },
      }
    default:
      return { id: 1, name: 'Test Item' }
  }
}

export const PerformanceComparison: React.FC = () => {
  const [results, setResults] = useState<PerformanceResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const clearStorage = async () => {
    try {
      await AsyncStorage.clear()
      
      try {
        const allKeys = storage.getAllKeys()
        allKeys.forEach(key => {
          storage.delete(key)
        })
        
        storage.clearAll()
      } catch (error) {
        console.log('Non-critical error clearing MMKV storage:', error)
      }
    } catch (error) {
      console.error('Error clearing storage:', error)
      throw error
    }
  }

  const runWriteTest = async (
    size: 'small' | 'medium' | 'large',
  ): Promise<PerformanceResult> => {
    try {
      const data = generateTestData(size)
      const key = `test-${size}`
      const jsonValue = JSON.stringify(data)

      const asyncStart = performance.now()
      await AsyncStorage.setItem(key, jsonValue)
      const asyncEnd = performance.now()
      const asyncTime = asyncEnd - asyncStart

      const mmkvStart = performance.now()
      storage.set(key, jsonValue)
      const mmkvEnd = performance.now()
      const mmkvTime = mmkvEnd - mmkvStart

      const improvement =
        asyncTime > 0
          ? `${(((asyncTime - mmkvTime) / asyncTime) * 100).toFixed(1)}%`
          : 'N/A'

      return {
        operation: `Write (${size})`,
        asyncStorageTime: asyncTime,
        mmkvTime: mmkvTime,
        improvement,
      }
    } catch (error) {
      console.error(`Error in write test (${size}):`, error)
      return {
        operation: `Write (${size}) - Error`,
        asyncStorageTime: 0,
        mmkvTime: 0,
        improvement: 'Error',
      }
    }
  }

  const runReadTest = async (
    size: 'small' | 'medium' | 'large',
  ): Promise<PerformanceResult> => {
    const data = generateTestData(size)
    const key = `test-${size}`
    const jsonValue = JSON.stringify(data)

    await AsyncStorage.setItem(key, jsonValue)
    storage.set(key, jsonValue)

    const asyncStart = performance.now()
    await AsyncStorage.getItem(key)
    const asyncEnd = performance.now()
    const asyncTime = asyncEnd - asyncStart

    const mmkvStart = performance.now()
    storage.getString(key)
    const mmkvEnd = performance.now()
    const mmkvTime = mmkvEnd - mmkvStart

    const improvement =
      asyncTime > 0
        ? `${(((asyncTime - mmkvTime) / asyncTime) * 100).toFixed(1)}%`
        : 'N/A'

    return {
      operation: `Read (${size})`,
      asyncStorageTime: asyncTime,
      mmkvTime: mmkvTime,
      improvement,
    }
  }

  const runBulkTest = async (size: 'small'): Promise<PerformanceResult> => {
    const operations = 100
    const data = generateTestData(size)
    const jsonValue = JSON.stringify(data)

    const asyncStart = performance.now()
    for (let i = 0; i < operations; i++) {
      await AsyncStorage.setItem(`bulk-${i}`, jsonValue)
      await AsyncStorage.getItem(`bulk-${i}`)
    }
    const asyncEnd = performance.now()
    const asyncTime = asyncEnd - asyncStart

    const mmkvStart = performance.now()
    for (let i = 0; i < operations; i++) {
      storage.set(`bulk-${i}`, jsonValue)
      storage.getString(`bulk-${i}`)
    }
    const mmkvEnd = performance.now()
    const mmkvTime = mmkvEnd - mmkvStart

    const improvement =
      asyncTime > 0
        ? `${(((asyncTime - mmkvTime) / asyncTime) * 100).toFixed(1)}%`
        : 'N/A'

    return {
      operation: `Bulk (${operations} ops)`,
      asyncStorageTime: asyncTime,
      mmkvTime: mmkvTime,
      improvement,
    }
  }
  
  const runAllTests = async () => {
    setIsRunning(true)
    setResults([])

    try {
      await clearStorage()

      const smallWriteResult = await runWriteTest('small')
      setResults(prev => [...prev, smallWriteResult])

      const mediumWriteResult = await runWriteTest('medium')
      setResults(prev => [...prev, mediumWriteResult]) 

      const largeWriteResult = await runWriteTest('large')
      setResults(prev => [...prev, largeWriteResult])

      const smallReadResult = await runReadTest('small')
      setResults(prev => [...prev, smallReadResult])

      const mediumReadResult = await runReadTest('medium')
      setResults(prev => [...prev, mediumReadResult])

      const largeReadResult = await runReadTest('large')
      setResults(prev => [...prev, largeReadResult])

      const bulkResult = await runBulkTest('small')
      setResults(prev => [...prev, bulkResult])
    } catch (error) {
      console.error('Performance test error:', error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Performance Comparison</Text>
      <Text style={styles.subtitle}>
        AsyncStorage vs MMKV (times in milliseconds)
      </Text>

      <Button
        title={isRunning ? 'Running Tests...' : 'Run Performance Tests'}
        onPress={runAllTests}
        disabled={isRunning}
      />

      {results.length > 0 && (
        <ScrollView style={styles.resultsContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.operationCell]}>
              Operation
            </Text>
            <Text style={styles.headerCell}>AsyncStorage</Text>
            <Text style={styles.headerCell}>MMKV</Text>
            <Text style={styles.headerCell}>Improvement</Text>
          </View>

          {results.map((result, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.cell, styles.operationCell]}>
                {result.operation}
              </Text>
              <Text style={styles.cell}>
                {result.asyncStorageTime.toFixed(2)}ms
              </Text>
              <Text style={styles.cell}>{result.mmkvTime.toFixed(2)}ms</Text>
              <Text style={[styles.cell, { color: 'green' }]}>
                {result.improvement}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    color: '#666',
  },
  resultsContainer: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  operationCell: {
    flex: 1.5,
    textAlign: 'left',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
})
