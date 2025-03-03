import { useForm, Controller } from "react-hook-form";
import { useSession } from "@/src/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import {
  createNewCollectionApiUserUserIdCollectionPostMutation,
  getUsersCollectionsApiUserUserIdCollectionGetQueryKey,
} from "@/src/api-client/generated/@tanstack/react-query.gen";
import { toISODateString } from "@/src/libs/date";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View } from "react-native";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import { formDataBodySerializer } from "@/src/api-client/formData";
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
import { useCallback, useState } from "react";
import { AlertCircleIcon, CalendarDaysIcon } from "@/src/components/ui/icon";
import LocationInput, {
  GeoLocation,
} from "@/src/components/inputs/LocationInput";
import { FlatList } from "react-native";
import { queryClient } from "@/src/app/_layout";

interface CreateCollectionForm {
  collection: {
    title: string;
    date: Date | null;
    location: GeoLocation;
    caption: string;
  };
}

export default function CreateCollection() {
  const { session } = useSession();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm<CreateCollectionForm>({
    defaultValues: {
      collection: {
        title: "",
        caption: "",
        date: null,
        location: { text: "" },
      },
    },
  });

  const createMutation = useMutation(
    createNewCollectionApiUserUserIdCollectionPostMutation(),
  );

  const onSubmit = async (form: CreateCollectionForm) => {
    const {
      location: { lat, long, text },
      date,
      ...restCollection
    } = form.collection;
    const collection = {
      ...restCollection,
      date: date ? toISODateString(date) : null,
      location: text ? text : null,
      coordinates: lat && long ? { lat, long } : null,
    };

    console.log(collection);

    const path = { user_id: session?.user.id ?? "" };

    await createMutation.mutateAsync(
      {
        body: {
          new_collection: collection,
          mementos: [],
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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const handleDatePickerState = () => {
    setShowDatePicker((showState) => {
      return !showState;
    });
  };

  // Prevent re-rendering location input when Geolocation changes
  const locationValue = watch("collection.location");
  const handleLocationChange = useCallback(
    (location: GeoLocation) => {
      const hasChanged =
        locationValue.text !== location.text ||
        locationValue.lat !== location.lat ||
        locationValue.long !== location.long;

      if (hasChanged) {
        setValue("collection.location", location);
      }
    },
    [locationValue, setValue],
  );

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <FlatList
        data={[]}
        renderItem={() => <></>}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View className="flex justify-center gap-6">
            <Heading className="block" size="2xl">
              Create Collection
            </Heading>
            <FormControl size={"lg"} isInvalid={!!errors.collection?.title}>
              <FormControlLabel>
                <FormControlLabelText>Title</FormControlLabelText>
              </FormControlLabel>
              <Controller
                name="collection.title"
                control={control}
                render={({ field }) => (
                  <Input>
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
                <FormControlErrorText>
                  {errors.collection?.title?.message}
                </FormControlErrorText>
              </FormControlError>
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
                  <LocationInput
                    onChange={handleLocationChange}
                    value={field.value}
                  />
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
        }
      />
    </SafeAreaView>
  );
}
