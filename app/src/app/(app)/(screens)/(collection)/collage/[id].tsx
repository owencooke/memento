/**
 * @description Screen for generating a collage representation of a collection of mementos.
 * @requirements FR-53, FR-55
 */

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
import { convertBlobToBase64Uri } from "@/src/libs/blob";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { shareAsync, isAvailableAsync } from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { fileNameSafeString } from "@/src/libs/string";

const pngMimeType = "image/png";

export default function ViewCollection() {
  const { getColor } = useColors();
  const { id, title } = useLocalSearchParams<{ id: string; title: string }>();

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
    refetchOnMount: false,
  });

  // Get base64 image string for collage
  const [collageImageUri, setCollageImageString] = useState<string | null>(
    null,
  );
  useEffect(() => {
    if (collageImageBlob) {
      convertBlobToBase64Uri(collageImageBlob as Blob)
        .then(setCollageImageString)
        .catch(console.error);
    }
  }, [collageImageBlob]);

  const handleShareCollage = async () => {
    try {
      if (collageImageUri) {
        // Download the collage blob to a temp file
        const localUri = `${FileSystem.cacheDirectory}${fileNameSafeString(title)}_Collage.png`;
        const imageContent = collageImageUri.split(",")[1];
        await FileSystem.writeAsStringAsync(localUri, imageContent, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Share the collage temp file
        if (await isAvailableAsync()) {
          await shareAsync(localUri, {
            mimeType: pngMimeType,
            UTI: pngMimeType,
          });
        } else {
          console.log("Sharing is not available on this device");
        }
      }
    } catch (error) {
      console.error("Error sharing collage:", error);
    }
  };

  return (
    <SafeAreaView
      className="max-h-full flex-1 flex p-5 gap-6"
      edges={["bottom"]}
    >
      <Heading className="block" size="2xl">
        {title} Collage
      </Heading>

      {isLoading && (
        <View className="flex flex-1 justify-center items-center gap-2">
          <View className="flex-row justify-center items-center gap-2">
            <Spinner size="small" color={getColor("tertiary-500")} />
            <Text size="2xl" className="font-medium">
              Just a sec!
            </Text>
          </View>
          <Text className="font-normal" size="xl">
            Putting together the perfect collage 🖼️
          </Text>
        </View>
      )}

      {isError && (
        <>
          <View className="flex flex-1 justify-center items-center gap-2">
            <Text size="3xl" className="font-medium">
              Oops!
            </Text>
            <Text size="xl">
              Something went wrong while making your collage...
            </Text>
          </View>
          <Button action="secondary" size="xl" onPress={refetch}>
            <ButtonText>Try Again</ButtonText>
          </Button>
        </>
      )}

      {!isLoading && !isError && collageImageUri && (
        <>
          <Image
            resizeMode="contain"
            className="flex-1 w-full"
            source={{ uri: collageImageUri }}
            alt="Collage"
          />
          <Button className="mt-auto" size="xl" onPress={handleShareCollage}>
            <ButtonIcon as={ShareIcon} />
            <ButtonText>Export Collage</ButtonText>
          </Button>
        </>
      )}
    </SafeAreaView>
  );
}
