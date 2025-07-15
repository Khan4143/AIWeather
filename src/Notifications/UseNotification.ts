import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { useEffect } from 'react';
import DeviceInfo from 'react-native-device-info';

export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('❌ Notification permission denied');
        return false;
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
        return false;
      }

      console.log('✅ iOS notification permission granted');
    }

    const token = await messaging().getToken();
    const deviceId = await DeviceInfo.getUniqueId();
    console.log('📲 FCM Token:', token);
    console.log('📱 Device ID:', deviceId);

    // Send token + deviceId to backend
    try {
      console.log('Sending FCM token to backend...');
      const response = await fetch('https://us-central1-ai-weather-app-f69fc.cloudfunctions.net/saveDeviceToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, token })
      });
      
      const responseData = await response.json().catch(() => null);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}, message: ${JSON.stringify(responseData)}`);
      }
      
      console.log('✅ FCM token saved to backend:', responseData);
      return true;
    } catch (error) {
      console.error('❌ Failed to save FCM token to backend:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error in notification permission flow:', error);
    return false;
  }
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
