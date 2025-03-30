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
import { AlertCircleIcon, ChevronDownIcon } from "../ui/icon";
import { Heading } from "../ui/heading";
import LocationInput, { GeoLocation } from "./LocationInput";
import { useCallback } from "react";
import { Divider } from "../ui/divider";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "../ui/select";
import { useImageLabels } from "@/src/hooks/useImageLables";

export interface FilterMementoFormData {
  start_date: Date | null;
  end_date: Date | null;
  location: GeoLocation;
  image_label: string | null;
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
    image_label: null,
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

  const { image_labels, isLoading } = useImageLabels({});

  const startDate = watch("start_date");

  // Prevent re-rendering location input when BoundingBoxLocation changes
  const locationValue = watch("location");
  const handleLocationChange = useCallback(
    (value: GeoLocation) => {
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
              <Heading>Filter Mementos</Heading>
              <Divider />
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
                      onChange={handleLocationChange}
                      queryType="(regions)"
                    />
                  )}
                />
              </FormControl>
              <FormControl size={"lg"}>
                <FormControlLabel>
                  <FormControlLabelText>Image Labels</FormControlLabelText>
                </FormControlLabel>
                <Controller
                  name="image_label"
                  control={control}
                  render={({ field }) => (
                    <Select
                      selectedValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectInput
                          placeholder="Select option"
                          className="flex-1"
                        />
                        <SelectIcon className="mr-3" as={ChevronDownIcon} />
                      </SelectTrigger>
                      <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent>
                          <SelectDragIndicatorWrapper>
                            <SelectDragIndicator />
                          </SelectDragIndicatorWrapper>
                          {image_labels.length > 0 && !isLoading ? (
                            image_labels.map((label) => (
                              <SelectItem
                                key={label}
                                label={label}
                                value={label}
                              />
                            ))
                          ) : (
                            <SelectItem
                              label={"No Options"}
                              value={"No Options"}
                              disabled
                            />
                          )}
                        </SelectContent>
                      </SelectPortal>
                    </Select>
                  )}
                />
              </FormControl>
              <Divider />
              <ButtonGroup>
                <Button
                  size={"lg"}
                  onPress={() => {
                    reset();
                    onSubmit(defaultValues);
                    handleClose();
                  }}
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
