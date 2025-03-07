import { useState, useCallback, useMemo } from "react";
import { Pressable, View } from "react-native";
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
  defaultMementoFormValues,
  MementoFormData,
} from "@/src/components/forms/MementoForm";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
} from "@/src/components/ui/actionsheet";
import { CloseIcon, Icon } from "@/src/components/ui/icon";

type BulkMementoGroup = MementoFormData["memento"] & {
  groupId: number;
  photos: PhotoWithGroup[];
};

export default function BulkCreateMemento() {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const { hasPermission, addPhotos } = usePhotos({
    initialPhotos: [],
  });

  const [mementoGroups, setMementoGroups] = useState<BulkMementoGroup[]>([]);

  const groupedPhotos = useMemo(
    () => mementoGroups.flatMap((group) => group.photos),
    [mementoGroups],
  );

  const [editingGroup, setEditingGroup] = useState<BulkMementoGroup | null>(
    null,
  );

  // Add more photos (each new photo starts as a new group)
  const handleAddPhotos = useCallback(async () => {
    const newPhotos = await addPhotos("picker");
    const newMementoGroups = newPhotos.map((photo, index) => {
      const groupId = mementoGroups.length + index;
      return {
        groupId,
        ...defaultMementoFormValues.memento,
        photos: [{ ...photo, group: groupId }],
      };
    });
    setMementoGroups((prev) => [...prev, ...newMementoGroups]);
  }, [addPhotos, mementoGroups.length]);

  // Update memento groups when user drags/reorders a photo
  const handlePhotosReordered = useCallback(
    (updatedPhotos: PhotoWithGroup[]) => {
      const updatedGroups = mementoGroups
        .map((currentGroup) => {
          // Get updated photos in group
          const photosInGroup = updatedPhotos.filter(
            (p) => p.group === currentGroup.groupId,
          );
          return { ...currentGroup, photos: photosInGroup };
        })
        // Remove groups with no photos
        .filter((group) => group.photos.length > 0);

      setMementoGroups(updatedGroups);
      setScrollEnabled(true);
    },
    [mementoGroups],
  );

  // Open the edit memento form for a specific group
  const handleEditGroup = useCallback(
    (groupId: number) => {
      const editedGroup = mementoGroups.find(
        (group) => group.groupId === groupId,
      );
      setEditingGroup(editedGroup ? editedGroup : null);
    },
    [mementoGroups],
  );

  // Save the new user-inputted memento details for an edited group
  const handleSaveGroupDetails = useCallback(
    async (formData: MementoFormData) => {
      setMementoGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.groupId === editingGroup?.groupId
            ? {
                ...group,
                caption: formData.memento.caption,
                date: formData.memento.date,
                location: formData.memento.location,
              }
            : group,
        ),
      );
      setEditingGroup(null);
    },
    [editingGroup?.groupId],
  );

  const handleCloseGroupForm = () => setEditingGroup(null);

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
              groupedPhotos={groupedPhotos}
              setGroupedPhotos={handlePhotosReordered}
              setScrollEnabled={setScrollEnabled}
              onEditGroup={handleEditGroup}
            />
            {mementoGroups.length > 0 && (
              <Button
                className="mt-6"
                size="lg"
                onPress={() => {
                  console.log("Memento groups:", mementoGroups);
                }}
              >
                <ButtonText>
                  Create {mementoGroups.length} Memento
                  {mementoGroups.length > 1 && "s"}
                </ButtonText>
              </Button>
            )}
          </View>
        }
      />
      {/* Actionsheet for editing a memento groups' details */}
      {editingGroup && (
        <Actionsheet isOpen onClose={handleCloseGroupForm}>
          <ActionsheetBackdrop />
          <ActionsheetContent>
            <ActionsheetDragIndicatorWrapper className="h-8">
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <View className="w-full">
              <Pressable className="self-end" onPress={handleCloseGroupForm}>
                <Icon
                  as={CloseIcon}
                  size="xl"
                  className="stroke-background-500"
                />
              </Pressable>
              <MementoForm
                initialValues={{
                  memento: {
                    caption: editingGroup.caption,
                    date: editingGroup.date,
                    location: editingGroup.location,
                  },
                  photos: editingGroup.photos,
                }}
                submitButtonText="Save Changes"
                isSubmitting={false}
                photosEditable={false}
                onSubmit={handleSaveGroupDetails}
                FormHeader={`Memento #${editingGroup.groupId + 1}`}
              />
            </View>
          </ActionsheetContent>
        </Actionsheet>
      )}
    </SafeAreaView>
  );
}
