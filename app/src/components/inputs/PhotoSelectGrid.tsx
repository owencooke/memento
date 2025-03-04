import { View, Text } from "react-native";
import usePhotos, { Photo } from "../../hooks/usePhotos";
import { Image } from "../ui/image";
import { Button, ButtonIcon } from "../ui/button";
import { AddIcon, CloseIcon } from "../ui/icon";
import { useEffect, useState, useMemo, useCallback } from "react";
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
      {
        key: "add-button",
        photo: null,
        disabledDrag: true,
        disabledReSorted: true,
      },
    ],
    [photos],
  );

  const handleReorderPhotos = useCallback(
    (data: GridItem[]) => {
      const newPhotos = data
        .filter((item) => item.photo !== null)
        .map((item) => item.photo) as Photo[];
      setPhotos(newPhotos);
    },
    [setPhotos],
  );

  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View className="flex-1">
      <PhotoSourceSheet
        addPhotos={addPhotos}
        visible={showActionsheet}
        setVisible={setShowActionsheet}
      />
      <DraggableGrid
        numColumns={3}
        data={gridData}
        onDragRelease={handleReorderPhotos}
        renderItem={(item: GridItem) => (
          <View className="px-1 py-2 flex-1 aspect-square">
            {item.photo ? (
              // Render a photo
              <View className="relative overflow-hidden rounded-md">
                <Image
                  source={{ uri: item.photo.uri }}
                  className="w-auto h-full mt-2 mr-2"
                  alt=""
                  resizeMode="cover"
                />
                <Button
                  onPress={() => item.photo && removePhoto(item.photo)}
                  className="absolute p-2 rounded-full top-0 right-0"
                  size="sm"
                >
                  <ButtonIcon className="m-0 p-0" as={CloseIcon} />
                </Button>
              </View>
            ) : (
              // Render the add button
              <Button
                size="lg"
                className="mt-2 mr-2 h-full"
                action="secondary"
                onPress={() => setShowActionsheet(true)}
              >
                <ButtonIcon as={AddIcon} />
              </Button>
            )}
          </View>
        )}
      />
    </View>
  );
}
