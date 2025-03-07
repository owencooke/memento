import { useState, useCallback, useMemo } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native";
import { Button, ButtonText } from "@/src/components/ui/button";
import { Heading } from "@/src/components/ui/heading";
import { Text } from "@/src/components/ui/text";
import GroupedPhotoGrid, {
  PhotoWithGroup,
} from "@/src/components/inputs/GroupedPhotoGrid";
import usePhotos from "@/src/hooks/usePhotos";
import MementoForm, {
  MementoFormData,
} from "@/src/components/forms/MementoForm";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
} from "@/src/components/ui/actionsheet";

type GroupedMemento = MementoFormData["memento"] & { group: number };

export default function BulkCreateMemento() {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const { hasPermission, addPhotos } = usePhotos({
    initialPhotos: [],
  });

  const [groupedPhotos, setGroupedPhotos] = useState<PhotoWithGroup[]>([]);
  const groupNumbers = useMemo(
    () => [...new Set(groupedPhotos.map((p) => p.group))],
    [groupedPhotos],
  );

  // State for modal and tracking group mementos
  const [editingGroup, setEditingGroup] = useState<number | null>(null);
  const [groupedMementos, setGroupedMementos] = useState<GroupedMemento[]>([]);

  // Find photos for current editing group
  const currentGroupPhotos = useMemo(() => {
    if (editingGroup === null) return [];
    return groupedPhotos.filter((photo) => photo.group === editingGroup);
  }, [editingGroup, groupedPhotos]);

  // Get current group memento data if exists
  const currentGroupMemento = useMemo(() => {
    if (editingGroup === null) return null;
    return groupedMementos.find((gm) => gm.group === editingGroup);
  }, [editingGroup, groupedMementos]);

  // Adds multiple photos, each in own group initially
  const handleAddPhotos = useCallback(async () => {
    const newPhotos = await addPhotos("picker");
    setGroupedPhotos((prev) => [
      ...prev,
      ...newPhotos.map((photo, index) => ({
        ...photo,
        group: groupNumbers.length + index,
      })),
    ]);
  }, [addPhotos, groupNumbers.length]);

  // Handle opening the edit form for a specific group
  const handleEditGroup = useCallback((group: number) => {
    setEditingGroup(group);
  }, []);

  // Handle form submission for a group
  const handleGroupFormSubmit = useCallback(
    async (formData: MementoFormData) => {
      if (editingGroup === null) return;

      // Update or add new group metadata
      setGroupedMementos((prev) => {
        const existingIndex = prev.findIndex((gm) => gm.group === editingGroup);
        const newMemento = {
          group: editingGroup,
          caption: formData.memento.caption,
          date: formData.memento.date,
          location: formData.memento.location,
        };

        if (existingIndex >= 0) {
          // Update existing
          const updated = [...prev];
          updated[existingIndex] = newMemento;
          return updated;
        } else {
          // Add new
          return [...prev, newMemento];
        }
      });

      // Close the modal
      setEditingGroup(null);
    },
    [editingGroup],
  );

  // Create initial form values for the current group
  const initialFormValues = useMemo((): MementoFormData | undefined => {
    if (!currentGroupMemento) return undefined;

    return {
      memento: currentGroupMemento,
      photos: currentGroupPhotos,
    };
  }, [currentGroupMemento, currentGroupPhotos]);

  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <FlatList
        data={[]}
        scrollEnabled={scrollEnabled}
        renderItem={() => <></>}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View className="flex-1 p-4">
            <Heading className="block mb-2" size="2xl">
              Create Multiple
            </Heading>
            <Text size="lg" className="text-left font-light mb-4">
              Drag-and-drop multiple photos to sort them into individual
              mementos!
            </Text>
            <Button
              action="secondary"
              onPress={handleAddPhotos}
              size="lg"
              className="mb-4"
            >
              <ButtonText>Add photos from library</ButtonText>
            </Button>
            <GroupedPhotoGrid
              groupNumbers={groupNumbers}
              groupedPhotos={groupedPhotos}
              setGroupedPhotos={setGroupedPhotos}
              setScrollEnabled={setScrollEnabled}
              onEditGroup={handleEditGroup}
            />
            {groupedPhotos.length > 0 && (
              <Button
                className="mt-6"
                size="lg"
                onPress={() => {
                  // Here you would implement the bulk creation logic
                  console.log("Grouped photos:", groupedPhotos);
                  console.log("Group mementos:", groupedMementos);
                }}
              >
                <ButtonText>
                  Create {groupNumbers.length} Memento
                  {groupNumbers.length > 1 && "s"}
                </ButtonText>
              </Button>
            )}
          </View>
        }
      />

      {/* Modal for editing group */}
      <Actionsheet
        isOpen={editingGroup !== null}
        onClose={() => setEditingGroup(null)}
      >
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {typeof editingGroup === "number" && (
            <MementoForm
              initialValues={initialFormValues}
              submitButtonText="Save Changes"
              isSubmitting={false}
              photosEditable={false}
              onSubmit={handleGroupFormSubmit}
              FormHeader={`Memento #${editingGroup + 1}`}
            />
          )}
        </ActionsheetContent>
      </Actionsheet>
    </SafeAreaView>
  );
}
