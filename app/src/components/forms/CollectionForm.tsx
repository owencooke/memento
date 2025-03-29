import { useForm, Controller } from "react-hook-form";
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircleIcon } from "@/src/components/ui/icon";
import LocationInput, {
  GeoLocation,
} from "@/src/components/inputs/LocationInput";
import { FlatList } from "react-native";
import DatePickerInput from "@/src/components/inputs/DatePickerInput";
import { router, useLocalSearchParams } from "expo-router";
import { aggregateMetadata } from "@/src/libs/metadata";
import AutofillFieldsModal from "../modals/AutofillFieldsModal";
import { useMementos } from "@/src/hooks/useMementos";
import MementoGrid from "../lists/MementoGrid";

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
  // Get local search params for selected mementos from select_mementos page
  const { ids: idsString } = useLocalSearchParams<{ ids: string }>();
  const selectedMementoIds = useMemo(() => {
    if (!idsString) return [];
    return Array.isArray(idsString)
      ? idsString.map(Number)
      : idsString.split(",").map(Number);
  }, [idsString]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CollectionFormData>({
    defaultValues: initialValues || {
      title: "",
      caption: "",
      date: null,
      location: { text: "" },
      mementoIds: [],
    },
  });

  // Prevent re-rendering location input when Geolocation changes
  const { mementos } = useMementos({
    queryOptions: { refetchOnMount: false },
  });

  const [showModal, setShowModal] = useState(false);
  const [derivedMetadata, setDerivedMetadata] = useState<{
    date: Date | null;
    location: GeoLocation | null;
  }>({ date: null, location: null });

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

  // Updates the location input when GeoLocation changes
  const locationValue = watch("location");
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
    router.push(
      `/(app)/(screens)/collection/select_mementos?ids=${selectedMementoIds}`,
    );
  };

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
                      <View className="flex-1 py-4">
                        <MementoGrid
                          numColumns={3}
                          mementos={mementos?.filter((memento) =>
                            value.includes(memento.id),
                          )}
                        />
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
