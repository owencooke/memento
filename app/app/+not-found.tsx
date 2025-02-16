import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";
// import { styled } from "nativewind";

// const ThemedView = styled(View);
// const ThemedText = styled(Text);

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-xl font-bold">This screen doesn't exist.</Text>
        <Link href="/(app)/(tabs)/mementos" className="mt-4 py-4">
          <Text className="text-blue-500">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
