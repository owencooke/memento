import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import { Input, InputField } from "@/src/components/ui/input";
import { Heading } from "@/src/components/ui/heading";
import { View } from "react-native";
import { Textarea, TextareaInput } from "@/src/components/ui/textarea";

export default function CreateMemento() {
  const handleAddMemento = () => {
    // router.push("/")
  };
  return (
    <View className={`w-full h-full flex justify-center`}>
      <Heading size="2xl">Create Memento</Heading>
      <FormControl size={"lg"}>
        <FormControlLabel>
          <FormControlLabelText>Caption</FormControlLabelText>
        </FormControlLabel>
        <Textarea size="md">
          <TextareaInput placeholder="Your text goes here..." />
        </Textarea>
      </FormControl>
      <FormControl size={"lg"}>
        <FormControlLabel>
          <FormControlLabelText>Password</FormControlLabelText>
        </FormControlLabel>
        <Input>
          <InputField
            type="password"
            defaultValue="12345"
            placeholder="password"
          />
        </Input>
      </FormControl>
    </View>
  );
}
