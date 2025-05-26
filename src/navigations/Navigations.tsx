import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import UserInfo from '../Screens/UserInfo'
import WelcomeScreen from '../Screens/WelcomeScreen'
import DailyRoutine from '../Screens/DailyRoutine'
import PreferenceScreen from '../Screens/PreferenceScreen'
import OnboardingScreen from '../Screens/OnboardingScreen'
import HomeScreen from '../Screens/HomeScreen'

const Navigations = () => {
  const Stack = createNativeStackNavigator()
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="UserInfo" component={UserInfo} />
        <Stack.Screen name="DailyRoutine" component={DailyRoutine} />
        <Stack.Screen name="PreferenceScreen" component={PreferenceScreen} />
        <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default Navigations
const styles = StyleSheet.create({})