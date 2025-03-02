import React, { useState } from "react";
import { CalendarDaysIcon } from "../ui/icon";
import { Input, InputField, InputSlot, InputIcon } from "../ui/input";
import DateTimePicker from "@react-native-community/datetimepicker";
import { toISODateString } from "@/src/libs/date";
import { Box } from "../ui/box";
import { Pressable, Platform } from "react-native";

interface DatePickerInputProps {
  value: Date | null;
  onChange?: (value: Date | undefined) => void;
}

/**
 * DateTimePicker renders input field for IOS, but not Android.
 * This component unifies both platforms.
 * Reference: https://github.com/owencooke/memento/issues/285
 */
const DatePickerInput = ({
  value,
  onChange = (_) => {},
}: DatePickerInputProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleToggleModal = () => {
    setShowDatePicker((showState) => !showState);
  };

  return (
    <>
      {Platform.OS === "android" && (
        <Box className="relative w-full">
          <Pressable
            className="inset-0 absolute z-10"
            onPress={handleToggleModal}
          />
          <Input className="bg-background-0">
            <InputField
              value={value ? toISODateString(value) : ""}
              placeholder="Select a date"
              editable={false}
              pointerEvents="none"
            />
            <InputSlot>
              <InputIcon as={CalendarDaysIcon} className="mr-2" />
            </InputSlot>
          </Input>
        </Box>
      )}
      {(Platform.OS === "ios" || showDatePicker) && (
        <DateTimePicker
          mode="date"
          value={value ?? new Date()}
          onChange={(_, date) => {
            setShowDatePicker(false);
            onChange(date);
          }}
          maximumDate={new Date()}
        />
      )}
    </>
  );
};

export default DatePickerInput;
