import { useSession } from "@/src/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import {
  createNewCollectionApiUserUserIdCollectionPostMutation,
  getUsersCollectionsApiUserUserIdCollectionGetQueryKey,
} from "@/src/api-client/generated/@tanstack/react-query.gen";
import { toISODateString } from "@/src/libs/date";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { queryClient } from "@/src/app/_layout";
import CollectionForm, {
  CollectionFormData,
} from "@/src/components/forms/CollectionForm";

/**
 * @description Screen for creating a new collection
 *
 * @requirements FR-35, FR-36, FR-37
 *
 * @component
 * @returns {JSX.Element} Rendered CreateCollection screen.
 */
export default function CreateCollection() {
  const { session } = useSession();
  const createMutation = useMutation(
    createNewCollectionApiUserUserIdCollectionPostMutation(),
  );

  /**
   * Handles form submission by creating a new collection.
   *
   *
   * @param {CreateCollectionForm} form - Form containing collection detals
   */
  const onSubmit = async (form: CollectionFormData) => {
    const {
      location: { lat, long, text },
      date,
      ...restCollection
    } = form;
    const collection = {
      ...restCollection,
      date: date ? toISODateString(date) : null,
      location: text ? text : null,
      coordinates: lat && long ? { lat, long } : null,
    };

    const path = { user_id: session?.user.id ?? "" };
    await createMutation.mutateAsync(
      {
        body: {
          new_collection: collection,
          mementos: [], // Mementos currently empty
        } as any,
        path,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getUsersCollectionsApiUserUserIdCollectionGetQueryKey({
              path,
            }),
          });
          router.replace("/(app)/(tabs)/collections");
        },
        onError: (error: any) =>
          console.error("Failed to create new collection", error),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <CollectionForm
        title="Create Collection"
        submitButtonText="Create Collection"
        isSubmitting={createMutation.isPending}
        onSubmit={onSubmit}
      />
    </SafeAreaView>
  );
}
