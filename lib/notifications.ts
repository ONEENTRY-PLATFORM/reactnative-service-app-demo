import {useEffect, useRef, useState} from 'react';
import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {SchedulableTriggerInputTypes} from 'expo-notifications/src/Notifications.types';

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [shouldSchedule, setShouldSchedule] = useState(true);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(
      token => token && setExpoPushToken(token),
    );

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then();
    }
    notificationListener.current =
      Notifications.addNotificationReceivedListener(async notification => {
        if (shouldSchedule) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: notification.request.content.title,
              body: notification.request.content.body,
            },
            trigger: {
              type: SchedulableTriggerInputTypes.TIME_INTERVAL,
              repeats: false,
              seconds: 1,
            },
          });

          setShouldSchedule(false);

          setTimeout(() => setShouldSchedule(true), 5000);
        }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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
    console.log(token);
    if (Platform.OS === 'ios') {
      await messaging().setAPNSToken(token);
      token = await messaging().getToken();
    }
  } catch (e) {
    console.warn(e);
  }


  return token;
}
