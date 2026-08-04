import {useEffect, useRef, useState} from 'react';
import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [shouldSchedule, setShouldSchedule] = useState(true);

  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  useEffect(() => {
    // Register the device for push notifications and retrieve the push token for Firebase.
    registerForPushNotificationsAsync().then(
      token => token && setExpoPushToken(token),
    );

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then();
    }

    /**
     * Adds a listener for incoming notifications.
     *
     * Note: When the app is open, notifications do not appear as system alerts.
     * Instead, they are routed to this listener. It is our responsibility
     * to handle how the notification should be displayed. In this case,
     * we schedule the notification manually to ensure it is shown to the user.
     */
    notificationListener.current =
      Notifications.addNotificationReceivedListener(async notification => {
        if (shouldSchedule) {
          Toast.show({
            text1: notification.request.content.title || '',
            text2: notification.request.content.body || '',
            type: 'success',
          });
        }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {});

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [shouldSchedule]);

  return {
    token: expoPushToken,
  };
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'A channel is needed for the permissions prompt to appear',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const {status: existingStatus} = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const {status} = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  try {
    token = (await Notifications.getDevicePushTokenAsync()).data;
    if (Platform.OS === 'ios') {
      await messaging().setAPNSToken(token);
      token = await messaging().getToken();
    }
  } catch (e) {
    console.warn(e);
  }

  return token;
}
