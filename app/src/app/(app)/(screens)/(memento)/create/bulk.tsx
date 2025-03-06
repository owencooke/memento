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

// Types for our grid items
type ItemType = "photo" | "header" | "spacer";

interface GridItem {
  key: string;
  type: ItemType;
  photo?: Photo;
  groupId?: number;
  disabledDrag?: boolean;
  disabledReSorted?: boolean;
}

export default function BulkCreateMemento() {
  const { hasPermission, addPhotos, photos, removePhoto, setPhotos } =
    usePhotos({ initialPhotos: [] });

  // Track groups separately from photos
  const [groups, setGroups] = useState<number[]>([]);

  // When photos are added, assign each to its own group
  const handleAddPhotos = useCallback(
    async (source: "picker" | "camera") => {
      const newPhotos = await addPhotos(source);
      const newGroupCount = newPhotos.length;

      if (newGroupCount > 0) {
        const newGroups = Array.from(
          { length: newGroupCount },
          (_, i) => groups.length + i + 1,
        );

        setGroups((prev) => [...prev, ...newGroups]);
      }
    },
    [addPhotos, groups.length],
  );

  // Create grid data with headers, photos, and add-group button
  const gridData = useMemo(() => {
    // Start with an empty array
    const items: GridItem[] = [];

    // If no groups exist yet, add one
    if (groups.length === 0 && photos.length > 0) {
      setGroups([0]);
    }

    // Distribute photos among groups
    let photoIndex = 0;

    // Add headers and photos for each group
    groups.forEach((groupId, index) => {
      // Add group header
      items.push({
        key: `header-${groupId}`,
        type: "header",
        groupId,
        disabledDrag: true,
        disabledReSorted: true,
      });

      const spacer = {
        type: "spacer" as ItemType,
        disabledDrag: true,
        // disabledReSorted: true,
        groupId,
      };

      items.push({ ...spacer, key: `header-spacer-${groupId}-1` });
      items.push({ ...spacer, key: `header-spacer-${groupId}-2` });

      // Add photos that belong to this group
      const groupPhotos =
        index < groups.length - 1
          ? photos.slice(photoIndex, photoIndex + 1) // Initial state: 1 photo per group
          : photos.slice(photoIndex); // Last group gets any remaining photos

      groupPhotos.forEach((photo) => {
        items.push({
          key: `photo-${photo.assetId || photo.uri}`,
          type: "photo",
          photo,
          groupId,
        });
      });

      photoIndex += groupPhotos.length;

      // Calculate how many spacers are needed
      const remainder = groupPhotos.length % 3;
      const spacersNeeded = remainder === 0 ? 0 : 3 - remainder;

      for (let i = 0; i < spacersNeeded; i++) {
        items.push({ ...spacer, key: `photo-spacer-${groupId}-${i}` });
      }
    });

    return items;
  }, [groups, photos]);

  // Handle reordering of photos
  const handleReorderPhotos = useCallback(
    (newItems: GridItem[]) => {
      console.log(
        "Before cleanup:",
        newItems.map((item) => item.key),
      );

      const cleanedItems: GridItem[] = [];
      let lastHeaderIndex: number | null = null;
      let lastGroupId: number | null = null;

      newItems.forEach((item, index) => {
        if (item.type === "header") {
          // If we already encountered a header and only saw spacers in between, remove them
          if (lastHeaderIndex !== null) {
            let onlySpacersBetween = true;

            for (let i = lastHeaderIndex + 1; i < index; i++) {
              if (newItems[i].type !== "spacer") {
                onlySpacersBetween = false;
                break;
              }
            }

            if (onlySpacersBetween) {
              // Remove the previous header and its spacers
              cleanedItems.splice(lastHeaderIndex);
            }
          }

          // Update the current header index and groupId
          lastHeaderIndex = cleanedItems.length;
          lastGroupId = item.groupId!;
        }

        // Update the groupId for photo items if necessary
        if (item.type === "photo" && item.photo) {
          item.groupId = lastGroupId!;
        }

        cleanedItems.push(item);
      });

      // Check if the last group only contains spacers, if so, remove it
      const lastGroupIndex = cleanedItems.findIndex(
        (item) => item.type === "header" && item.groupId === lastGroupId,
      );
      if (lastGroupIndex !== -1) {
        const remainingItems = cleanedItems.slice(lastGroupIndex + 1);
        if (remainingItems.every((item) => item.type === "spacer")) {
          cleanedItems.splice(lastGroupIndex); // Remove the last group with only spacers
        }
      }

      console.log(
        "After cleanup:",
        cleanedItems.map((item) => item.key),
      );

      // Now update the groups and photos state accordingly
      const newGroups = cleanedItems
        .filter((item) => item.type === "header" && item.groupId !== undefined)
        .map((item) => item.groupId!); // Using `!` because we've filtered out `undefined`

      const newPhotos = cleanedItems
        .filter((item) => item.type === "photo" && item.photo !== undefined)
        .map((item) => item.photo!); // Using `!` to ensure no `undefined` values

      setGroups(newGroups);
      setPhotos(newPhotos);
    },
    [setPhotos, setGroups],
  );

  // Remove a photo
  const handleRemovePhoto = useCallback(
    (photo: Photo) => {
      removePhoto(photo);

      // If this was the last photo and there's more than one group, remove a group
      if (photos.length <= groups.length && groups.length > 0) {
        setGroups((prev) => prev.slice(0, -1));
      }
    },
    [photos.length, groups.length, removePhoto],
  );

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
                      onPress={() =>
                        item.photo && handleRemovePhoto(item.photo)
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
            onPress={() => console.log("Process groups", groups)}
          >
            <ButtonText>Create {groups.length} Mementos</ButtonText>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
