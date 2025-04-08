/**
 * @description Screen for editing an existing memento.
 * @requirements FR-30, FR31, FR-32, FR-33
 */

import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import {
  updateMementoAndImagesApiUserUserIdMementoIdPutMutation,
  getUsersMementosApiUserUserIdMementoGetQueryKey,
} from "@/src/api-client/generated/@tanstack/react-query.gen";
import { useSession } from "@/src/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import { getDateFromISO } from "@/src/libs/date";
import { formDataBodySerializer } from "@/src/api-client/formData";
import { queryClient } from "@/src/app/_layout";
import MementoForm from "@/src/components/forms/MementoForm";
import { GeoLocation } from "@/src/components/inputs/LocationInput";
import { Photo } from "@/src/libs/photos";
import { isEqual } from "lodash";
import { useMemo } from "react";
import {
  MementoFormData,
  prepareMementoPayload,
} from "@/src/api-client/memento";
import { useMementos } from "@/src/hooks/useMementos";

export default function EditMemento() {
  // Get user id
  const { session } = useSession();
  const user_id = String(session?.user.id);

  // Get existing memento
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mementos } = useMementos({
    queryOptions: { refetchOnMount: false },
  });
  const memento = mementos?.find((m) => m.id === Number(id));

  const updateMutation = useMutation(
    updateMementoAndImagesApiUserUserIdMementoIdPutMutation(),
  );

  // Convert fetched memento into initial form values
  const initialFormValues = useMemo((): MementoFormData => {
    return {
      memento: {
        caption: memento?.caption || "",
        date: memento?.date ? getDateFromISO(memento.date) : null,
        location: {
          text: memento?.location || "",
          lat: memento?.coordinates?.lat,
          long: memento?.coordinates?.long,
        } as GeoLocation,
      },
      photos:
        memento?.images?.map(
          (img) =>
            ({
              uri: img.url,
              storedInCloud: true,
              fileName: img.filename,
              assetId: img.id.toString(),
            }) as Photo,
        ) || [],
    };
  }, [memento]);

  const handleRedirect = () => router.back();

  // Call PUT Edit Memento endpoint with custom serializer for multi-part form data
  const onSubmit = async (form: MementoFormData) => {
    // Skip form submission if no changes made
    if (isEqual(form, initialFormValues)) {
      handleRedirect();
      return;
    }
    const path = {
      user_id,
      id: Number(memento?.id),
    };
    const body: any = prepareMementoPayload(form);
    await updateMutation.mutateAsync(
      {
        body,
        path,
        bodySerializer: formDataBodySerializer.bodySerializer,
      },
      {
        onSuccess: async () => {
          // Invalidate cached GET mementos before redirecting
          await queryClient.invalidateQueries({
            queryKey: getUsersMementosApiUserUserIdMementoGetQueryKey({
              path: { user_id: user_id },
            }),
          });
          handleRedirect();
        },
        onError: (error: any) => console.log("Failed to update memento", error),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      {memento && (
        <MementoForm
          initialValues={initialFormValues}
          submitButtonText="Save Changes"
          isSubmitting={updateMutation.isPending}
          onSubmit={onSubmit}
          FormHeader="Edit Memento"
        />
      )}
    </SafeAreaView>
  );
}
