/**
 * @description Screen for editing an existing memento.
 */

import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  updateMementoAndImagesApiUserUserIdMementoIdPutMutation,
  getUsersMementosApiUserUserIdMementoGetQueryKey,
  getUsersMementosApiUserUserIdMementoGetOptions,
} from "@/src/api-client/generated/@tanstack/react-query.gen";
import { useSession } from "@/src/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import { getDateFromISO, toISODateString } from "@/src/libs/date";
import { formDataBodySerializer } from "@/src/api-client/formData";
import { getRelevantImageMetadata } from "@/src/libs/metadata";
import { queryClient } from "@/src/app/_layout";
import MementoForm, {
  MementoFormData,
} from "@/src/components/forms/MementoForm";
import { GeoLocation } from "@/src/components/inputs/LocationInput";
import { Photo } from "@/src/hooks/usePhotos";
import { MementoWithImages } from "@/src/api-client/generated";

export default function EditMemento() {
  // Get user id
  const { session } = useSession();
  const user_id = String(session?.user.id);
  // Get existing memento
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: mementos } = useQuery({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id,
      },
    }),
    refetchOnMount: false,
  });
  const memento = mementos?.find(
    (m) => m.id === Number(id),
  ) as MementoWithImages;

  const updateMutation = useMutation(
    updateMementoAndImagesApiUserUserIdMementoIdPutMutation(),
  );

  // Convert memento into initial form data values
  const prepareInitialValues = (): MementoFormData => ({
    memento: {
      caption: memento.caption || "",
      date: memento.date ? getDateFromISO(memento.date) : null,
      location: {
        text: memento.location || "",
        lat: memento.coordinates?.lat,
        long: memento.coordinates?.long,
      } as GeoLocation,
    },
    photos:
      memento.images?.map(
        (img) =>
          ({
            uri: img.url,
            storedInCloud: true,
            fileName: img.filename,
          }) as Photo,
      ) || [],
  });

  // PUT Edit Memento Form
  const onSubmit = async (form: MementoFormData) => {
    const {
      location: { lat, long, text },
      date,
      ...restMemento
    } = form.memento;

    // Only include fields if explictly set
    const updatedMemento = {
      ...restMemento,
      date: date ? toISODateString(date) : null,
      location: text ? text : null,
      coordinates: lat && long ? { lat, long } : null,
    };

    // Metadata for each image (with updated ordering)
    const imageMetadata = form.photos.map((photo, idx) => ({
      ...getRelevantImageMetadata(photo),
      order_index: idx,
    }));

    // Filter out images already stored in cloud
    const images = form.photos
      .filter((photo) => !photo.storedInCloud)
      .map((photo) => ({
        uri: photo.uri,
        type: photo.mimeType,
        name: photo.fileName,
      }));

    const path = {
      user_id,
      id: memento.id,
    };

    await updateMutation.mutateAsync(
      {
        body: {
          memento_str: updatedMemento,
          image_metadata_str: imageMetadata,
          images,
        } as any,
        path,
        bodySerializer: formDataBodySerializer.bodySerializer,
      },
      {
        onSuccess: () => {
          // Invalidate cached GET mementos before redirecting
          //   queryClient.invalidateQueries({
          //     queryKey: getUsersMementosApiUserUserIdMementoGetQueryKey({
          //       path: { user_id: user_id },
          //     }),
          //   });
          router.dismissTo(`/(app)/(screens)/(memento)/${memento.id}`);
        },
        onError: (error: any) =>
          console.error("Failed to update memento", error),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {memento && (
          <MementoForm
            initialValues={prepareInitialValues()}
            title="Edit Memento"
            submitButtonText="Save Changes"
            isSubmitting={updateMutation.isPending}
            onSubmit={onSubmit}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
