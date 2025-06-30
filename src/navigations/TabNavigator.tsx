import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import HomeScreen from '../Screens/HomeScreen';
import PlanningScreen from '../Screens/PlanningScreen';
import CommuteScreen from '../Screens/CommuteScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import ForecastScreen from '../Screens/ForecastScreen';
import adjust from '../utils/adjust';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  // Log when TabNavigator mounts
  useEffect(() => {
    console.log('TabNavigator mounted - Initial screen is ForecastScreen (HomeTab)');
    
    return () => {
      console.log('TabNavigator unmounted');
    };
  }, []);
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4361EE',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: adjust(10),
          fontWeight: '500',
          marginBottom: adjust(5),
        },
        tabBarStyle: {
          height: adjust(60),
          paddingTop: adjust(5),
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={ForecastScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={adjust(20)} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Assistant"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Assistant',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="robot-outline" size={adjust(24)} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PlanningTab"
        component={PlanningScreen}
        options={{
          tabBarLabel: 'Plan Event',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-plus" size={adjust(22)} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Commute"
        component={CommuteScreen}
        options={{
          tabBarLabel: 'Commute',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chat" size={adjust(20)} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" size={adjust(18)} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({}); 