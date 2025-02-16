import { useEffect } from "react";
import { router } from "expo-router";
import { Text, View, ActivityIndicator } from "react-native";

import { useSession } from "@/context/AuthContext";

export default function SignIn() {
  const { session, isLoading, signIn } = useSession();

  useEffect(() => {
    if (!isLoading && session) {
      router.replace("/(app)/(tabs)/mementos");
    }
  }, [isLoading, session]);

  if (isLoading) {
    // Display a loading state while checking session
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (session) {
    // If session exists, redirect to the main screen
    return null;
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text onPress={signIn}>Sign In</Text>
    </View>
  );
}
