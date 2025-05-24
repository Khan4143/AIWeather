import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import UserInfo from '../Screens/UserInfo'
import WelcomeScreen from '../Screens/WelcomeScreen'
import DailyRoutine from '../Screens/DailyRoutine'

const Navigations = () => {
  const Stack = createNativeStackNavigator()
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="UserInfo" component={UserInfo} />
        <Stack.Screen name="DailyRoutine" component={DailyRoutine} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default Navigations
const styles = StyleSheet.create({})