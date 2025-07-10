import { PermissionsAndroid, Platform } from 'react-native';
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

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

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📥 Foreground message received:', remoteMessage);
  
      // Ensure channel exists (only needed once)
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
  
      // Display the notification
      await notifee.displayNotification({
        title: remoteMessage.notification?.title ?? 'New message',
        body: remoteMessage.notification?.body ?? 'You have a new notification',
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher', // Ensure this icon exists in android/app/src/main/res/drawable
        },
      });
    });

    return unsubscribe;
  }, []);
};
