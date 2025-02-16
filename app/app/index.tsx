import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { useSession } from "@/context/AuthContext";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";

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
    <Center className="w-full h-full">
      <Button onPress={signIn}>
        <ButtonText>Sign In</ButtonText>
      </Button>
    </Center>
  );
}
