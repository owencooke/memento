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
  group: number;
  disabledDrag?: boolean;
  disabledReSorted?: boolean;
}

type PhotoWithGroup = Photo & { group: number };

export default function BulkCreateMemento() {
  const { hasPermission, addPhotos } = usePhotos({
    initialPhotos: [],
  });
  const [groupedPhotos, setGroupedPhotos] = useState<PhotoWithGroup[]>([]);
  const groups = useMemo(
    () => [...new Set(groupedPhotos.map((p) => p.group))],
    [groupedPhotos],
  );

  // Adds multiple photos, each in own group initially
  const handleAddPhotos = useCallback(async () => {
    const newPhotos = await addPhotos("picker");
    setGroupedPhotos((prev) => [
      ...prev,
      ...newPhotos.map((photo, index) => ({
        ...photo,
        group: groupedPhotos.length + index,
      })),
    ]);
  }, [addPhotos, groupedPhotos.length]);

  // Create grouped photos for display in grid
  const gridData = useMemo(
    () =>
      groups.reduce<GridItem[]>((items, group) => {
        const groupItems = buildGroupItems(group, groupedPhotos);
        return [...items, ...groupItems];
      }, []),
    [groupedPhotos, groups],
  );

  // Updates the position and/or group number for a photo if moved
  const handleReorderPhotos = useCallback((newItems: GridItem[]) => {
    let currentGroup = 0;
    const updatedPhotos = newItems.reduce<PhotoWithGroup[]>((acc, item) => {
      if (item.type === "header") {
        currentGroup = item.group;
      } else if (item.type === "photo" && item.photo) {
        acc.push({ ...item.photo, group: currentGroup });
      }
      return acc;
    }, []);
    setGroupedPhotos(updatedPhotos);
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
        <Button onPress={handleAddPhotos} size="lg" className="mb-4">
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
                  <Text className="font-semibold">
                    Memento #{item.group + 1}
                  </Text>
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

/**
 * Logic for headers, spacers, and photo items for dividing grid into groups
 */

// Creates a spacer
const createSpacer = (
  group: number,
  index: number,
  type: ItemType,
  disabledReSorted = true,
) => ({
  key: `${type}-${group}-${index}`,
  type,
  group,
  disabledDrag: true,
  disabledReSorted,
});

// Adds photos for specific group
const addPhotosInGroup = (
  group: number,
  groupedPhotos: PhotoWithGroup[],
): GridItem[] =>
  groupedPhotos
    .filter((p) => p.group === group)
    .map((photo, idx) => ({
      key: `photo-${group}-${idx}`,
      type: "photo" as ItemType,
      photo,
      group,
    }));

// Adds trailing spacers after photos
const addTrailingSpacers = (
  group: number,
  groupPhotosLength: number,
): GridItem[] => {
  const remainder = groupPhotosLength % 3;
  const spacersNeeded = remainder === 0 ? 0 : 3 - remainder;
  return Array.from({ length: spacersNeeded }, (_, i) =>
    createSpacer(group, i + 3, "spacer" as ItemType, false),
  );
};

// Builds the full grid data for each group
const buildGroupItems = (group: number, groupedPhotos: PhotoWithGroup[]) => {
  const header = [
    createSpacer(group, 0, "header"),
    createSpacer(group, 1, "spacer"),
    createSpacer(group, 2, "spacer"),
  ];
  const photos = addPhotosInGroup(group, groupedPhotos);
  const trailingSpacers = addTrailingSpacers(group, photos.length);

  return [...header, ...photos, ...trailingSpacers];
};
