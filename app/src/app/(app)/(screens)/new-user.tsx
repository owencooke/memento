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
import { View } from "react-native";
import { Image } from "@/src/components/ui/image";

interface NewUserInfo {
  birthday: Date;
}

export default function NewUserForm() {
  const { session } = useSession();
  const { control, handleSubmit } = useForm<NewUserInfo>({
    defaultValues: { birthday: new Date() },
  });

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
    <SafeAreaView className="flex-1 p-6 justify-center" edges={["bottom"]}>
      <View className="flex items-center gap-2 mb-4">
        <Image
          size="lg"
          // TODO: replace with our logo!
          source={require("@/src/assets/images/react-logo.png")}
          alt="Memento Logo"
        />
        <Heading className="block" size="2xl">
          Welcome to Memento 👋
        </Heading>
      </View>

      <Text size="lg" className="text-left font-light mb-6">
        We're excited to help you preserve your favorite memories, souvenirs,
        thoughtful cards, and more!
      </Text>
      <Text size="lg" className="text-left font-light mb-8">
        If you'd like reminders to save your cards and other mementos within the
        app, enable push notifications and enter your birthday below!
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
