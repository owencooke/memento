import { DeviceSource } from "@/src/hooks/usePhotos";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  ActionsheetItem,
  ActionsheetIcon,
  ActionsheetItemText,
} from "../ui/actionsheet";
import { EditIcon, EyeOffIcon } from "../ui/icon";

interface PhotoSourceSheetProps {
  addPhotos: (source: DeviceSource) => Promise<void>;
  visible: boolean;
  setVisible: (open: boolean) => void;
}

export default function PhotoSourceSheet({
  addPhotos,
  visible,
  setVisible,
}: PhotoSourceSheetProps) {
  const handleClose = () => setVisible(false);

  return (
    <Actionsheet isOpen={visible} onClose={handleClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent>
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <ActionsheetItem
          onPress={() => {
            addPhotos("camera");
            handleClose();
          }}
        >
          <ActionsheetIcon
            size="lg"
            className="stroke-background-700"
            as={EditIcon}
          />
          <ActionsheetItemText size="lg">Take a Photo</ActionsheetItemText>
        </ActionsheetItem>
        <ActionsheetItem
          onPress={() => {
            addPhotos("picker");
            handleClose();
          }}
        >
          <ActionsheetIcon
            size="lg"
            className="stroke-background-700"
            as={EyeOffIcon}
          />
          <ActionsheetItemText size="lg">
            Select from Library
          </ActionsheetItemText>
        </ActionsheetItem>
      </ActionsheetContent>
    </Actionsheet>
  );
}
