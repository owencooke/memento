import { View, Text } from "react-native";
import usePhotos, { Photo } from "../../hooks/usePhotos";
import { Image } from "../ui/image";
import { Button, ButtonIcon } from "../ui/button";
import { AddIcon, CloseIcon, StarIcon } from "../ui/icon";
import { useEffect, useState, useMemo, useCallback } from "react";
import DraggableGrid from "react-native-draggable-grid";
import PhotoSourceSheet from "./PhotoSourceSheet";
import { Badge, BadgeIcon } from "../ui/badge";
import BackgroundRemovalModal from "../forms/BackgroundRemovalModal";

interface GridItem {
  key: number;
  photo: Photo | null;
}

interface PhotoSelectGridProps {
  initialPhotos: Photo[];
  onChange: (photos: Photo[]) => Promise<void>;
  setScrollEnabled: (enabled: boolean) => void;
}

export default function PhotoSelectGrid({
  initialPhotos,
  onChange,
  setScrollEnabled,
}: PhotoSelectGridProps) {
  const [showActionsheet, setShowActionsheet] = useState(false);
  const {
    hasPermission,
    addPhotos,
    photos,
    deletePhoto,
    setPhotos,
    pendingProcessedPhotos,
    acceptProcessedPhoto,
    rejectProcessedPhoto,
  } = usePhotos({ initialPhotos });

  // When photos change, send updated state to parent component
  useEffect(() => {
    onChange(photos).catch((e) => console.error(e));
  }, [onChange, photos]);

  // Include non-draggable add button at end of photo grid
  const gridData = useMemo(
    () => [
      ...photos.map((photo, index) => ({
        key: index,
        photo,
      })),
      {
        key: -1,
        photo: null,
        disabledDrag: true,
        disabledReSorted: true,
      },
    ],
    [photos],
  );

  // Executed when user releases a dragged photo
  const handleReorderPhotos = useCallback(
    (data: GridItem[]) => {
      const newPhotos = data
        .filter((item) => item.photo !== null)
        .map((item) => item.photo) as Photo[];
      setPhotos(newPhotos);
      setScrollEnabled(true);
    },
    [setPhotos, setScrollEnabled],
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
        onDragStart={() => setScrollEnabled(false)}
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
                {/* Thumbnail badge for first photo */}
                {item.key === 0 && (
                  <Badge
                    className="absolute bottom-0 left-0 p-1 bg-tertiary-500"
                    size="sm"
                  >
                    <BadgeIcon as={StarIcon} className="text-typography-900" />
                  </Badge>
                )}
                <Button
                  onPress={() => item.photo && deletePhoto(item.photo)}
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
      {/* Accept/reject background removal result */}
      {pendingProcessedPhotos.map((backgroundFreePhoto, idx) => (
        <BackgroundRemovalModal
          key={idx}
          photo={backgroundFreePhoto}
          accept={() => acceptProcessedPhoto(backgroundFreePhoto)}
          reject={() => rejectProcessedPhoto(backgroundFreePhoto)}
        />
      ))}
    </View>
  );
}
