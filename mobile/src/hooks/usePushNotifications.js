import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import notificationService from '../services/notifications/notification.service';
import useAuthStore from '../store/authStore';

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    notificationService.registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        notificationService.syncDeviceToken(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notif) => {
      setNotification(notif);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      // Handle user clicking on the push notification (e.g. navigate to screens)
      console.log('Push notification clicked:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated]);

  return { expoPushToken, notification };
}

export default usePushNotifications;
