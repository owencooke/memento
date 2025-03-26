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
import { View } from "react-native";
import { Textarea, TextareaInput } from "@/src/components/ui/textarea";
import { AlertCircleIcon } from "@/src/components/ui/icon";
import PhotoSelectGrid from "@/src/components/inputs/PhotoSelectGrid";
import { FlatList } from "react-native";
import { ReactElement, useCallback, useState } from "react";
import { Photo } from "@/src/libs/photos";
import DatePickerInput from "@/src/components/inputs/DatePickerInput";
import LocationInput, {
  GeoLocation,
} from "@/src/components/inputs/LocationInput";
import { aggregateMetadata } from "@/src/libs/metadata";
import { Heading } from "../ui/heading";
import { MementoFormData } from "@/src/api-client/memento";

export const defaultMementoFormValues: MementoFormData = {
  memento: {
    caption: "",
    date: null,
    location: { text: "" },
  },
  photos: [],
};

export interface MementoFormProps {
  initialValues?: MementoFormData;
  submitButtonText: string;
  isSubmitting: boolean;
  photosEditable?: boolean;
  onSubmit: (data: MementoFormData) => Promise<void>;
  FormHeader?: ReactElement | string;
}

export default function MementoForm({
  initialValues,
  submitButtonText,
  isSubmitting,
  onSubmit,
  FormHeader,
  photosEditable = true,
}: MementoFormProps) {
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm<MementoFormData>({
    defaultValues: initialValues || defaultMementoFormValues,
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
          {typeof FormHeader === "string" ? (
            <Heading className="block" size="2xl">
              {FormHeader}
            </Heading>
          ) : (
            FormHeader
          )}
          <FormControl size={"lg"} isInvalid={!!errors.photos}>
            <FormControlLabel>
              <FormControlLabelText>
                {photosEditable && "Add"} Photos
              </FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="photos"
              control={control}
              render={() => (
                <PhotoSelectGrid
                  initialPhotos={getValues("photos")}
                  editable={photosEditable}
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
            {photosEditable && (
              <>
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
              </>
            )}
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
