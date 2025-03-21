import { Redirect, Stack } from "expo-router";

import { useSession } from "@/src/context/AuthContext";
import { Center } from "@/src/components/ui/center";
import { Spinner } from "@/src/components/ui/spinner";
import Header from "@/src/components/navigation/Header";

export default function AppLayout() {
  const { session, isLoading } = useSession();

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
