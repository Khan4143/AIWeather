import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { useEffect } from 'react';
import DeviceInfo from 'react-native-device-info';

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log('❌ Notification permission denied');
      return;
    }

    console.log('✅ Android 13+ permission granted');
  }

  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('❌ iOS notification permission denied');
      return;
    }

    console.log('✅ iOS notification permission granted');
  }

  const token = await messaging().getToken();
  const deviceId = await DeviceInfo.getUniqueId();
  console.log('📲 FCM Token:', token);
  console.log('📱 Device ID:', deviceId);

  // Optionally: Send token + deviceId to backend here

  fetch('https://us-central1-ai-weather-app-f69fc.cloudfunctions.net/saveDeviceToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, token })
  });
};

export const useNotification = () => {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📥 Foreground message:', remoteMessage);

      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });

      await notifee.displayNotification({
        title: remoteMessage.notification?.title ?? 'New message',
        body: remoteMessage.notification?.body ?? 'You have a new notification',
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher',
        },
      });
    });

    return unsubscribe;
  }, []);
};
