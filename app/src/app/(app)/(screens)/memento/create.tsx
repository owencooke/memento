/**
 * @description Screen for creating a new individual keepsake/memento. Form fields for images/metadata.
 * @requirements FR-9, FR-17, FR-19, FR-20, FR-21
 */

import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import {
  createNewMementoApiUserUserIdMementoPostMutation,
  getUsersMementosApiUserUserIdMementoGetQueryKey,
} from "@/src/api-client/generated/@tanstack/react-query.gen";
import { useSession } from "@/src/context/AuthContext";
import { router } from "expo-router";
import { formDataBodySerializer } from "@/src/api-client/formData";
import { queryClient } from "@/src/app/_layout";
import MementoForm from "@/src/components/forms/MementoForm";
import {
  MementoFormData,
  prepareMementoPayload,
} from "@/src/api-client/memento";

export default function CreateMemento() {
  const { session } = useSession();
  const createMutation = useMutation(
    createNewMementoApiUserUserIdMementoPostMutation(),
  );

  // Call POST Create Memento endpoint with custom serializer for multi-part form data
  const onSubmit = async (form: MementoFormData) => {
    const body: any = prepareMementoPayload(form);
    const path = { user_id: String(session?.user.id) };
    await createMutation.mutateAsync(
      {
        body,
        path,
        bodySerializer: formDataBodySerializer.bodySerializer,
      },
      {
        onSuccess: () => {
          // Invalidate cached GET mementos before redirecting
          queryClient.invalidateQueries({
            queryKey: getUsersMementosApiUserUserIdMementoGetQueryKey({
              path,
            }),
          });
          router.replace("/(app)/(tabs)/mementos");
        },
        onError: (error: any) =>
          console.log("Failed to create new memento", error),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <MementoForm
        submitButtonText="Create Memento"
        isSubmitting={createMutation.isPending}
        onSubmit={onSubmit}
        FormHeader="Create Memento"
      />
    </SafeAreaView>
  );
}
