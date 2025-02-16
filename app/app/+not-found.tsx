import { Center } from "@/components/ui/center";
import { Stack } from "expo-router";
import { Text } from "@/components/ui/text";
import { Link } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <Center className="h-full w-full p-5">
        <Text size="xl" bold>
          This screen doesn't exist.
        </Text>
        <Link href="/(app)/(tabs)/mementos" className="mt-4 py-4">
          <Text className="text-blue-500">Go to home screen!</Text>
        </Link>
      </Center>
    </>
  );
}
