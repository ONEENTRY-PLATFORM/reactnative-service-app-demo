import {useEffect, useRef, useState} from 'react';
import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';
import {
  getMessaging,
  getToken,
  onMessage,
  setAPNSToken,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';

// Background/quit-state pushes carry a `notification` block, which the OS
// displays by itself. RN Firebase still wakes a headless task for every message
// and expects a handler registered at module load; there is nothing to do here.
if (Platform.OS === 'android') {
  setBackgroundMessageHandler(getMessaging(), async () => {});
}

const showInAppNotice = (title?: string | null, body?: string | null) => {
  if (!title && !body) return;
  Toast.show({text1: title || '', text2: body || '', type: 'success'});
};

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState('');

  const notificationListener = useRef<Notifications.EventSubscription>(null);

  useEffect(() => {
    // Register the device for push notifications and retrieve the push token for Firebase.
    registerForPushNotificationsAsync().then(
      token => token && setExpoPushToken(token),
    );

    // While the app is open the OS shows no banner, so the push is surfaced
    // as an in-app toast. On Android the FCM message is delivered to RN
    // Firebase's messaging service (it outranks expo-notifications' one), so
    // expo's listener never fires there — listen through Firebase instead.
    let unsubscribeFirebase: (() => void) | undefined;
    if (Platform.OS === 'android') {
      unsubscribeFirebase = onMessage(getMessaging(), message => {
        showInAppNotice(
          message.notification?.title,
          message.notification?.body,
        );
      });
    } else {
      notificationListener.current =
        Notifications.addNotificationReceivedListener(notification => {
          showInAppNotice(
            notification.request.content.title,
            notification.request.content.body,
          );
        });
    }

    return () => {
      unsubscribeFirebase?.();
      notificationListener.current?.remove();
    };
  }, []);

  return {
    token: expoPushToken,
  };
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    // 'default' is the channel app.json names as FCM's default channel: a push
    // without an explicit channel lands here. It must exist before Android 13
    // shows the permission prompt.
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ED21F1',
    });
  }

  const {status: existingStatus} = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const {status} = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    // Declining is the user's choice — the app works without pushes, so no
    // alert on every launch.
    return;
  }

  try {
    token = (await Notifications.getDevicePushTokenAsync()).data;
    if (Platform.OS === 'ios') {
      // RN Firebase 27 dropped the namespaced default export: modular API only.
      const messaging = getMessaging();
      await setAPNSToken(messaging, token);
      token = await getToken(messaging);
    }
  } catch (e) {
    console.warn(e);
  }

  return token;
}
