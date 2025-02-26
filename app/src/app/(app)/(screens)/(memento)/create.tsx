import React from "react";
import { Button, ButtonText, ButtonIcon } from "@/src/components/ui/button";

import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import { Input, InputField } from "@/src/components/ui/input";
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

export default function CreateMemento() {
  const insets = useSafeAreaInsets();

  const createMutation = useMutation(
    createMementoRouteApiMementoPostMutation(),
  );

  const handleAddMemento = () => {};

  return (
    <SafeAreaView
      // Note: flex-1 is equivalent to h-full for the safe view area
      className={`flex-1 px-5 pt-5`}
      edges={["bottom"]}
    >
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
            <PhotoSelectGrid />
          </FormControl>
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Caption</FormControlLabelText>
            </FormControlLabel>
            <Textarea size="md">
              <TextareaInput placeholder="ex: an ancient seashell found in Hawaii" />
            </Textarea>
          </FormControl>
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Date</FormControlLabelText>
            </FormControlLabel>
            <DateTimePicker mode="date" value={new Date()} />
          </FormControl>
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>Location</FormControlLabelText>
            </FormControlLabel>
            <Input>
              <InputField placeholder="N/A" />
            </Input>
          </FormControl>
          <Button className="mt-auto" size={"lg"}>
            <ButtonText>Create Memento</ButtonText>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
