/**
 * @description Screen for creating a new individual keepsake/memento. Form fields for images/metadata.
 * @requirements FR-9, FR-17, FR-19, FR-20, FR-21
 */

import { KeyboardAvoidingView, Platform, View } from "react-native";
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
import { ButtonIcon, Button } from "@/src/components/ui/button";
import { Heading } from "@/src/components/ui/heading";
import { PlayIcon } from "@/src/components/ui/icon";
import {
  MementoFormData,
  prepareCreateMementoPayload,
} from "@/src/api-client/memento";

export default function CreateMemento() {
  const { session } = useSession();
  const createMutation = useMutation(
    createNewMementoApiUserUserIdMementoPostMutation(),
  );

  // Call POST Create Memento endpoint with custom serializer for multi-part form data
  const onSubmit = async (form: MementoFormData) => {
    const body: any = prepareCreateMementoPayload(form);
    const path = { user_id: session?.user.id ?? "" };
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
          console.error("Failed to create new memento", error),
      },
    );
  };

  const handleBulkCreate = () =>
    router.push("/(app)/(screens)/(memento)/create/bulk");

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <MementoForm
          submitButtonText="Create Memento"
          isSubmitting={createMutation.isPending}
          onSubmit={onSubmit}
          FormHeader={
            <View className="flex flex-row justify-between items-center">
              <Heading className="block" size="2xl">
                Create Memento
              </Heading>
              <Button
                size="lg"
                className="p-3.5"
                action="secondary"
                variant="solid"
                onPress={handleBulkCreate}
              >
                <ButtonIcon as={PlayIcon} />
              </Button>
            </View>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
