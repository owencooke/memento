import { useForm, Controller } from "react-hook-form";
import { Button, ButtonText, ButtonSpinner } from "@/src/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import { Heading } from "@/src/components/ui/heading";
import { View } from "react-native";
import { Textarea, TextareaInput } from "@/src/components/ui/textarea";
import { AlertCircleIcon } from "@/src/components/ui/icon";
import PhotoSelectGrid from "@/src/components/inputs/PhotoSelectGrid";
import { FlatList } from "react-native";
import { useCallback, useState } from "react";
import { Photo } from "@/src/hooks/usePhotos";
import DatePickerInput from "@/src/components/inputs/DatePickerInput";
import LocationInput, {
  GeoLocation,
} from "@/src/components/inputs/LocationInput";
import { aggregateMetadata } from "@/src/libs/metadata";

export interface MementoFormData {
  memento: { date: Date | null; location: GeoLocation; caption: string };
  photos: Photo[];
}

export interface MementoFormProps {
  initialValues?: MementoFormData;
  title: string;
  submitButtonText: string;
  isSubmitting: boolean;
  onSubmit: (data: MementoFormData) => Promise<void>;
}

export default function MementoForm({
  initialValues,
  title,
  submitButtonText,
  isSubmitting,
  onSubmit,
}: MementoFormProps) {
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const defaultValues: MementoFormData = {
    memento: {
      caption: "",
      date: null,
      location: { text: "" },
    },
    photos: [],
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm<MementoFormData>({
    defaultValues: initialValues || defaultValues,
  });

  // When more photos added, populate date/location fields from image data
  const handlePhotosChanged = async (photos: Photo[]) => {
    if (photos.length > getValues("photos").length) {
      const { date, location } = await aggregateMetadata(photos);
      date && setValue("memento.date", date);
      location && setValue("memento.location", location);
      clearErrors("photos");
    }
    setValue("photos", photos);
  };

  // Prevent re-rendering location input when Geolocation changes
  const locationValue = watch("memento.location");
  const handleLocationChange = useCallback(
    (location: GeoLocation) => {
      const hasChanged =
        locationValue.text !== location.text ||
        locationValue.lat !== location.lat ||
        locationValue.long !== location.long;

      if (hasChanged) {
        setValue("memento.location", location);
      }
    },
    [locationValue, setValue],
  );

  return (
    <FlatList
      data={[]}
      scrollEnabled={scrollEnabled}
      renderItem={() => <></>}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View className="flex justify-center gap-6 pb-32">
          <Heading className="block" size="2xl">
            {title}
          </Heading>
          <FormControl size={"lg"} isInvalid={!!errors.photos}>
            <FormControlLabel>
              <FormControlLabelText>Add Photos</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="photos"
              control={control}
              render={() => (
                <PhotoSelectGrid
                  initialPhotos={getValues("photos")}
                  onChange={handlePhotosChanged}
                  setScrollEnabled={setScrollEnabled}
                />
              )}
              rules={{
                validate: {
                  required: (value) => {
                    return (
                      (value && value.length > 0) ||
                      "Please add at least one photo"
                    );
                  },
                },
              }}
            />
            <FormControlHelper>
              <FormControlHelperText>
                Drag to rearrange photos.
              </FormControlHelperText>
            </FormControlHelper>
            <FormControlError className="mt-4">
              <FormControlErrorIcon as={AlertCircleIcon} />
              <FormControlErrorText>
                {errors?.photos?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Caption</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="memento.caption"
              control={control}
              render={({ field }) => (
                <Textarea size="md" className="bg-background-0">
                  <TextareaInput
                    onChangeText={(text) => field.onChange(text)}
                    value={field.value}
                    placeholder="Ex: an ancient seashell found in Hawaii"
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
              name="memento.date"
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
              name="memento.location"
              control={control}
              render={({ field }) => (
                <LocationInput
                  value={field.value}
                  onChange={handleLocationChange}
                />
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
  );
}
