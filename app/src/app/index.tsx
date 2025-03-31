import { Redirect } from "expo-router";
import { useSession } from "@/src/context/AuthContext";
import { Button, ButtonText } from "@/src/components/ui/button";
import { Center } from "@/src/components/ui/center";
import { Spinner } from "@/src/components/ui/spinner";
import { View } from "react-native";
import { Heading } from "../components/ui/heading";
import { Image } from "../components/ui/image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { Text } from "../components/ui/text";

export default function SignIn() {
  const { session, isLoading, signIn, isNewUser } = useSession();

  // Fade-in animations
  const progress = useSharedValue(0);
  progress.value = withSequence(
    withTiming(1, { duration: 800 }), // Logo appears
    withDelay(200, withTiming(2, { duration: 600 })), // Title appears
    withDelay(300, withTiming(3, { duration: 500 })), // Login button appears
  );

  // Bounce animation for logo
  const bounce = useSharedValue(0);
  bounce.value = withRepeat(
    withSequence(
      withTiming(-10, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }),
    ),
    -1,
    true,
  );

  // Animated styles
  const logoStyle = useAnimatedStyle(() => ({
    opacity: withTiming(progress.value >= 1 ? 1 : 0, { duration: 500 }),
    transform: [{ translateY: bounce.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: withTiming(progress.value >= 2 ? 1 : 0, { duration: 500 }),
    transform: [{ translateY: progress.value >= 2 ? 0 : 20 }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({
    opacity: withTiming(progress.value >= 3 ? 1 : 0, { duration: 500 }),
  }));

  if (isLoading || (session && isNewUser === null)) {
    return (
      <Center className="w-full h-full">
        <Spinner />
      </Center>
    );
  }

  if (session) {
    return (
      <Redirect
        href={
          isNewUser ? "/(app)/(screens)/new-user" : "/(app)/(tabs)/mementos"
        }
      />
    );
  }

  return (
    <View className="w-full h-full bg-primary-50">
      <View className="m-auto w-full h-2/5 justify-between px-5">
        <View className="flex flex-1 justify-start items-center">
          <Animated.View style={logoStyle} className="flex-1">
            <Image
              className="h-full aspect-square"
              resizeMode="contain"
              source={require("@/src/assets/images/logo.png")}
              alt="Memento Logo"
            />
          </Animated.View>
          <Animated.View
            style={titleStyle}
            className="flex-1 items-center gap-2"
          >
            <Heading className="mt-4 text-primary-500" size="4xl">
              Memento
            </Heading>
            <Text size="2xl" className="text-primary-500">
              Memories That Last
            </Text>
          </Animated.View>
        </View>
        <Animated.View style={buttonStyle} className="mt-6 px-8">
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
        </Animated.View>
      </View>
    </View>
  );
}
