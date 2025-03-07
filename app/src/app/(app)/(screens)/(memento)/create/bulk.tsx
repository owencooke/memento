/**
 * @description Screen for creating multiple new keepsake/mementos in bulk.
 * @requirements FR-22, FR-23
 */

import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import DraggableGrid from "@/src/components/draggable-grid";
import { Button, ButtonIcon, ButtonText } from "@/src/components/ui/button";
import usePhotos, { Photo } from "@/src/hooks/usePhotos";
import { Heading } from "@/src/components/ui/heading";
import { Text } from "@/src/components/ui/text";
import InteractivePhotoCard from "@/src/components/cards/InteractivePhotoCard";
import { EditIcon } from "@/src/components/ui/icon";

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
    let photoInGroup = false;
    const updatedPhotos = newItems.reduce<PhotoWithGroup[]>((acc, item) => {
      if (item.type === "header" && photoInGroup) {
        currentGroup += 1;
        photoInGroup = false;
      } else if (item.type === "photo" && item.photo) {
        acc.push({ ...item.photo, group: currentGroup });
        photoInGroup = true;
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
          renderItem={(item: GridItem) => {
            if (item.type === "spacer") {
              return (
                <View className="max-h-5 bg-red-300">
                  {/* Uncomment if debugging spacer behaviour */}
                  {/* <Text>{item.key}</Text> */}
                </View>
              );
            } else if (item.type === "photo" && item.photo) {
              return (
                <View>
                  <InteractivePhotoCard photo={item.photo} />
                </View>
              );
            } else {
              return (
                <View className="mt-4">
                  <Button size="lg" variant="link" className="p-0">
                    <ButtonText> Memento #{item.group + 1}</ButtonText>
                    <ButtonIcon as={EditIcon} className="ml-2" />
                  </Button>
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
            <ButtonText>Create {groups.length} Mementos</ButtonText>
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
  height: 48,
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

// Adds trailing spacers after photos (to ensure header starts on next row)
const addTrailingSpacers = (
  group: number,
  groupPhotosLength: number,
): GridItem[] => {
  const remainder = groupPhotosLength % 3;
  const spacersNeeded = remainder === 0 ? 3 : 3 - remainder;
  return Array.from({ length: spacersNeeded }, (_, i) =>
    createSpacer(group, i + 4, "spacer" as ItemType, false),
  );
};

// Builds the full grid data for each group
const buildGroupItems = (group: number, groupedPhotos: PhotoWithGroup[]) => {
  const header = [
    createSpacer(group, 0, "header"),
    createSpacer(group, 1, "spacer"),
    // Note: this spacer must be re-orderable, because trying to move a photo down to
    // a different group will move the first photo from moved-to group to move up (instead of staying)
    createSpacer(group, 2, "spacer", false),
  ];
  const photos = addPhotosInGroup(group, groupedPhotos);
  const trailingSpacers = addTrailingSpacers(group, photos.length);

  return [...header, ...photos, ...trailingSpacers];
};
