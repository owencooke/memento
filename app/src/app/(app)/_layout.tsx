/**
 * @description Entrypoint for the authenticated routes of the app (ensures valid user session).
 *     Also configures local notifications to be sent to user device on special days.
 * @requirements FR-56
 */
import { Redirect, Stack } from "expo-router";
import { useSession } from "@/src/context/AuthContext";
import { Center } from "@/src/components/ui/center";
import { Spinner } from "@/src/components/ui/spinner";
import Header from "@/src/components/navigation/Header";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { userInfoApiUserIdGet } from "@/src/api-client/generated";
import { scheduleAllNotifications } from "@/src/libs/notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function AppLayout() {
  const { session, isLoading } = useSession();

  useEffect(() => {
    const scheduleNotifcations = async () => {
      const { data: userInfo } = await userInfoApiUserIdGet({
        path: { id: String(session?.user.id) },
      });
      if (userInfo) {
        scheduleAllNotifications(userInfo.birthday);
      }
    };

    if (session && !isLoading) {
      scheduleNotifcations();
    }
  }, [session, isLoading]);

  // Checking auth session
  if (isLoading) {
    return (
      <Center className="w-full h-full">
        <Spinner></Spinner>
      </Center>
    );
  }

  // Redirect back to sign in if no valid session
  if (!session) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        header: ({ options }) => <Header title={options.title} mode="goBack" />,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
