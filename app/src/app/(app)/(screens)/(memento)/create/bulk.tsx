/**
 * @description Screen for creating multiple new keepsake/mementos in bulk.
 * @requirements FR-22, FR-23
 */

import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import DraggableGrid from "react-native-draggable-grid";
import { Button, ButtonIcon, ButtonText } from "@/src/components/ui/button";
import { CloseIcon, AddIcon } from "@/src/components/ui/icon";
import usePhotos, { Photo } from "@/src/hooks/usePhotos";
import { Image } from "@/src/components/ui/image";
import { Heading } from "@/src/components/ui/heading";
import { Text } from "@/src/components/ui/text";

interface GridItem {
  key: number;
  photo: Photo | null;
}

export default function BulkCreateMemento() {
  const { hasPermission, addPhotos, photos, removePhoto, setPhotos } =
    usePhotos({ initialPhotos: [] });

  const gridData = useMemo(
    () => [
      ...photos.map((photo, index) => ({
        key: index,
        photo,
      })),
      {
        key: -1,
        photo: null,
        disabledDrag: true,
        disabledReSorted: true,
      },
    ],
    [photos],
  );

  const handleReorderPhotos = useCallback(
    (data: GridItem[]) => {
      const newPhotos = data
        .filter((item) => item.photo !== null)
        .map((item) => item.photo) as Photo[];
      setPhotos(newPhotos);
    },
    [setPhotos],
  );

  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <View className="flex-1">
        <Heading className="block" size="2xl">
          Create Multiple
        </Heading>
        <Text size="xl" italic className="text-left font-light mb-2">
          Want to add multiple new mementos at once? Start by uploading all of
          the photos you want to include!
        </Text>
        <Button onPress={() => addPhotos("picker")} size="lg">
          <ButtonText>Select photos from library</ButtonText>
        </Button>
        <DraggableGrid
          numColumns={3}
          data={gridData}
          onDragRelease={handleReorderPhotos}
          renderItem={(item: GridItem) => (
            <View className="px-1 py-2 flex-1 aspect-square">
              {item.photo ? (
                // Render a photo
                <View className="relative overflow-hidden rounded-md">
                  <Image
                    source={{ uri: item.photo.uri }}
                    className="w-auto h-full mt-2 mr-2"
                    alt=""
                    resizeMode="cover"
                  />
                  <Button
                    onPress={() => item.photo && removePhoto(item.photo)}
                    className="absolute p-2 rounded-full top-0 right-0"
                    size="sm"
                  >
                    <ButtonIcon className="m-0 p-0" as={CloseIcon} />
                  </Button>
                </View>
              ) : (
                // Render the add button
                <Button
                  size="lg"
                  className="mt-2 mr-2 h-full"
                  action="secondary"
                >
                  <ButtonIcon as={AddIcon} />
                </Button>
              )}
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
