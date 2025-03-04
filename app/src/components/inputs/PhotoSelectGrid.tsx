import { View, Text, Pressable } from "react-native";
import usePhotos, { Photo } from "../../hooks/usePhotos";
import { Image } from "../ui/image";
import { Button, ButtonIcon } from "../ui/button";
import { AddIcon, CloseIcon } from "../ui/icon";
import { useEffect, useState } from "react";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import PhotoSourceSheet from "./PhotoSourceSheet";

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
        <Pressable className="flex-1" onLongPress={undefined}>
          <View className="flex-1 aspect-square p-1">
            <Button
              size="lg"
              className="w-full h-full"
              action="secondary"
              onPress={() => setShowActionsheet(true)}
            >
              <ButtonIcon as={AddIcon} />
            </Button>
          </View>
        </Pressable>
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
        columnWrapperStyle={{ gap: 8 }}
        contentContainerStyle={{ padding: 8, gap: 8 }}
        showsVerticalScrollIndicator={false}
        onDragEnd={({ data }) => {
          // Filter out the add button and update the photos array
          const newPhotos = data
            .filter((item) => item.photo !== null)
            .map((item) => item.photo);
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
