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
    // You'd need to adapt this to match how photos are stored/fetched in your API
    photos: [],
    // memento.images?.map(
    //   (img) =>
    //     ({
    //       uri: img.url,
    //       fileName: img.filename || "",
    //       mimeType: img.mime_type || "image/jpeg",
    //       // add other required Photo properties
    //     }) as Photo,
    // ) || [],
  });

  // TODO: document
  const onSubmit = async (form: MementoFormData) => {
    const {
      location: { lat, long, text },
      date,
      ...restMemento
    } = form.memento;

    const updatedMemento = {
      ...restMemento,
      date: date ? toISODateString(date) : null,
      location: text ? text : null,
      coordinates: lat && long ? { lat, long } : null,
    };

    const imageMetadata = form.photos.map((photo, idx) => ({
      ...getRelevantImageMetadata(photo),
      order_index: idx,
    }));

    // don't want to include every photo
    const images = form.photos.map((photo) => ({
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
          queryClient.invalidateQueries({
            queryKey: getUsersMementosApiUserUserIdMementoGetQueryKey({
              path: { user_id: user_id },
            }),
          });
          router.replace(`/(app)/(screens)/(memento)/${memento.id}`);
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
