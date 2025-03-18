import { View, Text } from "react-native";
import usePhotos, { Photo } from "../../hooks/usePhotos";
import { Button, ButtonIcon } from "../ui/button";
import { AddIcon } from "../ui/icon";
import { useEffect, useState, useMemo, useCallback } from "react";
import DraggableGrid from "@/src/components/draggable-grid";
import PhotoSourceSheet from "./PhotoSourceSheet";
import InteractivePhotoCard from "../cards/InteractivePhotoCard";
import BackgroundRemovalModal from "../forms/BackgroundRemovalModal";

interface GridItem {
  key: number;
  photo: Photo | null;
}

interface PhotoSelectGridProps {
  initialPhotos: Photo[];
  onChange: (photos: Photo[]) => Promise<void>;
  setScrollEnabled: (enabled: boolean) => void;
  editable?: boolean;
}

export default function PhotoSelectGrid({
  initialPhotos,
  editable = true,
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
        disabledDrag: !editable,
      })),
      {
        key: -1,
        photo: null,
        disabledDrag: true,
        disabledReSorted: true,
      },
    ],
    [editable, photos],
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
        renderItem={(item: GridItem) => {
          const { photo } = item;
          return (
            <View className="px-1 py-2 flex-1 aspect-square">
              {photo ? (
                <InteractivePhotoCard
                  photo={photo}
                  onDelete={editable ? () => removePhoto(photo) : undefined}
                  showThumbnailBadge={item.key === 0}
                />
              ) : (
                editable && (
                  // Render the add button
                  <Button
                    size="lg"
                    className="mt-2 mr-2 h-full"
                    action="secondary"
                    onPress={() => setShowActionsheet(true)}
                  >
                    <ButtonIcon as={AddIcon} />
                  </Button>
                )
              )}
            </View>
          );
        }}
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
