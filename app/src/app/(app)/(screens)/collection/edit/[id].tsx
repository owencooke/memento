/**
 * @description Screen for editing an existing collection.
 * @requirements FR-43, FR-44, FR-45
 */

import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getUsersCollectionsApiUserUserIdCollectionGetOptions,
  updateCollectionAndMementosApiUserUserIdCollectionIdPutMutation,
  getUsersCollectionsApiUserUserIdCollectionGetQueryKey,
} from "@/src/api-client/generated/@tanstack/react-query.gen";
import { useSession } from "@/src/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import { getDateFromISO, toISODateString } from "@/src/libs/date";
import { queryClient } from "@/src/app/_layout";
import { GeoLocation } from "@/src/components/inputs/LocationInput";
import { CollectionWithMementos } from "@/src/api-client/generated";
import { isEqual } from "lodash";
import { useMemo, useRef } from "react";
import CollectionForm, {
  CollectionFormData,
} from "@/src/components/forms/CollectionForm";

export default function EditCollection() {
  // Get user id
  const { session } = useSession();
  const user_id = String(session?.user.id);
  // Get existing collection and IDs of the collection's mementos
  const { id, ids } = useLocalSearchParams();

  // Array of the collection's memento IDs
  const ids_array: number[] = !ids
    ? []
    : Array.isArray(ids)
      ? ids.map(Number)
      : ids.split(",").map(Number);

  // Store the initial IDs in a ref to preserve them across renders
  const initialIdsRef = useRef<number[]>(ids_array);

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

  // Update query
  const updateMutation = useMutation(
    updateCollectionAndMementosApiUserUserIdCollectionIdPutMutation(),
  );

  // Convert fetched collection into initial form values
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
    router.dismissTo(`/(app)/(screens)/collection/${collection.id}`);

  // PUT Edit Collection Form
  const onSubmit = async (form: CollectionFormData) => {
    // Skip form submission if no changes made
    const idsAreEqual =
      JSON.stringify(initialIdsRef.current) === JSON.stringify(ids_array);
    if (isEqual(form, initialFormValues) && idsAreEqual) {
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
          mementos: ids_array,
        } as any,
        path,
      },
      {
        onSuccess: () => {
          //   Invalidate cached GET collections before redirecting
          queryClient.invalidateQueries({
            queryKey: getUsersCollectionsApiUserUserIdCollectionGetQueryKey({
              path: { user_id: user_id },
            }),
          });
          handleRedirect();
        },
        onError: (error: any) =>
          console.log("Failed to update collection", error),
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
