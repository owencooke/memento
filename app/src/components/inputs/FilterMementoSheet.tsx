import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  ActionsheetFlatList,
} from "../ui/actionsheet";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import DatePickerInput from "@/src/components/inputs/DatePickerInput";
import { useForm, Controller } from "react-hook-form";
import { Box } from "../ui/box";
import { Button, ButtonGroup, ButtonText } from "../ui/button";
import { AlertCircleIcon } from "../ui/icon";
import LocationInput, { BoundingBoxLocation } from "./LocationInput";
import { useCallback } from "react";

export interface FilterMementoFormData {
  start_date: Date | null;
  end_date: Date | null;
  location: BoundingBoxLocation;
}

interface FilterMementoSheetProps {
  visible: boolean;
  setVisible: (open: boolean) => void;
  onSubmit: (data: FilterMementoFormData) => void;
}

/**
 * @description Actionsheet displaying options for filtering mementos
 *
 * @requirements FR-12, FR-13
 *
 * @return {JSX.Element} The rendered filters actionsheet
 */
export default function FilterMementoSheet({
  visible,
  setVisible,
  onSubmit,
}: FilterMementoSheetProps) {
  const handleClose = () => setVisible(false);

  const defaultValues: FilterMementoFormData = {
    start_date: null,
    end_date: null,
    location: { text: "" },
  };
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FilterMementoFormData>({
    defaultValues,
  });

  const startDate = watch("start_date");

  // Prevent re-rendering location input when BoundingBoxLocation changes
  const locationValue = watch("location");
  const handleLocationChange = useCallback(
    (value: BoundingBoxLocation) => {
      const hasChanged =
        locationValue.text !== value.text ||
        JSON.stringify(locationValue.bbox) !== JSON.stringify(value.bbox);

      if (hasChanged) {
        setValue("location", value);
      }
    },
    [locationValue, setValue],
  );

  return (
    <Actionsheet isOpen={visible} onClose={handleClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <ActionsheetFlatList
          data={[]}
          renderItem={() => <></>}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <Box className="w-full flex justify-center gap-6">
              <FormControl size={"lg"}>
                <FormControlLabel>
                  <FormControlLabelText>Start Date</FormControlLabelText>
                </FormControlLabel>
                <Controller
                  name="start_date"
                  control={control}
                  render={({ field }) => (
                    <DatePickerInput
                      value={field.value}
                      onChange={(date) => field.onChange(date)}
                    />
                  )}
                />
              </FormControl>
              <FormControl size={"lg"} isInvalid={!!errors.end_date}>
                <FormControlLabel>
                  <FormControlLabelText>End Date</FormControlLabelText>
                </FormControlLabel>
                <Controller
                  // FIXME: If start and end date are the same then submit button doesn't work
                  name="end_date"
                  control={control}
                  render={({ field }) => (
                    <DatePickerInput
                      value={field.value}
                      onChange={(date) => field.onChange(date)}
                    />
                  )}
                  rules={{
                    validate: {
                      required: (value) =>
                        !value ||
                        !startDate ||
                        value >= startDate ||
                        "End date cannot be before start date.",
                    },
                  }}
                />
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>
                    {errors?.end_date?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>
              <FormControl size={"lg"}>
                <FormControlLabel>
                  <FormControlLabelText>Location</FormControlLabelText>
                </FormControlLabel>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <LocationInput
                      value={field.value}
                      onChange={(value) =>
                        handleLocationChange(value as BoundingBoxLocation)
                      }
                      returnBoundingBox={true}
                      queryType="(regions)"
                    />
                  )}
                />
              </FormControl>
              <ButtonGroup className="mt-5">
                <Button
                  size={"lg"}
                  onPress={() => reset()}
                  action="negative"
                  variant="outline"
                >
                  <ButtonText className="text-error-500">Clear All</ButtonText>
                </Button>
                <Button size={"lg"} onPress={handleSubmit(onSubmit)}>
                  <ButtonText>Apply Filters</ButtonText>
                </Button>
              </ButtonGroup>
            </Box>
          }
        />
      </ActionsheetContent>
    </Actionsheet>
  );
}
