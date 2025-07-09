import { PermissionsAndroid, Platform } from 'react-native';
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';

const requestUserPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('✅ Notification permission granted');
    } else {
      console.log('❌ Notification permission denied');
    }
  } else {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ iOS Notification permission granted');
    } else {
      console.log('❌ iOS Notification permission denied');
    }
  }
};

const getToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('📲 FCM Token:', token);
  } catch (error) {
    console.log('⚠️ Error getting FCM token:', error);
  }
};

export const useNotification = () => {
  useEffect(() => {
    requestUserPermission();
    getToken();

    // 👇 Foreground listener
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📥 Foreground message received:', remoteMessage);

      // You can also trigger a local notification here using Notifee if you want
    });

    return unsubscribe; // 👈 Clean up on unmount
  }, []);
};
