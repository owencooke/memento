import { Redirect } from "expo-router";
import { useSession } from "@/src/context/AuthContext";
import { Button, ButtonText } from "@/src/components/ui/button";
import { Center } from "@/src/components/ui/center";
import { Spinner } from "@/src/components/ui/spinner";
import { View } from "react-native";
import { Heading } from "../components/ui/heading";
import { Image } from "../components/ui/image";

export default function SignIn() {
  const { session, isLoading, signIn, isNewUser } = useSession();

  if (isLoading || (session && isNewUser === null)) {
    return (
      <Center className="w-full h-full">
        <Spinner />
      </Center>
    );
  }

  if (session) {
    if (isNewUser) {
      return <Redirect href="/(app)/(screens)/new-user" />;
    } else {
      return <Redirect href="/(app)/(tabs)/mementos" />;
    }
  }

  return (
    <View className="w-full h-full bg-primary-50">
      <View className="m-auto w-full h-2/5 justify-between px-5">
        <View className="flex flex-1 justify-start items-center">
          <Image
            // size="2xl"
            className="h-1/2 aspect-square"
            resizeMode="contain"
            source={require("@/src/assets/images/logo.png")}
            alt="Memento Logo"
          />
          <Heading className="mt-4 text-primary-500" size="4xl">
            Memento
          </Heading>
        </View>
        <View className="mt-6 px-8">
          <Button
            size="lg"
            action="secondary"
            onPress={signIn}
            className="bg-background-0 flex items-center justify-center rounded-lg border"
          >
            <Image
              source={require("@/src/assets/images/google-logo.png")}
              alt="Google Logo"
              className="w-10 h-10"
            />
            <ButtonText className="text-typography-800">
              Sign in with Google
            </ButtonText>
          </Button>
        </View>
      </View>
    </View>
  );
}
