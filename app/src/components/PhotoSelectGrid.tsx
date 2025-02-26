import { View, Text } from "react-native";
import usePhotos, { Photo } from "../hooks/usePhotos";
import { Image } from "./ui/image";
import { Button, ButtonIcon } from "./ui/button";
import { AddIcon, CloseIcon } from "./ui/icon";

export default function PhotoSelectGrid() {
  const { hasPermission, addPhotos, photos, removePhoto } = usePhotos();

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
        variant="solid"
        // OPEN ACTIONSHEET
        // onPress={() => }
      >
        <ButtonIcon as={AddIcon} />
      </Button>
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
