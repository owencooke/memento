import { View, Text, Pressable } from "react-native";
import usePhotos, { Photo } from "../../hooks/usePhotos";
import { Image } from "../ui/image";
import { Button, ButtonIcon } from "../ui/button";
import { AddIcon, CloseIcon } from "../ui/icon";
import { useEffect, useState } from "react";
import DraggableGrid from "react-native-draggable-grid";
import PhotoSourceSheet from "./PhotoSourceSheet";

interface PhotoSelectGridProps {
  onChange: (photos: Photo[]) => Promise<void>;
}

interface GridItem {
  key: string;
  photo: Photo | null;
}

export default function PhotoSelectGrid({ onChange }: PhotoSelectGridProps) {
  const [showActionsheet, setShowActionsheet] = useState(false);
  const { hasPermission, addPhotos, photos, removePhoto, setPhotos } =
    usePhotos();

  useEffect(() => {
    onChange(photos).catch((e) => console.error(e));
  }, [onChange, photos]);

  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }

  // Create data items for the grid
  const photoItems: GridItem[] = photos.map((photo, index) => ({
    key: `photo-${index}`,
    photo,
  }));

  // Add the "add" button as the last item
  const data: GridItem[] = [...photoItems, { key: "add-button", photo: null }];

  const renderItem = (item: GridItem) => {
    // For the "add" button
    if (item.photo === null) {
      return (
        <View className="p-1 flex-1">
          <Button
            size="lg"
            className="w-full h-full"
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
      <View className="p-1 flex-1">
        <View className="relative overflow-hidden rounded-md aspect-square">
          <Image
            source={{ uri: item.photo.uri }}
            className="w-full h-full"
            alt=""
            resizeMode="cover"
          />
          <Button
            onPress={() => item.photo && removePhoto(item.photo)}
            className="absolute p-1 rounded-full top-1 right-1"
            size="sm"
          >
            <ButtonIcon className="m-0 p-0" as={CloseIcon} />
          </Button>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <DraggableGrid
        numColumns={3}
        data={data}
        renderItem={renderItem}
        onDragRelease={(data) => {
          // Filter out the add button and update the photos array
          const newPhotos = data
            .filter((item: GridItem) => item.photo !== null)
            .map((item: GridItem) => item.photo) as Photo[];
          setPhotos(newPhotos);
        }}
      />
      <PhotoSourceSheet
        addPhotos={addPhotos}
        visible={showActionsheet}
        setVisible={setShowActionsheet}
      />
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
      className="flex-1"
      onLongPress={onLongPress}
      style={{ opacity: isActive ? 0.7 : 1 }}
    >
      <View className="relative aspect-square p-1">
        <View className="overflow-hidden rounded-md w-full h-full">
          <Image
            source={{ uri: photo.uri }}
            className="w-full h-full"
            alt=""
            resizeMode="cover"
          />
          <Button
            onPress={onDelete}
            className="absolute p-1 rounded-full top-1 right-1"
            size="sm"
          >
            <ButtonIcon className="m-0 p-0" as={CloseIcon} />
          </Button>
        </View>
      </View>
    </Pressable>
  );
}
