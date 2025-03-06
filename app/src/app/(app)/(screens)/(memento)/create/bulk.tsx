/**
 * @description Screen for creating multiple new keepsake/mementos in bulk.
 * @requirements FR-22, FR-23
 */

import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import DraggableGrid from "react-native-draggable-grid";
import { Button, ButtonIcon, ButtonText } from "@/src/components/ui/button";
import { CloseIcon } from "@/src/components/ui/icon";
import usePhotos, { Photo } from "@/src/hooks/usePhotos";
import { Image } from "@/src/components/ui/image";
import { Heading } from "@/src/components/ui/heading";
import { Text } from "@/src/components/ui/text";

type ItemType = "photo" | "header" | "spacer";

interface GridItem {
  key: string;
  type: ItemType;
  photo?: Photo;
  groupId?: number;
  disabledDrag?: boolean;
  disabledReSorted?: boolean;
}

type PhotoWithGroup = Photo & { group: number };

export default function BulkCreateMemento() {
  const { hasPermission, addPhotos, photos } = usePhotos({
    initialPhotos: [],
  });
  const [photoGroups, setPhotoGroups] = useState<PhotoWithGroup[]>([]);

  // Replace handleAddPhotos with this simpler version
  const handleAddPhotos = useCallback(
    async (source: "picker" | "camera") => {
      const newRawPhotos = await addPhotos(source);

      // Assign each new photo to its own group
      const newPhotosWithGroups = newRawPhotos.map((photo, index) => ({
        ...photo,
        group: photoGroups.length + index,
      }));

      setPhotoGroups((prev) => [...prev, ...newPhotosWithGroups]);
    },
    [addPhotos, photoGroups.length],
  );

  // Create grid data with headers, photos, and add-group button
  const gridData = useMemo(() => {
    const items: GridItem[] = [];
    const groups = [...new Set(photoGroups.map((p) => p.group))].sort(
      (a, b) => a - b,
    );

    // For each group, add header and photos
    groups.forEach((groupId) => {
      // Add group header
      items.push({
        key: `header-${groupId}`,
        type: "header",
        groupId,
        disabledDrag: true,
        disabledReSorted: true,
      });

      // Add header spacers
      items.push({
        key: `header-spacer-${groupId}-1`,
        type: "spacer",
        disabledDrag: true,
        groupId,
      });
      items.push({
        key: `header-spacer-${groupId}-2`,
        type: "spacer",
        disabledDrag: true,
        groupId,
      });

      // Add photos for this group
      const groupPhotos = photoGroups.filter((p) => p.group === groupId);
      groupPhotos.forEach((photo) => {
        items.push({
          key: `photo-${photo.assetId || photo.uri}`,
          type: "photo",
          photo,
          groupId,
        });
      });

      // Add trailing spacers if needed
      const remainder = groupPhotos.length % 3;
      const spacersNeeded = remainder === 0 ? 0 : 3 - remainder;

      for (let i = 0; i < spacersNeeded; i++) {
        items.push({
          key: `photo-spacer-${groupId}-${i}`,
          type: "spacer",
          disabledDrag: true,
          groupId,
        });
      }
    });

    return items;
  }, [photoGroups]);

  // Handle reordering of photos
  const handleReorderPhotos = useCallback((newItems: GridItem[]) => {
    let currentGroup: number | null = null;
    const updatedPhotos: PhotoWithGroup[] = [];

    // Process the items in order to update group assignments
    newItems.forEach((item) => {
      if (item.type === "header") {
        currentGroup = item.groupId!;
      } else if (item.type === "photo" && item.photo && currentGroup !== null) {
        // Add the photo to our updated list with the current group
        updatedPhotos.push({
          ...item.photo,
          group: currentGroup,
        } as PhotoWithGroup);
      }
    });

    // Update state with new photo assignments
    setPhotoGroups(updatedPhotos);
  }, []);

  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <View className="flex-1 p-4">
        <Heading className="block mb-2" size="2xl">
          Create Multiple
        </Heading>
        <Text size="md" className="text-left font-light mb-4">
          Upload photos and organize them into separate mementos by dragging
          them between groups.
        </Text>
        <Button
          onPress={() => handleAddPhotos("picker")}
          size="lg"
          className="mb-4"
        >
          <ButtonText>Select photos from library</ButtonText>
        </Button>
        <DraggableGrid
          numColumns={3}
          data={gridData}
          onDragRelease={handleReorderPhotos}
          dragStartAnimation={null}
          renderItem={(item: GridItem) => {
            if (item.type === "spacer") {
              return (
                <View className="bg-orange-300">
                  <Text className="font-semibold">{item.key}</Text>
                </View>
              );
            } else if (item.type === "header") {
              // Render group header
              return (
                <View className="w-full h-fit bg-red-300 p-3 bg-muted-100 mb-2 rounded-md flex-row justify-between items-center">
                  <Text className="font-semibold">Memento #{item.groupId}</Text>
                </View>
              );
            } else {
              // Render a photo
              return (
                <View className="p-1 aspect-square">
                  <View className="relative overflow-hidden rounded-md">
                    <Image
                      source={{ uri: item.photo?.uri }}
                      className="w-full h-full"
                      alt=""
                      resizeMode="cover"
                    />
                    <Button
                      onPress={
                        () => {}
                        // item.photo && handleRemovePhoto(item.photo)
                      }
                      className="absolute p-2 rounded-full top-0 right-0"
                      size="sm"
                    >
                      <ButtonIcon className="m-0 p-0" as={CloseIcon} />
                    </Button>
                  </View>
                </View>
              );
            }
          }}
        />

        <View className="mt-auto mb-4">
          <Button
            size="lg"
            // onPress={() => console.log("Process groups", groups)}
          >
            <ButtonText>Create X Mementos</ButtonText>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
