import { useForm, Controller } from "react-hook-form";
import { useSession } from "@/src/context/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createNewCollectionApiUserUserIdCollectionPostMutation,
  getUsersCollectionsApiUserUserIdCollectionGetQueryKey,
  getUsersMementosApiUserUserIdMementoGetOptions,
} from "@/src/api-client/generated/@tanstack/react-query.gen";
import { toISODateString } from "@/src/libs/date";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
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
import { queryClient } from "@/src/app/_layout";
import DatePickerInput from "@/src/components/inputs/DatePickerInput";
import { useLocalSearchParams } from "expo-router";
import MementoCard from "@/src/components/cards/MementoCard";
import { ScrollView } from "react-native-gesture-handler";
import { Fab, FabIcon } from "@/src/components/ui/fab";

/**
 * Form values for the CreateCollection screen
 */
interface CreateCollectionForm {
  title: string;
  date: Date | null;
  location: GeoLocation;
  caption: string;
  mementos: string;
}

/**
 * @description Screen for creating a new collection
 *
 * @requirements FR-35, FR-36, FR-37, FR-41
 *
 * @component
 * @returns {JSX.Element} Rendered CreateCollection screen.
 */
export default function CreateCollection() {
  const { session } = useSession();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCollectionForm>({
    defaultValues: {
      title: "",
      caption: "",
      date: null,
      location: { text: "" },
    },
  });

  const createMutation = useMutation(
    createNewCollectionApiUserUserIdCollectionPostMutation(),
  );

  const { data: mementos } = useQuery({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
  });

  const params = useLocalSearchParams();
  console.log("Received params:", params);

  const ids: Number[] = !params.ids
    ? []
    : Array.isArray(params.ids)
    ? params.ids.map(Number)
    : params.ids.split(",").map(Number);
  
  console.log("ids:", ids);

  // Filter for mementos selected by the user
  const mementos_filtered = mementos?.filter(memento => ids.includes(memento.id));

  // For odd number of mementos, add a spacer for last grid element
  const gridData = mementos_filtered?.length && mementos_filtered.length % 2
    ? [...mementos_filtered, { spacer: true }]
    : mementos_filtered;

  /**
   * Handles form submission by creating a new collection.
   *
   *
   * @param {CreateCollectionForm} form - Form containing collection detals
   */
  const onSubmit = async (form: CreateCollectionForm) => {
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
          mementos: ids,
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

  const handleAddMementosPress = () => {
    router.push("/(app)/(screens)/(select_mementos)/select_mementos");
  };
  
  const handleRemoveSelection = (id: number) => {
    console.log("Delete", id);
    const updatedIds = ids.filter(_id => _id !== id);

    router.setParams({
      ids: updatedIds.length ? updatedIds.join(",") : "",
    });

    console.log(ids);    
  };

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
              {ids.length > 0 &&
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
                          <Fab size="lg" onPress={() => handleRemoveSelection(item.id)}>
                            <FabIcon as={TrashIcon} />
                          </Fab>
                        </View>
                      )
                    )}
                  </ScrollView>
                </View>
              }
              <Controller
                name="mementos"
                control={control}
                render={({ field }) => (
                  <Button
                    className="mt-auto"
                    size={"lg"}
                    onPress={handleAddMementosPress}
                  >
                    <ButtonText>Select Mementos</ButtonText>
                  </Button>
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
