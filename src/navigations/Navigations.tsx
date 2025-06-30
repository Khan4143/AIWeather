import { StyleSheet, Text, View, Platform, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import UserInfo from '../Screens/UserInfo'
import WelcomeScreen from '../Screens/WelcomeScreen'
import DailyRoutine from '../Screens/DailyRoutine'
import PreferenceScreen from '../Screens/PreferenceScreen'
import OnboardingScreen from '../Screens/OnboardingScreen'
import IntroScreen  from '../Screens/IntroScreen'
import NotificationScreen from '../Screens/NotificationScreen'
import { UserDataManager } from '../utils/userDataManager'
import HomeScreen from '../Screens/HomeScreen'
import TabNavigator from './TabNavigator'
import PlanningScreen from '../Screens/PlanningScreen'
import SettingsScreen from '../Screens/SettingsScreen'
import ForecastScreen from '../Screens/ForecastScreen'

const Navigations = () => {
  const Stack = createNativeStackNavigator()
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load saved data when the app starts
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        await UserDataManager.loadAllData();
        console.log('Data loading process completed');
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Error in data loading process:', error);
        // Continue with the app even if data loading fails
        setIsDataLoaded(true);
        
        // Only show an alert in development mode
        if (__DEV__) {
          Alert.alert(
            'Data Loading Issue',
            'There was a problem loading your saved data. Your data will be stored in memory for this session.',
            [{ text: 'OK' }]
          );
        }
      }
    };

    loadSavedData();
  }, []);

  if (!isDataLoaded) {
    // Return a loading state or splash screen if you prefer
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        {/* Onboarding Screens */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="UserInfo" component={UserInfo} />
        <Stack.Screen name="DailyRoutine" component={DailyRoutine} />
        <Stack.Screen name="PreferenceScreen" component={PreferenceScreen} />
        <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
        
        {/* Main App - Tab Navigation */}
        <Stack.Screen name="MainApp" component={TabNavigator} />
        
        {/* Individual Screens (for direct navigation) */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PlanningScreen" component={PlanningScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Forecast" component={ForecastScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default Navigations
const styles = StyleSheet.create({})