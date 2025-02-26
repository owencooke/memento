import { View, Text } from "react-native";
import usePhotos, { Photo } from "../hooks/usePhotos";
import { Image } from "./ui/image";
import { Button, ButtonIcon } from "./ui/button";
import { AddIcon, CloseIcon, EditIcon, EyeOffIcon } from "./ui/icon";
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
import { useEffect, useState } from "react";

interface PhotoSelectGridProps {
  onChange: (photos: Photo[]) => void;
}

export default function PhotoSelectGrid({ onChange }: PhotoSelectGridProps) {
  const [showActionsheet, setShowActionsheet] = useState(false);
  const { hasPermission, addPhotos, photos, removePhoto } = usePhotos();

  useEffect(() => onChange(photos), [onChange, photos]);

  const handleClose = () => setShowActionsheet(false);

  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }

  console.log(photos);

  return (
    <View className="flex flex-wrap flex-row gap-[2%]">
      {photos.map((photo, index) => (
        <InteractivePhotoCard
          key={index}
          photo={photo}
          onDelete={() => removePhoto(photo)}
        />
      ))}
      <View className="relative basis-[32%] aspect-square">
        <Button
          size="lg"
          className="mt-2 mr-2 h-full"
          action="secondary"
          onPress={() => setShowActionsheet(true)}
        >
          <ButtonIcon as={AddIcon} />
        </Button>
      </View>
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
    </View>
  );
}

interface InteractivePhotoCardProps {
  photo: Photo;
  onDelete: () => void;
}

function InteractivePhotoCard({ photo, onDelete }: InteractivePhotoCardProps) {
  return (
    <View className="relative basis-[32%] aspect-square">
      <Image
        source={{ uri: photo.uri }}
        className="w-auto h-full mt-2 mr-2"
        alt=""
      />
      <Button
        onPress={onDelete}
        className="absolute p-2 rounded-full top-0 right-0"
      >
        <ButtonIcon className="m-0 p-0" as={CloseIcon} />
      </Button>
    </View>
  );
}
