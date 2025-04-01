import { SafeAreaView } from "react-native-safe-area-context";
import {
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
} from "@/src/components/ui/button";
import { Heading } from "@/src/components/ui/heading";
import { Text } from "@/src/components/ui/text";
import { useSession } from "@/src/context/AuthContext";
import { Controller, useForm } from "react-hook-form";
import DatePickerInput from "@/src/components/inputs/DatePickerInput";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import { useMutation } from "@tanstack/react-query";
import { postUserInfoApiUserPostMutation } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { router } from "expo-router";
import { toISODateString } from "@/src/libs/date";
import { ArrowRightIcon } from "@/src/components/ui/icon";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { MementoLogo } from "@/src/components/MementoLogo";

interface NewUserInfoForm {
  birthday: Date;
}

Notifications.requestPermissionsAsync();

export default function NewUserForm() {
  const { session } = useSession();
  const { control, handleSubmit } = useForm<NewUserInfoForm>({
    defaultValues: { birthday: new Date() },
  });

  const createUserInfoMutation = useMutation(postUserInfoApiUserPostMutation());

  const onSubmit = async (form: NewUserInfoForm) => {
    await createUserInfoMutation.mutateAsync(
      {
        body: {
          id: String(session?.user.id),
          birthday: toISODateString(form.birthday),
        },
      },
      {
        onSuccess: async () => {
          await AsyncStorage.setItem("isNewUser", JSON.stringify(false));
          router.push("/(app)/(tabs)/mementos");
        },
        onError: (error: any) =>
          console.error("Failed to create new user info", error),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 p-6 justify-center" edges={["bottom"]}>
      <View className="flex items-center gap-2 mb-4">
        <MementoLogo size="xl" />
        <Heading className="block text-primary-500" size="2xl">
          Welcome to Memento 👋
        </Heading>
      </View>

      <Text size="lg" className="text-left font-light mb-6">
        We're excited to help you preserve your favorite memories, souvenirs,
        thoughtful cards, and more!
      </Text>
      <Text size="lg" className="text-left font-light mb-8">
        If you'd like reminders to save your mementos within the app, enable
        push notifications and enter your birthday below!
      </Text>

      <FormControl size={"lg"} className="mb-6">
        <FormControlLabel>
          <FormControlLabelText>Your Birthday 🎂</FormControlLabelText>
        </FormControlLabel>
        <Controller
          name="birthday"
          control={control}
          render={({ field }) => (
            <DatePickerInput
              value={field.value}
              onChange={(date) => field.onChange(date)}
            />
          )}
        />
      </FormControl>

      <Button
        className="mt-8"
        size="lg"
        onPress={handleSubmit(onSubmit)}
        disabled={createUserInfoMutation.isPending}
      >
        {createUserInfoMutation.isPending ? (
          <ButtonSpinner />
        ) : (
          <>
            <ButtonText>Continue</ButtonText>
            <ButtonIcon as={ArrowRightIcon} className="ml-2" />
          </>
        )}
      </Button>
    </SafeAreaView>
  );
}
