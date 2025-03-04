import { View, Text } from "react-native";
import usePhotos, { Photo } from "../../hooks/usePhotos";
import { Image } from "../ui/image";
import { Button, ButtonIcon } from "../ui/button";
import { AddIcon, CloseIcon } from "../ui/icon";
import { useEffect, useMemo, useState } from "react";
import DraggableGrid from "react-native-draggable-grid";
import PhotoSourceSheet from "./PhotoSourceSheet";

interface GridItem {
  key: string;
  photo: Photo | null;
}
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

  const gridData = useMemo(
    () => [
      ...photos.map((photo, index) => ({
        key: `photo-${index}`,
        photo,
      })),
      { key: "add-button", photo: null },
    ],
    [photos],
  );

  const renderItem = (item: GridItem) => {
    const { photo } = item;
    if (photo === null) {
      return (
        // Render Add Button
        <View className="p-1 flex-1 aspect-square">
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
    return (
      <InteractivePhotoCard photo={photo} onDelete={() => removePhoto(photo)} />
    );
  };

  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View className="flex-1">
      <DraggableGrid
        numColumns={3}
        data={gridData}
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
}

function InteractivePhotoCard({ photo, onDelete }: InteractivePhotoCardProps) {
  return (
    <View className="p-1 flex-1 relative overflow-hidden rounded-md aspect-square">
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
  );
}
