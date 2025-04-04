import { View } from "react-native";
import { Photo } from "@/src/libs/photos";
import { Button, ButtonIcon } from "../ui/button";
import { Image } from "../ui/image";
import { Badge, BadgeIcon } from "../ui/badge";
import { CloseIcon, StarIcon } from "../ui/icon";

interface InteractivePhotoCardProps {
  photo: Photo;
  onDelete?: () => void;
  showThumbnailBadge?: boolean;
}

export default function InteractivePhotoCard({
  photo,
  onDelete,
  showThumbnailBadge = false,
}: InteractivePhotoCardProps) {
  return (
    <View className="p-1 aspect-square" testID="interactive-photo-card">
      <View className="relative overflow-hidden rounded-md">
        <Image
          source={{ uri: photo?.uri }}
          className="w-full h-full"
          alt=""
          resizeMode="cover"
        />
        {showThumbnailBadge && (
          <Badge
            className="absolute bottom-0 left-0 p-1 bg-tertiary-500"
            size="sm"
          >
            <BadgeIcon as={StarIcon} className="text-typography-900" />
          </Badge>
        )}
        {onDelete && (
          <Button
            testID="interactive-photo-card-delete"
            onPress={onDelete}
            className="absolute p-2 rounded-full top-0 right-0"
            size="sm"
          >
            <ButtonIcon className="m-0 p-0" as={CloseIcon} />
          </Button>
        )}
      </View>
    </View>
  );
}
