/**
 * @description Screen shown to a new user on first time sign-up,
 *    to add addiitonal user info needed for sending birthday push notifications.
 * @requirements FR-56
 */

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
import { userInfoApiUserPostMutation } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { router } from "expo-router";
import { toISODateString } from "@/src/libs/date";
import { ArrowRightIcon } from "@/src/components/ui/icon";

interface NewUserInfo {
  birthday: Date;
}

export default function NewUserForm() {
  const { session } = useSession();
  const { control, handleSubmit } = useForm<NewUserInfo>({
    defaultValues: { birthday: new Date() },
  });

  // Delete collection query
  const createUserInfoMutation = useMutation(userInfoApiUserPostMutation());

  const onSubmit = async (form: NewUserInfo) => {
    await createUserInfoMutation.mutateAsync(
      {
        body: {
          id: String(session?.user.id),
          birthday: toISODateString(form.birthday),
        },
      },
      {
        onSuccess: () => router.push("/(app)/(tabs)/collections"),

        onError: (error: any) =>
          console.error("Failed to delete collection", error),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 p-5 justify-center" edges={["bottom"]}>
      <Heading className="block mb-2" size="2xl">
        Welcome to Memento 👋
      </Heading>
      <Text size="lg" className="text-left font-light mb-4">
        We're excited to help you preserve your favorite memories, souvenirs,
        thoughtful cards, and more!
      </Text>
      <Text size="lg" className="text-left font-light mb-4">
        If you'd like reminders to save your cards and other mementos within the
        app, enable push notifications and enter your birthday below!
      </Text>
      <FormControl size={"lg"}>
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
        className="mt-6"
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
