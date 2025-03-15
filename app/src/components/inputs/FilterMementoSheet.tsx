import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
} from "../ui/actionsheet";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import DatePickerInput from "@/src/components/inputs/DatePickerInput";
import { useForm, Controller } from "react-hook-form";
import { Box } from "../ui/box";
import { Button, ButtonText, ButtonSpinner } from "../ui/button";

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
  const { control, handleSubmit } = useForm<FilterMementoFormData>({
    defaultValues,
  });

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
          <FormControl size={"lg"}>
            <FormControlLabel>
              <FormControlLabelText>End Date</FormControlLabelText>
            </FormControlLabel>
            <Controller
              name="end_date"
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
            className="mt-auto"
            size={"lg"}
            onPress={handleSubmit(onSubmit)}
          >
            <ButtonText>Apply Filters</ButtonText>
          </Button>
        </Box>
      </ActionsheetContent>
    </Actionsheet>
  );
}
