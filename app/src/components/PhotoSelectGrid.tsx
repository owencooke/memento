import { View, Text } from "react-native";
import usePhotos, { Photo } from "../hooks/usePhotos";
import { Image } from "./ui/image";
import { Button, ButtonIcon } from "./ui/button";
import {
  AddIcon,
  ClockIcon,
  CloseIcon,
  DownloadIcon,
  EditIcon,
  EyeOffIcon,
  TrashIcon,
} from "./ui/icon";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  ActionsheetItem,
  ActionsheetIcon,
  ActionsheetItemText,
} from "./ui/actionsheet";
import { useState } from "react";

export default function PhotoSelectGrid() {
  const [showActionsheet, setShowActionsheet] = useState(false);
  const { hasPermission, addPhotos, photos, removePhoto } = usePhotos();

  const handleClose = () => setShowActionsheet(false);

  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View className="flex flex-wrap">
      {photos.map((photo, index) => (
        <InteractivePhotoCard
          key={index}
          photo={photo}
          onDelete={() => removePhoto(photo)}
        />
      ))}
      <Button
        size="lg"
        className="w-24 h-24 m-1"
        action="secondary"
        onPress={() => setShowActionsheet(true)}
      >
        <ButtonIcon as={AddIcon} />
      </Button>
      <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
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
            <ActionsheetIcon className="stroke-background-700" as={EditIcon} />
            <ActionsheetItemText>Take a Photo</ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem
            onPress={() => {
              addPhotos("picker");
              handleClose();
            }}
          >
            <ActionsheetIcon
              className="stroke-background-700"
              as={EyeOffIcon}
            />
            <ActionsheetItemText>Select from Library</ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
}

interface InteractivePhotoCardProps {
  photo: Photo;
  onDelete: () => void;
}

function InteractivePhotoCard({ photo, onDelete }: InteractivePhotoCardProps) {
  return (
    <View className="relative w-24 h-24 m-1">
      <Image source={{ uri: photo.uri }} className="w-full h-full" />
      <Button onPress={onDelete} className="absolute top-1 right-1">
        <ButtonIcon as={CloseIcon} />
      </Button>
    </View>
  );
}
