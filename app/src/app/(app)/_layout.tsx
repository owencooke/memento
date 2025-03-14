import { Redirect, Stack } from "expo-router";

import { useSession } from "@/src/context/AuthContext";
import { Center } from "@/src/components/ui/center";
import { Spinner } from "@/src/components/ui/spinner";
import Header from "@/src/components/navigation/Header";

export default function AppLayout() {
  const { session, isLoading } = useSession();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return (
      <Center className="w-full h-full">
        <Spinner></Spinner>
      </Center>
    );
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/" />;
  }

  // This layout can be deferred because it's not the root layout.
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
