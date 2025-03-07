/**
 * @description Screen for creating multiple new keepsake/mementos in bulk.
 * @requirements FR-22, FR-23
 */

import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { Button, ButtonText } from "@/src/components/ui/button";
import { Heading } from "@/src/components/ui/heading";
import { Text } from "@/src/components/ui/text";
import GroupedPhotoGrid, {
  PhotoWithGroup,
} from "@/src/components/inputs/GroupedPhotoGrid";
import usePhotos from "@/src/hooks/usePhotos";

export default function BulkCreateMemento() {
  const { hasPermission, addPhotos } = usePhotos({
    initialPhotos: [],
  });
  const [groupedPhotos, setGroupedPhotos] = useState<PhotoWithGroup[]>([]);
  const groupNumbers = useMemo(
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
        <GroupedPhotoGrid
          groupNumbers={groupNumbers}
          groupedPhotos={groupedPhotos}
          setGroupedPhotos={setGroupedPhotos}
        />
        <View className="mt-auto mb-4">
          <Button
            size="lg"
            // onPress={() => console.log("Process groups", groups)}
          >
            <ButtonText>Create {groupNumbers.length} Mementos</ButtonText>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
