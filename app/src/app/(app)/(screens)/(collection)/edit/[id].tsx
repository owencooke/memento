/**
 * @description Screen for editing an existing collection.
 * @requirements FR-43, FR-44, FR-45
 */

import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  updateMementoAndImagesApiUserUserIdMementoIdPutMutation,
  getUsersMementosApiUserUserIdMementoGetQueryKey,
  getUsersMementosApiUserUserIdMementoGetOptions,
  getUsersCollectionsApiUserUserIdCollectionGetOptions,
  updateCollectionAndMementosApiUserUserIdCollectionIdPutMutation,
  getUsersCollectionsApiUserUserIdCollectionGetQueryKey,
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
import {
  CollectionWithMementos,
  MementoWithImages,
} from "@/src/api-client/generated";
import { isEqual } from "lodash";
import { useMemo } from "react";
import CollectionForm, {
  CollectionFormData,
} from "@/src/components/forms/CollectionForm";

export default function EditCollection() {
  // Get user id
  const { session } = useSession();
  const user_id = String(session?.user.id);
  // Get existing memento
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: collections } = useQuery({
    ...getUsersCollectionsApiUserUserIdCollectionGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
    refetchOnMount: false,
  });
  const collection = collections?.find(
    (c) => c.id === Number(id),
  ) as CollectionWithMementos;

  const updateMutation = useMutation(
    updateCollectionAndMementosApiUserUserIdCollectionIdPutMutation(),
  );

  // Convert fetched memento into initial form values
  const initialFormValues = useMemo((): CollectionFormData => {
    return {
      title: collection?.title || "",
      caption: collection?.caption || "",
      date: collection?.date ? getDateFromISO(collection.date) : null,
      location: {
        text: collection?.location || "",
        lat: collection?.coordinates?.lat,
        long: collection?.coordinates?.long,
      } as GeoLocation,
    };
  }, [collection]);

  const handleRedirect = () =>
    router.dismissTo(`/(app)/(screens)/(collection)/${collection.id}`);

  // PUT Edit Memento Form
  const onSubmit = async (form: CollectionFormData) => {
    // Skip form submission if no changes made
    if (isEqual(form, initialFormValues)) {
      handleRedirect();
      return;
    }

    const {
      location: { lat, long, text },
      date,
      ...restCollection
    } = form;

    // Only include fields if explictly set
    const updatedCollection = {
      ...restCollection,
      date: date ? toISODateString(date) : null,
      location: text ? text : null,
      coordinates: lat && long ? { lat, long } : null,
    };

    const path = {
      user_id,
      id: collection.id,
    };

    await updateMutation.mutateAsync(
      {
        body: {
          collection: updatedCollection,
          mementos: [],
        } as any,
        path,
      },
      {
        onSuccess: () => {
          //   Invalidate cached GET mementos before redirecting
          queryClient.invalidateQueries({
            queryKey: getUsersCollectionsApiUserUserIdCollectionGetQueryKey({
              path,
            }),
          });
          handleRedirect();
        },
        onError: (error: any) =>
          console.error("Failed to update collection", error),
      },
    );
  };
  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      {collection && (
        <CollectionForm
          initialValues={initialFormValues}
          title="Edit Collection"
          submitButtonText="Save Changes"
          isSubmitting={updateMutation.isPending}
          onSubmit={onSubmit}
        />
      )}
    </SafeAreaView>
  );
}
