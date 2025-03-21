/**
 * @description Modal for allowing user to create a new collection after bulk create success.
 * @requirements FR-24
 */

import React from "react";
import { ButtonText, Button } from "../ui/button";
import { Heading } from "../ui/heading";
import {
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Modal,
} from "../ui/modal";
import { queryClient } from "@/src/app/_layout";
import { useSession } from "@/src/context/AuthContext";
import {
  createNewCollectionApiUserUserIdCollectionPostMutation,
  getUsersCollectionsApiUserUserIdCollectionGetQueryKey,
  getUsersMementosApiUserUserIdMementoGetQueryKey,
} from "@/src/api-client/generated/@tanstack/react-query.gen";
import { router } from "expo-router";
import { Text } from "../ui/text";
import { Controller, useForm } from "react-hook-form";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
} from "../ui/form-control";
import { AlertCircleIcon } from "../ui/icon";
import { Input, InputField } from "../ui/input";
import { Textarea, TextareaInput } from "../ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { View } from "react-native";

interface CreateCollectionForm {
  title: string;
  caption: string;
}

interface BulkCreateCollectionModalProps {
  newMementoIds: number[];
}

export default function BulkCreateCollectionModal({
  newMementoIds,
}: BulkCreateCollectionModalProps) {
  const { session } = useSession();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCollectionForm>({
    defaultValues: {
      title: "",
      caption: "",
    },
  });

  const createMutation = useMutation(
    createNewCollectionApiUserUserIdCollectionPostMutation(),
  );

  const onSubmit = async (formData: CreateCollectionForm) => {
    const path = { user_id: session?.user.id ?? "" };
    await createMutation.mutateAsync(
      {
        body: {
          new_collection: { ...formData },
          mementos: newMementoIds,
        },
        path,
      },
      {
        onSuccess: (collection) => {
          queryClient.invalidateQueries({
            queryKey: getUsersCollectionsApiUserUserIdCollectionGetQueryKey({
              path,
            }),
          });
          handleCloseModal(`/(app)/(screens)/collection/${collection.id}`);
        },
        onError: (error: any) =>
          console.error("Failed to create new collection", error),
      },
    );
  };

  const handleCloseModal = (redirect: any) => {
    // After all mementos created successfully
    queryClient.invalidateQueries({
      queryKey: getUsersMementosApiUserUserIdMementoGetQueryKey({
        path: { user_id: String(session?.user.id) },
      }),
    });
    router.replace(redirect);
  };

  return (
    // Modal will be unrendered after accept/reject
    <Modal isOpen={true}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Add to a collection?</Heading>
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody>
          <View className="flex justify-center gap-6">
            <Text className="text-left font-light">
              Your new mementos have been created! Do you also want to add them
              to a new collection?
            </Text>
            <FormControl size={"lg"} isInvalid={!!errors?.title}>
              <FormControlLabel>
                <FormControlLabelText>Title</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input className="bg-background-0">
                    <InputField
                      onChangeText={field.onChange}
                      value={field.value}
                      placeholder="Collection Title"
                    />
                  </Input>
                )}
                rules={{
                  validate: {
                    required: (value) => {
                      return (value && value.length > 0) || "Title is required";
                    },
                  },
                }}
              />
              <FormControlError className="mt-4">
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText className="flex-1">
                  {errors?.title?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl size={"lg"}>
              <FormControlLabel>
                <FormControlLabelText>Caption</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="caption"
                control={control}
                render={({ field }) => (
                  <Textarea className="bg-background-0" size="md">
                    <TextareaInput
                      onChangeText={field.onChange}
                      value={field.value ?? ""}
                      placeholder="Add a caption"
                    />
                  </Textarea>
                )}
              />
            </FormControl>
          </View>
        </ModalBody>
        <ModalFooter>
          <Button
            action="secondary"
            onPress={() => handleCloseModal("/(app)/(tabs)/mementos")}
            className="mr-2"
          >
            <ButtonText>No thanks</ButtonText>
          </Button>
          <Button action="primary" onPress={handleSubmit(onSubmit)}>
            <ButtonText>Create Collection</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
