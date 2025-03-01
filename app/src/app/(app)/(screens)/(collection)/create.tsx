import { useForm, Controller } from "react-hook-form";
import { useSession } from "@/src/context/AuthContext";
import { CollectionInsert } from "@/src/api-client/generated";
import { useMutation } from "@tanstack/react-query";
import { createNewCollectionApiUserUserIdCollectionPostMutation } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { toISODate } from "@/src/libs/date";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View } from "react-native";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import { Heading } from "@/src/components/ui/heading";
import {
  Input,
  InputField,
  InputSlot,
  InputIcon,
} from "@/src/components/ui/input";
import { Textarea, TextareaInput } from "@/src/components/ui/textarea";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, ButtonSpinner, ButtonText } from "@/src/components/ui/button";
import { useState } from "react";
import { CalendarDaysIcon } from "@/src/components/ui/icon";

interface CreateCollectionForm {
  collection: Omit<CollectionInsert, "user_id" | "date"> & { date: Date };
}

export default function CreateCollection() {
  const { session } = useSession();
  const { control, handleSubmit } = useForm<CreateCollectionForm>({
    defaultValues: {
      collection: {
        title: "",
        caption: "",
        date: new Date(),
        location: null,
      },
    },
  });

  const createMutation = useMutation(
    createNewCollectionApiUserUserIdCollectionPostMutation(),
  );

  const onSubmit = async (form: CreateCollectionForm) => {
    if (!session?.user.id) {
      console.error("User is not auth");
    }

    const collection = {
      ...form.collection,
      date: form.collection.date ? toISODate(form.collection.date) : null,
    };

    console.log("collection:", collection);
    const body = {
      new_collection: collection,
      mementos: [],
    };
    console.log("body:", body);

    console.log("Successfully Created Mutation");
    await createMutation.mutateAsync(
      {
        body,
        path: { user_id: session?.user.id ?? "" },
      },
      {
        onSuccess: () => {
          console.log("Successfully Created Mutation");
          router.replace("/(app)/(tabs)/collections");
        },

        onError: (error: any) =>
          console.error("Failed to create new collection", error),
      },
    );
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const handleDatePickerState = () => {
    setShowDatePicker((showState) => {
      return !showState;
    });
  };

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <ScrollView
        className="flex-1 px-5 pt-5"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: 128 }}
      >
        <View className="flex justify-center gap-6">
          <Heading className="block" size="2xl">
            Create Collection
          </Heading>
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Title</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="collection.title"
              control={control}
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <Input>
                  <InputField
                    onChangeText={field.onChange}
                    value={field.value}
                    placeholder="Collection Title"
                  />
                </Input>
              )}
            />
          </FormControl>
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Caption</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="collection.caption"
              control={control}
              render={({ field }) => (
                <Textarea size="md">
                  <TextareaInput
                    onChangeText={field.onChange}
                    value={field.value ?? ""}
                    placeholder="Add a caption"
                  />
                </Textarea>
              )}
            />
          </FormControl>
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Date</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="collection.date"
              control={control}
              render={({ field }) => (
                <>
                  <Input>
                    <InputField
                      value={field.value ? field.value.toDateString() : ""}
                      placeholder="Select a date"
                      editable={false}
                    />
                    <InputSlot onPress={handleDatePickerState}>
                      <InputIcon as={CalendarDaysIcon} />
                    </InputSlot>
                  </Input>
                  {showDatePicker && (
                    <DateTimePicker
                      mode="date"
                      value={field.value ?? new Date()}
                      onChange={(_, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) field.onChange(selectedDate);
                      }}
                    />
                  )}
                </>
              )}
            />
          </FormControl>
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Location</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="collection.location"
              control={control}
              render={({ field }) => (
                <Input>
                  <InputField
                    onChangeText={field.onChange}
                    value={field.value ?? ""}
                    placeholder="Location"
                  />
                </Input>
              )}
            />
          </FormControl>
          <Button
            className="mt-auto"
            size={"lg"}
            onPress={handleSubmit(onSubmit)}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ButtonSpinner />
            ) : (
              <ButtonText>Create Collection</ButtonText>
            )}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
