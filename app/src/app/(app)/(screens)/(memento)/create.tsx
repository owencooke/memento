import { useForm, Controller } from "react-hook-form";
import { Button, ButtonText, ButtonIcon } from "@/src/components/ui/button";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import { Heading } from "@/src/components/ui/heading";
import { ScrollView, View } from "react-native";
import { Textarea, TextareaInput } from "@/src/components/ui/textarea";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { PlayIcon } from "@/src/components/ui/icon";
import PhotoSelectGrid from "@/src/components/PhotoSelectGrid";
import { useMutation } from "@tanstack/react-query";
import { createMementoRouteApiMementoPostMutation } from "@/src/api-client/generated/@tanstack/react-query.gen";
import {
  BodyCreateMementoRouteApiMementoPost,
  MementoInsert,
} from "@/src/api-client/generated/types.gen";
import { useSession } from "@/src/context/AuthContext";
import { router } from "expo-router";
import { toISODate } from "@/src/libs/utils/date";
import { Photo } from "@/src/hooks/usePhotos";
import { uriToBlob } from "@/src/libs/utils/file";
import { createMementoRouteApiMementoPost } from "@/src/api-client/generated";
import { formDataBodySerializer } from "@/src/api-client/files";

interface CreateMementoForm {
  memento: MementoInsert;
  photos: Photo[];
}

export default function CreateMemento() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const { control, handleSubmit, setValue } = useForm<CreateMementoForm>({
    defaultValues: {
      memento: {
        caption: "",
        date: "",
        user_id: session?.user.id,
      },
      photos: [],
    },
  });

  const createMutation = useMutation(
    createMementoRouteApiMementoPostMutation(),
  );

  const onSubmit = async (form: CreateMementoForm) => {
    // const body = new FormData();

    // // Add memento data
    // body.append(
    //   "memento",
    //   JSON.stringify({
    //     ...form.memento,
    //     date: form.memento.date ? toISODate(form.memento.date) : null,
    //   }),
    // );

    // // Add metadata for each image
    // body.append(
    //   "imageMetadata",
    //   JSON.stringify(
    //     form.photos.map((photo) => {
    //       const { exif, fileName } = photo;
    //       return {
    //         date: toISODate(
    //           exif?.DateTimeOriginal ||
    //             exif?.DateTimeDigitized ||
    //             exif?.DateTime,
    //         ),
    //         filename: fileName,
    //       };
    //     }),
    //   ),
    // );

    // // Add binary blob of each image
    // await Promise.all(
    //   form.photos.map(async (photo) => {
    //     const { uri, fileName } = photo;
    //     const imageBlob = await uriToBlob(uri);
    //     body.append("images", imageBlob, fileName || undefined);
    //   }),
    // );

    const body = {
      // Add memento data
      memento: {
        ...form.memento,
        date: form.memento.date ? toISODate(form.memento.date) : null,
      },
      // Add metadata for each image
      imageMetadata: form.photos.map((photo) => {
        const { exif, fileName } = photo;
        return {
          date: toISODate(
            exif?.DateTimeOriginal || exif?.DateTimeDigitized || exif?.DateTime,
          ),
          filename: fileName ?? "",
        };
      }),
      // Add each image's binary blob
      images: await Promise.all(
        form.photos.map(async (photo) => await uriToBlob(photo.uri)),
      ),
    };

    console.log({ body });

    // await createMutation.mutateAsync(
    //   {
    //     body: body,
    //     bodySerializer: formDataBodySerializer.bodySerializer,
    //     headers: { "Content-Type": "multipart/form-data" },
    //   },
    //   //   body as any,
    //   //   { body: body as any },
    //   {
    //     onSuccess: () => router.replace("/(app)/(tabs)/mementos"),
    //     onError: (error: any) =>
    //       console.error("Failed to create new memento", error),
    //   },
    // );
    const { data } = await createMementoRouteApiMementoPost({
      // Pass formData directly as the body
      body,
      bodySerializer: formDataBodySerializer.bodySerializer,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Handle success manually
    if (data) {
      router.replace("/(app)/(tabs)/mementos");
    }
  };

  return (
    <SafeAreaView className={`flex-1 px-5 pt-5`} edges={["bottom"]}>
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View
          className="flex justify-center gap-6"
          style={{ paddingBottom: insets.bottom + 32 }}
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
            <PhotoSelectGrid
              onChange={(photos) => setValue("photos", photos)}
            />
          </FormControl>
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Caption</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="memento.caption"
              control={control}
              render={({ field }) => (
                <Textarea {...field} size="md">
                  <TextareaInput placeholder="ex: an ancient seashell found in Hawaii" />
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
                  value={field.value ? new Date(field.value) : new Date()}
                  onChange={(_, date) => field.onChange(date)}
                />
              )}
            />
          </FormControl>
          {/* TODO: figure out how to pass location */}
          {/* <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Location</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name=""
              control={control}
              render={({ field }) => (
                <Input>
                  <InputField placeholder="N/A" {...field} />
                </Input>
              )}
            />
          </FormControl> */}
          <Button
            className="mt-auto"
            size={"lg"}
            onPress={handleSubmit(onSubmit)}
            disabled={createMutation.isPending}
          >
            <ButtonText>Create Memento</ButtonText>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
