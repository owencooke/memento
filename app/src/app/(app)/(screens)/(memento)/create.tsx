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
import { ScrollView, View } from "react-native";
import { Textarea, TextareaInput } from "@/src/components/ui/textarea";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlayIcon } from "@/src/components/ui/icon";
import PhotoSelectGrid from "@/src/components/PhotoSelectGrid";
import { useMutation } from "@tanstack/react-query";
import { createNewMementoApiUserUserIdMementoPostMutation } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { MementoInsert } from "@/src/api-client/generated/types.gen";
import { useSession } from "@/src/context/AuthContext";
import { router } from "expo-router";
import { toISODate } from "@/src/libs/date";
import { Photo } from "@/src/hooks/usePhotos";
import { formDataBodySerializer } from "@/src/api-client/formData";
import { getRelevantExifMetadata } from "@/src/libs/exif";

interface CreateMementoForm {
  memento: Omit<MementoInsert, "user_id" | "date"> & { date: Date };
  photos: Photo[];
}

export default function CreateMemento() {
  const { session } = useSession();
  const { control, handleSubmit, setValue } = useForm<CreateMementoForm>({
    defaultValues: {
      memento: {
        caption: "",
        date: new Date(),
      },
      photos: [],
    },
  });

  const createMutation = useMutation(
    createNewMementoApiUserUserIdMementoPostMutation(),
  );

  const onSubmit = async (form: CreateMementoForm) => {
    // Overall memento data
    const memento = {
      ...form.memento,
      date: form.memento.date ? toISODate(form.memento.date) : null,
    };

    // Metadata for each image
    const imageMetadata = form.photos.map((photo) =>
      getRelevantExifMetadata(photo),
    );

    // Map each image to its necessary upload info
    const images = form.photos.map((photo) => ({
      uri: photo.uri,
      type: photo.mimeType,
      name: photo.fileName,
    }));

    // Call Create API endpoint, with custom serializer for multi-part form data
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

  return (
    <ScrollView
      className="flex-1 px-5 pt-5"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <SafeAreaView
        className="flex justify-center gap-6 pb-16"
        edges={["bottom"]}
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
          <PhotoSelectGrid onChange={(photos) => setValue("photos", photos)} />
        </FormControl>
        <FormControl size={"lg"}>
          <FormControlLabel>
            <FormControlLabelText>Caption</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="memento.caption"
            control={control}
            render={({ field }) => (
              <Textarea size="md">
                <TextareaInput
                  onChangeText={(text) => field.onChange(text)}
                  value={field.value ?? ""}
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
      </SafeAreaView>
    </ScrollView>
  );
}
