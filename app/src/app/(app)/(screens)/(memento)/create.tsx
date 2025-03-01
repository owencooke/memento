import { useForm, Controller } from "react-hook-form";
import {
  Button,
  ButtonText,
  ButtonIcon,
  ButtonSpinner,
} from "@/src/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import { Heading } from "@/src/components/ui/heading";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Textarea, TextareaInput } from "@/src/components/ui/textarea";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlayIcon } from "@/src/components/ui/icon";
import PhotoSelectGrid from "@/src/components/PhotoSelectGrid";
import { useMutation } from "@tanstack/react-query";
import { createNewMementoApiUserUserIdMementoPostMutation } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { useSession } from "@/src/context/AuthContext";
import { router } from "expo-router";
import { toISODateString } from "@/src/libs/date";
import { Photo } from "@/src/hooks/usePhotos";
import { formDataBodySerializer } from "@/src/api-client/formData";
import { aggregateMetadata, getRelevantImageMetadata } from "@/src/libs/exif";
import LocationInput, { GeoLocation } from "@/src/components/LocationInput";
import { FlatList } from "react-native";
import { useCallback } from "react";

interface CreateMementoForm {
  memento: { date: Date; location: GeoLocation; caption: string };
  photos: Photo[];
}

export default function CreateMemento() {
  const { session } = useSession();
  const { control, handleSubmit, setValue, watch, getValues } =
    useForm<CreateMementoForm>({
      defaultValues: {
        memento: {
          caption: "",
          date: new Date(),
          location: {
            text: "",
          },
        },
        photos: [],
      },
    });
  const createMutation = useMutation(
    createNewMementoApiUserUserIdMementoPostMutation(),
  );

  // When more photos added, populate date/location fields from image data
  const handlePhotosChanged = async (photos: Photo[]) => {
    if (photos.length > getValues("photos").length) {
      const { date, location } = await aggregateMetadata(photos);
      console.log({ date, location });
      date && setValue("memento.date", date);
      location && setValue("memento.location", location);
    }
    setValue("photos", photos);
  };

  // POST Create Memento form
  const onSubmit = async (form: CreateMementoForm) => {
    const memento = {
      ...form.memento,
      date: form.memento.date ? toISODateString(form.memento.date) : null,
    };

    // Metadata for each image
    const imageMetadata = form.photos.map(getRelevantImageMetadata);
    console.log(imageMetadata);

    // Map each image to its necessary upload info
    const images = form.photos.map((photo) => ({
      uri: photo.uri,
      type: photo.mimeType,
      name: photo.fileName,
    }));

    // Call POST endpoint with custom serializer for multi-part form data
    const body = { memento, imageMetadata, images } as any;
    await createMutation.mutateAsync(
      {
        body,
        bodySerializer: formDataBodySerializer.bodySerializer,
        path: { user_id: session?.user.id ?? "" },
      },
      {
        onSuccess: () => router.replace("/(app)/(tabs)/mementos"),
        onError: (error: any) =>
          console.error("Failed to create new memento", error),
      },
    );
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
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <FlatList
          data={[]}
          renderItem={() => <></>}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View className="flex justify-center gap-6 pb-32">
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
                <PhotoSelectGrid onChange={handlePhotosChanged} />
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
                        placeholder="ex: an ancient seashell found in Hawaii"
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
                    <DateTimePicker
                      mode="date"
                      value={field.value}
                      onChange={(_, date) => field.onChange(date)}
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
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <ButtonSpinner />
                ) : (
                  <ButtonText>Create Memento</ButtonText>
                )}
              </Button>
            </View>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
