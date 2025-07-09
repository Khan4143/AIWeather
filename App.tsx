// Import the crypto polyfill
import 'react-native-get-random-values';

import {StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import Navigations from './src/navigations/Navigations';
import {WeatherProvider} from './src/contexts/WeatherContext';
// import { updateNgrokUrl } from './src/services/ngrokService';
import { useNotification } from './src/Notifications/UseNotification';
import '@react-native-firebase/app';


const App = () => {

  useNotification();


  // // Log initialization
  useEffect(() => {
    console.log('App component initialized');
    console.log(
      'WeatherProvider and Navigations components will be mounted next',
    );

    return () => {
      console.log('App component unmounted');
    };
  }, []);

  // When you get the ngrok URL, update it
  // updateNgrokUrl('https://your-ngrok-url.ngrok.io');

  return (
    <WeatherProvider>
      <StatusBar backgroundColor="transparent" barStyle="light-content" />
      <Navigations />
    </WeatherProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
