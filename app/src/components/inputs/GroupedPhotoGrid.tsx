/**
 * @description Component that enables grouping selected photos into different mementos.
 *      Uses a customized version of a draggable grid (with headers and spacers mixed in)
 * @requirements FR-22
 */

import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import DraggableGrid from "@/src/components/draggable-grid";
import { Button, ButtonIcon, ButtonText } from "@/src/components/ui/button";
import { Photo } from "@/src/libs/photos";
import InteractivePhotoCard from "@/src/components/cards/InteractivePhotoCard";
import { EditIcon } from "@/src/components/ui/icon";
import { Text } from "../ui/text";

type ItemType = "photo" | "header" | "spacer";

interface GridItem {
  key: string;
  type: ItemType;
  photo?: Photo;
  group: number;
  disabledDrag?: boolean;
  disabledReSorted?: boolean;
}

export type PhotoWithGroup = Photo & { group: number };

interface GroupedPhotoGridProps {
  groupedPhotos: PhotoWithGroup[];
  setGroupedPhotos: (photos: PhotoWithGroup[]) => void;
  setScrollEnabled: (enabled: boolean) => void;
  onEditGroup: (groupNumber: number) => void;
}

export default function GroupedPhotoGrid({
  groupedPhotos,
  setScrollEnabled,
  setGroupedPhotos,
  onEditGroup,
}: GroupedPhotoGridProps) {
  // Create grouped photos for display in grid
  const gridData = useMemo(() => {
    const groupNumbers = [...new Set(groupedPhotos.map((p) => p.group))];
    return groupNumbers.reduce<GridItem[]>(
      (items, group) => [...items, ...buildGroupItems(group, groupedPhotos)],
      [],
    );
  }, [groupedPhotos]);

  // Updates the position and/or group number for a photo if moved
  const handleReorderPhotos = useCallback(
    (newItems: GridItem[]) => {
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
      setScrollEnabled(true);
    },
    [setGroupedPhotos, setScrollEnabled],
  );

  return (
    <DraggableGrid
      numColumns={3}
      data={gridData}
      onDragStart={() => setScrollEnabled(false)}
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
              <Button
                size="lg"
                variant="link"
                className="p-0 pr-2"
                onPress={() => onEditGroup(item.group)}
              >
                <ButtonText>Memento #{item.group + 1}</ButtonText>
                <ButtonIcon as={EditIcon} />
              </Button>
            </View>
          );
        }
      }}
    />
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
