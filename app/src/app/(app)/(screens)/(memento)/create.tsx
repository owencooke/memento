import React from "react";
import { Button, ButtonText, ButtonIcon } from "@/src/components/ui/button";

import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import { Input, InputField } from "@/src/components/ui/input";
import { Heading } from "@/src/components/ui/heading";
import { View } from "react-native";
import { Textarea, TextareaInput } from "@/src/components/ui/textarea";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlayIcon } from "@/src/components/ui/icon";
export default function CreateMemento() {
  const handleAddMemento = () => {
    // router.push("/")
  };
  return (
    <SafeAreaView className={`w-full h-full flex justify-center gap-4 px-5`}>
      <View className="flex flex-row justify-between items-center">
        <Heading className="block" size="2xl">
          Create Memento
        </Heading>
        <Button size="lg" className="p-3.5" action="secondary" variant="solid">
          <ButtonIcon as={PlayIcon} />
        </Button>
      </View>
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
    </SafeAreaView>
  );
}
