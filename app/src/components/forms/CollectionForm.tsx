import { useForm, Controller } from "react-hook-form";
import { ScrollView, View } from "react-native";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import { Heading } from "@/src/components/ui/heading";
import { Input, InputField } from "@/src/components/ui/input";
import { Textarea, TextareaInput } from "@/src/components/ui/textarea";
import { Button, ButtonSpinner, ButtonText } from "@/src/components/ui/button";
import { useCallback } from "react";
import { AlertCircleIcon, TrashIcon } from "@/src/components/ui/icon";
import LocationInput, {
  GeoLocation,
} from "@/src/components/inputs/LocationInput";
import { FlatList } from "react-native";
import DatePickerInput from "@/src/components/inputs/DatePickerInput";
import MementoCard from "../cards/MementoCard";
import { Fab, FabIcon } from "../ui/fab";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getUsersMementosApiUserUserIdMementoGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { useSession } from "@/src/context/AuthContext";

/**
 * Form values for the CreateCollection screen
 */
export interface CollectionFormData {
  title: string;
  date: Date | null;
  location: GeoLocation;
  caption: string;
}

export interface CollectionFormProps {
  initialValues?: CollectionFormData;
  title: string;
  submitButtonText: string;
  isSubmitting: boolean;
  onSubmit: (data: CollectionFormData) => Promise<void>;
}

export default function CollectionForm({
  initialValues,
  title,
  submitButtonText,
  isSubmitting,
  onSubmit,
}: CollectionFormProps) {
  const defaultValues: CollectionFormData = {
    title: "",
    caption: "",
    date: null,
    location: { text: "" },
  };

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CollectionFormData>({
    defaultValues: initialValues || defaultValues,
  });

  const { session } = useSession();

  // Prevent re-rendering location input when Geolocation changes
  const locationValue = watch("location");
  /**
   * Updates the location input when GeoLocation changes
   *
   * @param {GeoLocation} location - new location value
   */
  const handleLocationChange = useCallback(
    (location: GeoLocation) => {
      const hasChanged =
        locationValue.text !== location.text ||
        locationValue.lat !== location.lat ||
        locationValue.long !== location.long;

      if (hasChanged) {
        setValue("location", location);
      }
    },
    [locationValue, setValue],
  );

  const { data: mementos } = useQuery({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
    refetchOnMount: false,
  });

  const handleAddMementosPress = () => {
    router.push(`/(app)/(screens)/(collection)/select_mementos?ids=${ids}`);
  };

  const handleRemoveSelection = (id: number) => {
    const updatedIds = ids.filter((_id) => _id !== id);

    router.setParams({
      ids: updatedIds.length ? updatedIds.join(",") : "",
    });
  };

  // Receive selected mementos from select_mementos page
  const params = useLocalSearchParams();

  // Array of memento IDs selected by the user
  const ids: Number[] = !params.ids
    ? []
    : Array.isArray(params.ids)
      ? params.ids.map(Number)
      : params.ids.split(",").map(Number);

  // Filter for mementos selected by the user
  const mementos_filtered = mementos?.filter((memento) =>
    ids.includes(memento.id),
  );

  // For odd number of mementos, add a spacer for last grid element
  const gridData =
    mementos_filtered?.length && mementos_filtered.length % 2
      ? [...mementos_filtered, { spacer: true }]
      : mementos_filtered;

  return (
    <FlatList
      data={[]}
      renderItem={() => <></>}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View className="flex justify-center gap-6 pb-32">
          <Heading className="block" size="2xl">
            {title}
          </Heading>
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
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Date</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePickerInput
                  value={field.value}
                  onChange={(date) => field.onChange(date)}
                />
              )}
            />
          </FormControl>
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Location</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <LocationInput
                  onChange={handleLocationChange}
                  value={field.value}
                />
              )}
            />
          </FormControl>
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Mementos</FormControlLabelText>
            </FormControlLabel>
            {ids.length > 0 && (
              <View className="flex-1 bg-background-100 py-4">
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, flexDirection: "row" }}
                >
                  {gridData?.map((item, index) =>
                    "spacer" in item ? (
                      <View key={index} className="flex-1" />
                    ) : (
                      <View key={index}>
                        <MementoCard key={index} {...item} />
                        <Fab
                          size="lg"
                          onPress={() => handleRemoveSelection(item.id)}
                        >
                          <FabIcon as={TrashIcon} />
                        </Fab>
                      </View>
                    ),
                  )}
                </ScrollView>
              </View>
            )}
            <Button
              className="mt-auto"
              action="secondary"
              size={"lg"}
              onPress={handleAddMementosPress}
            >
              <ButtonText>Select Mementos</ButtonText>
            </Button>
          </FormControl>
          <Button
            className="mt-auto"
            size={"lg"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ButtonSpinner />
            ) : (
              <ButtonText>{submitButtonText}</ButtonText>
            )}
          </Button>
        </View>
      }
    />
  );
}
