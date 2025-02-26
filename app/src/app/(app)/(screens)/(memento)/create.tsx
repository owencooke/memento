import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Button, ButtonText, ButtonIcon } from "@/src/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import { Heading } from "@/src/components/ui/heading";
import { ScrollView, View } from "react-native";
import { Textarea, TextareaInput } from "@/src/components/ui/textarea";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { PlayIcon } from "@/src/components/ui/icon";
import PhotoSelectGrid from "@/src/components/PhotoSelectGrid";
import { useMutation } from "@tanstack/react-query";
import { createMementoRouteApiMementoPostMutation } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { BodyCreateMementoRouteApiMementoPost } from "@/src/api-client/generated/types.gen";
import { useSession } from "@/src/context/AuthContext";
import { router } from "expo-router";

export default function CreateMemento() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const { control, handleSubmit } =
    useForm<BodyCreateMementoRouteApiMementoPost>({
      defaultValues: {
        memento: {
          caption: "",
          date: "",
          user_id: session?.user.id,
        },
        imageMetadata: [],
        images: [],
      },
    });

  const createMutation = useMutation(
    createMementoRouteApiMementoPostMutation(),
  );

  const onSubmit = (body: BodyCreateMementoRouteApiMementoPost) => {
    createMutation.mutate(
      { body },
      {
        onSuccess: () => router.replace("/(app)/(tabs)/mementos"),
        onError: (error: any) =>
          console.error("Failed to create new memento", error),
      },
    );
  };

  return (
    <SafeAreaView className={`flex-1 px-5 pt-5`} edges={["bottom"]}>
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View
          className="flex justify-center gap-6"
          style={{ paddingBottom: insets.bottom + 32 }}
        >
          <View className="flex flex-row justify-between items-center">
            <Heading className="block" size="2xl">
              Create Memento
            </Heading>
            <Button
              size="lg"
              className="p-3.5"
              action="secondary"
              variant="solid"
            >
              <ButtonIcon as={PlayIcon} />
            </Button>
          </View>
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Add Photos</FormControlLabelText>
            </FormControlLabel>
            <PhotoSelectGrid />
          </FormControl>
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Caption</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="memento.caption"
              control={control}
              render={({ field }) => (
                <Textarea {...field} size="md">
                  <TextareaInput placeholder="ex: an ancient seashell found in Hawaii" />
                </Textarea>
              )}
            />
          </FormControl>
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Date</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="memento.date"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  mode="date"
                  value={field.value ? new Date(field.value) : new Date()}
                  onChange={(_, date) => field.onChange(date)}
                />
              )}
            />
          </FormControl>
          {/* TODO: figure out how to pass location */}
          {/* <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Location</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name=""
              control={control}
              render={({ field }) => (
                <Input>
                  <InputField placeholder="N/A" {...field} />
                </Input>
              )}
            />
          </FormControl> */}
          <Button
            className="mt-auto"
            size={"lg"}
            onPress={handleSubmit(onSubmit)}
          >
            <ButtonText>Create Memento</ButtonText>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
