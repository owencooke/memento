import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
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
import { Button, ButtonText } from "../ui/button";
import { AlertCircleIcon } from "../ui/icon";

export interface FilterMementoFormData {
  start_date: Date | null;
  end_date: Date | null;
}

interface FilterMementoSheetProps {
  visible: boolean;
  setVisible: (open: boolean) => void;
  onSubmit: (data: FilterMementoFormData) => void;
}

export default function FilterMementoSheet({
  visible,
  setVisible,
  onSubmit,
}: FilterMementoSheetProps) {
  const handleClose = () => setVisible(false);

  const defaultValues: FilterMementoFormData = {
    start_date: null,
    end_date: null,
  };
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FilterMementoFormData>({
    defaultValues,
  });

  const startDate = watch("start_date");

  return (
    <Actionsheet isOpen={visible} onClose={handleClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <Box className="w-full">
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
            <FormControlError className="mt-4">
              <FormControlErrorIcon as={AlertCircleIcon} />
              <FormControlErrorText className="flex-1">
                {errors?.end_date?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
          <ButtonGroup>
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
      </ActionsheetContent>
    </Actionsheet>
  );
}
