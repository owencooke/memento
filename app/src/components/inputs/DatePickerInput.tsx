import React, { useState } from "react";
import { CalendarDaysIcon } from "../ui/icon";
import { Input, InputField, InputSlot, InputIcon } from "../ui/input";
import DateTimePicker from "@react-native-community/datetimepicker";
import { toISODateString } from "@/src/libs/date";
import { Box } from "../ui/box";
import { Pressable } from "react-native";

interface DatePickerInputProps {
  value: Date | null;
  onChange?: (value: Date) => void;
}

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
      {showDatePicker && (
        <DateTimePicker
          mode="date"
          value={value ?? new Date()}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) onChange(date);
          }}
        />
      )}
    </>
  );
};

export default DatePickerInput;
