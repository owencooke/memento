import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

/**
 * Hook that enables deep linking to pages in app from push notifications.
 * Reference: https://docs.expo.dev/versions/latest/sdk/notifications/#present-a-local-in-app-notification-to-the-user
 */
export default function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (url) {
        router.push(url);
      }
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        return;
      }
      redirect(response?.notification);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        redirect(response.notification);
      },
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}
