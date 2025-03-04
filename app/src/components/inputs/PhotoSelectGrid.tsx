import { View, Text } from "react-native";
import usePhotos, { Photo } from "../../hooks/usePhotos";
import { Image } from "../ui/image";
import { Button, ButtonIcon } from "../ui/button";
import { AddIcon, CloseIcon } from "../ui/icon";
import { useEffect, useState } from "react";
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

  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }

  const gridData: GridItem[] = [
    ...photos.map((photo, index) => ({
      key: `photo-${index}`,
      photo,
    })),
    { key: "add-button", photo: null },
  ];

  return (
    <View className="flex-1">
      <DraggableGrid
        numColumns={3}
        data={gridData}
        onDragRelease={(data) => {
          // Filter out the add button and update the photos array
          const newPhotos = data
            .filter((item: GridItem) => item.photo !== null)
            .map((item: GridItem) => item.photo) as Photo[];
          setPhotos(newPhotos);
        }}
        renderItem={(item: GridItem) => {
          // Add Button Card
          if (item.photo === null) {
            return (
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

          // Photo Cards
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
