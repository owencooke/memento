import { generateCollageApiUserUserIdCollectionIdCollageGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { ButtonIcon, Button, ButtonText } from "@/src/components/ui/button";
import { ShareIcon } from "@/src/components/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading } from "@/src/components/ui/heading";
import { Image } from "@/src/components/ui/image";
import { useColors } from "@/src/hooks/useColors";
import { Spinner } from "@/src/components/ui/spinner";
import { convertBlobToBase64 } from "@/src/libs/blob";
import { useEffect, useState } from "react";
import { Text, View } from "react-native"; // Use React Native components

export default function ViewCollection() {
  const { getColor } = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Generate a collage for collection
  const {
    data: collageImageBlob,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    ...generateCollageApiUserUserIdCollectionIdCollageGetOptions({
      path: {
        id: Number(id),
      },
    }),
  });

  // Get base64 image string for collage
  const [collageImageString, setCollageImageString] = useState<string | null>(
    null,
  );
  useEffect(() => {
    if (collageImageBlob) {
      convertBlobToBase64(collageImageBlob as Blob)
        .then(setCollageImageString)
        .catch(console.error);
    }
  }, [collageImageBlob]);

  return (
    <SafeAreaView className="max-h-full flex-1 flex p-5 gap-6">
      <Heading className="block" size="2xl">
        Collage Generator
      </Heading>

      {isLoading && (
        <View className="flex flex-1 justify-center items-center gap-2">
          <Spinner color={getColor("tertiary-500")} />
          <Text>Generating collage for id: {id}</Text>
        </View>
      )}

      {isError && (
        <View className="flex flex-1 justify-center items-center gap-2">
          <Text className="text-error-500">
            An error occurred. Please try again.
          </Text>
          <Button size="xl" onPress={refetch}>
            Try Again
          </Button>
        </View>
      )}

      {!isLoading && !isError && collageImageString && (
        <Image
          className="flex-1 rounded-sm"
          source={{ uri: collageImageString }}
        />
      )}
      <Button className="mt-auto" size="xl">
        <ButtonIcon as={ShareIcon} />
        <ButtonText>Export Collage</ButtonText>
      </Button>
    </SafeAreaView>
  );
}
