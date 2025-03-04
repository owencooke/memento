import { View, Text, Pressable } from "react-native";
import usePhotos, { Photo } from "../../hooks/usePhotos";
import { Image } from "../ui/image";
import { Button, ButtonIcon } from "../ui/button";
import { AddIcon, CloseIcon, EditIcon, EyeOffIcon } from "../ui/icon";
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
import { useEffect, useState } from "react";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";

interface PhotoSelectGridProps {
  onChange: (photos: Photo[]) => Promise<void>;
}

export default function PhotoSelectGrid({ onChange }: PhotoSelectGridProps) {
  const [showActionsheet, setShowActionsheet] = useState(false);
  const { hasPermission, addPhotos, photos, removePhoto, setPhotos } =
    usePhotos();

  useEffect(() => {
    onChange(photos).catch((e) => console.error(e));
  }, [onChange, photos]);

  const handleClose = () => setShowActionsheet(false);

  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }

  // Create a data structure that works with DraggableFlatList
  const photoItems = photos.map((photo, index) => ({
    key: `photo-${index}`,
    photo,
  }));

  // Add the "add" button as the last item
  const data = [...photoItems, { key: "add-button", photo: null }];

  const renderItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<(typeof data)[0]>) => {
    // For the "add" button
    if (item.photo === null) {
      return (
        <View
          //   className="relative basis-[32%] aspect-square"
          //   style={{ width: "32%", margin: "0.5%" }}
          className="flex-1 aspect-square"
        >
          <Button
            size="lg"
            className="mt-2 mr-2 h-full"
            action="secondary"
            onPress={() => setShowActionsheet(true)}
          >
            <ButtonIcon as={AddIcon} />
          </Button>
        </View>
      );
    }

    // For photo items
    return (
      <ScaleDecorator>
        <InteractivePhotoCard
          photo={item.photo}
          onDelete={() => removePhoto(item.photo)}
          onLongPress={drag}
          isActive={isActive}
        />
      </ScaleDecorator>
    );
  };

  return (
    <View className="flex-1">
      <DraggableFlatList
        data={data}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={{ gap: 8 }}
        columnWrapperStyle={{ gap: 8 }}
        onDragEnd={({ data }) => {
          // Filter out the add button and update the photos array
          const newPhotos = data
            .filter((item) => item.photo !== null)
            .map((item) => item.photo);
          setPhotos(newPhotos);
        }}
      />

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
  onLongPress?: () => void;
  isActive?: boolean;
}

function InteractivePhotoCard({
  photo,
  onDelete,
  onLongPress,
  isActive,
}: InteractivePhotoCardProps) {
  return (
    <Pressable
      className="flex-1 aspect-square"
      //   style={{
      //     opacity: isActive ? 0.8 : 1,
      //     transform: [{ scale: isActive ? 1.05 : 1 }],
      //   }}
      onLongPress={onLongPress}
    >
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
    </Pressable>
  );
}
