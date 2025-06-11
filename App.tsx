// Import the crypto polyfill
import 'react-native-get-random-values';

import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Navigations from './src/navigations/Navigations'
import { WeatherProvider } from './src/contexts/WeatherContext'

const App = () => {
  return (
    <WeatherProvider>
      <Navigations />
    </WeatherProvider>
  )
}

export default App

const styles = StyleSheet.create({})