/**
 * @description Screen that allows user to create multiple keepsakes in bulk.
 *      Uses multi-select image picking and drag-and-drop to sort into groups.
 * @requirements FR-22, FR-23, FR-24
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native";
import { Button, ButtonSpinner, ButtonText } from "@/src/components/ui/button";
import { Heading } from "@/src/components/ui/heading";
import { Text } from "@/src/components/ui/text";
import GroupedPhotoGrid, {
  PhotoWithGroup,
} from "@/src/components/inputs/GroupedPhotoGrid";
import usePhotos from "@/src/hooks/usePhotos";
import MementoForm, {
  defaultMementoFormValues,
} from "@/src/components/forms/MementoForm";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
} from "@/src/components/ui/actionsheet";
import { CloseIcon, Icon } from "@/src/components/ui/icon";
import { createNewMementoApiUserUserIdMementoPostMutation } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { useMutation } from "@tanstack/react-query";
import {
  MementoFormData,
  prepareMementoPayload,
} from "@/src/api-client/memento";
import { formDataBodySerializer } from "@/src/api-client/formData";
import { useSession } from "@/src/context/AuthContext";
import BulkCreateCollectionModal from "@/src/components/forms/BulkCreateCollectionModal";
import BackgroundRemovalModal from "@/src/components/forms/BackgroundRemovalModal";

type BulkMementoGroup = MementoFormData["memento"] & {
  groupId: number;
  photos: PhotoWithGroup[];
};

export default function BulkCreateMemento() {
  const { session } = useSession();

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const {
    photos,
    hasPermission,
    addPhotos,
    pendingProcessedPhotos,
    acceptProcessedPhoto,
    rejectProcessedPhoto,
  } = usePhotos({
    initialPhotos: [],
  });
  const createMutation = useMutation(
    createNewMementoApiUserUserIdMementoPostMutation(),
  );

  const [mementoGroups, setMementoGroups] = useState<BulkMementoGroup[]>([]);

  const groupedPhotos = useMemo(
    () => mementoGroups.flatMap((group) => group.photos),
    [mementoGroups],
  );

  const [editingGroup, setEditingGroup] = useState<BulkMementoGroup | null>(
    null,
  );
  const photoIdsInEditingGroup = useMemo(
    () =>
      editingGroup ? editingGroup.photos.map((photo) => photo.assetId) : [],
    [editingGroup],
  );

  const [createdMementoIds, setCreatedMementoIds] = useState<number[]>([]);

  // Add more photos (each new photo starts as a new group)
  const handleAddPhotos = async () => addPhotos("picker");

  useEffect(() => {
    setMementoGroups((prevGroups) => {
      let lastGroupId = prevGroups.length;
      const prevPhotos = prevGroups.flatMap((group) => group.photos);
      return photos.map((newPhoto) => {
        const matchingGroupedPhoto = prevPhotos.find(
          (p) => p.assetId === newPhoto.assetId,
        );
        if (!matchingGroupedPhoto) {
          // New photo -> assigned to new group
          lastGroupId += 1;
          return {
            ...defaultMementoFormValues.memento,
            groupId: lastGroupId,
            photos: [{ ...newPhoto, group: lastGroupId }],
          };
        }
        // Get previous group and update the specific photo (in case it had bg removed)
        const prevGroup = prevGroups.find(
          (group) => matchingGroupedPhoto.group === group.groupId,
        )!;
        return {
          ...prevGroup,
          photos: prevGroup.photos.map((oldPhoto) =>
            oldPhoto.group === matchingGroupedPhoto.group
              ? { ...newPhoto, group: oldPhoto.group }
              : oldPhoto,
          ),
        };
      });
    });
  }, [photos]);

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
      handleCloseGroupForm();
    },
    [editingGroup?.groupId],
  );

  const handleCloseGroupForm = () => setEditingGroup(null);

  // Make POST call to Create Memento for each memento group
  const handleSubmit = async () => {
    try {
      const responses = await Promise.all(
        mementoGroups.map(async (group) => {
          const { groupId, photos, ...memento } = group;
          const body: any = prepareMementoPayload({ memento, photos });
          return createMutation.mutateAsync({
            body,
            path: { user_id: String(session?.user.id) },
            bodySerializer: formDataBodySerializer.bodySerializer,
          });
        }),
      );
      setCreatedMementoIds(responses.map((r) => r.new_memento_id));
    } catch (error: any) {
      // TODO: add error toast or indicator?
      console.error(
        "Failed to bulk create mementos:",
        JSON.stringify(error?.detail, undefined, 2),
      );
    }
  };

  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      {/* Bulk Create Form */}
      <FlatList
        data={[]}
        scrollEnabled={scrollEnabled}
        renderItem={() => <></>}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View className="flex-1">
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
                onPress={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <ButtonSpinner />
                ) : (
                  <ButtonText>
                    Create {mementoGroups.length} Memento
                    {mementoGroups.length > 1 && "s"}
                  </ButtonText>
                )}
              </Button>
            )}
          </View>
        }
      />
      {editingGroup && (
        <>
          {/* Actionsheet for editing a memento group's details */}
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
          {/* Accept/reject background removal result when group opened */}
          {pendingProcessedPhotos
            .filter((backgroundFreePhoto) =>
              photoIdsInEditingGroup.includes(backgroundFreePhoto.assetId),
            )
            .map((backgroundFreePhoto, idx) => (
              <BackgroundRemovalModal
                key={idx}
                photo={backgroundFreePhoto}
                accept={() => acceptProcessedPhoto(backgroundFreePhoto)}
                reject={() => rejectProcessedPhoto(backgroundFreePhoto)}
              />
            ))}
        </>
      )}

      {/* Modal for optional creation of new collection */}
      {createdMementoIds.length > 0 && (
        <BulkCreateCollectionModal newMementoIds={createdMementoIds} />
      )}
    </SafeAreaView>
  );
}
