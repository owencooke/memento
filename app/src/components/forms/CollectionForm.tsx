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
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { aggregateMetadata } from "@/src/libs/metadata";
import AutofillFieldsModal from "../modals/AutofillFieldsModal";

/**
 * Form values for the CreateCollection screen
 */
export interface CollectionFormData {
  title: string;
  date: Date | null;
  location: GeoLocation;
  caption: string;
  mementoIds: number[];
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
    mementoIds: [],
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

  const [showModal, setShowModal] = useState(false);
  const [derivedMetadata, setDerivedMetadata] = useState<{
    date: Date | null;
    location: GeoLocation | null;
  }>({ date: null, location: null });

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
    const ids = selectedMementoIds.join(",");
    router.push(`/(app)/(screens)/collection/select_mementos?ids=${ids}`);
  };

  // Receive selected mementos from select_mementos page
  const params = useLocalSearchParams();

  // Array of memento IDs selected by the user
  const selectedMementoIds = useMemo(() => {
    if (!params.ids) return [];
    return Array.isArray(params.ids)
      ? params.ids.map(Number)
      : params.ids.split(",").map(Number);
  }, [params.ids]);

  useEffect(() => {
    const selectedMementos = mementos?.filter((memento) =>
      selectedMementoIds.includes(memento.id),
    );

    if (selectedMementos && selectedMementos.length > 0) {
      setDerivedMetadata({ date: null, location: null });
      aggregateMetadata(selectedMementos).then(({ date, location }) => {
        if (date || location) {
          setDerivedMetadata({ date, location });
          setShowModal(true);
        }
      });
    } else {
      setDerivedMetadata({ date: null, location: null });
    }
    setValue("mementoIds", selectedMementoIds);
  }, [selectedMementoIds, mementos, setValue]);

  const handleAccept = ({
    location,
    date,
  }: {
    location: boolean;
    date: boolean;
  }) => {
    if (location && derivedMetadata.location) {
      setValue("location", derivedMetadata.location);
    }
    if (date && derivedMetadata.date) {
      setValue("date", derivedMetadata.date);
    }
    setShowModal(false);
  };

  return (
    <>
      {showModal && derivedMetadata && (
        <AutofillFieldsModal
          location={derivedMetadata.location?.text || "Unknown"}
          date={derivedMetadata.date || new Date()}
          accept={handleAccept}
          reject={() => {
            setShowModal(false);
          }}
        />
      )}
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
              <Controller
                control={control}
                name="mementoIds"
                defaultValue={selectedMementoIds}
                render={({ field: { value } }) => (
                  <>
                    {value.length > 0 && (
                      <View className="flex-1 bg-background-100 py-4">
                        <ScrollView
                          horizontal={true}
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{
                            gap: 12,
                            flexDirection: "row",
                          }}
                        >
                          {value?.map((id) => {
                            const memento = mementos?.find((m) => m.id === id);
                            return memento ? (
                              <View key={id}>
                                <MementoCard {...memento} />
                                <Fab
                                  size="lg"
                                  onPress={() => {
                                    const updatedIds = value.filter(
                                      (value) => value !== id,
                                    );
                                    setValue("mementoIds", updatedIds);
                                    router.setParams({
                                      ids: updatedIds.length
                                        ? updatedIds.join(",")
                                        : "",
                                    });
                                  }}
                                >
                                  <FabIcon as={TrashIcon} />
                                </Fab>
                              </View>
                            ) : (
                              <View className="flex-1" />
                            );
                          })}
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
                  </>
                )}
              />
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
    </>
  );
}
