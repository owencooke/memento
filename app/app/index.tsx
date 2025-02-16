import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { useSession } from "@/context/AuthContext";

export default function SignIn() {
  const { session, isLoading, signIn } = useSession();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      if (!isLoading) {
        if (session) {
          router.replace("/(app)/(tabs)/mementos");
        }
        await SplashScreen.hideAsync();
        setAppReady(true);
      }
    };

    checkSession();
  }, [isLoading, session]);

  if (!appReady) {
    return null; // Keeps the splash screen visible until app is ready
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text onPress={signIn}>Sign In</Text>
    </View>
  );
}
