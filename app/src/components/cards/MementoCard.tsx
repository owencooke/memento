import { View } from "react-native";
import { Image } from "@/src/components/ui/image";
import { ImageWithUrl, MementoWithImages } from "@/src/api-client/generated";
import { Text } from "../ui/text";
import { useMemo } from "react";
import { Fab, FabIcon } from "../ui/fab";
import { CheckIcon } from "lucide-react-native";

interface MementoCardProps extends MementoWithImages {
  selected?: boolean;
  showText?: boolean;
}

export default function MementoCard({
  caption,
  date,
  images,
  location,
  selected = false,
  showText = true,
}: MementoCardProps) {
  // Get thumbnail
  const thumbnail = useMemo(
    () => images.find((image) => image.order_index === 0) as ImageWithUrl,
    [images],
  );

  // Extract city from whole location
  const city = useMemo(
    () => (location ? location.split(",")[0].trim() : location),
    [location],
  );

  return (
    <View
      className="flex-1 bg-background-0 rounded-xl shadow-hard-3 p-3 gap-4"
      testID="memento-card"
    >
      <View className="aspect-square">
        <Image
          source={{ uri: thumbnail.url }}
          className="w-full h-full"
          alt=""
          resizeMode="cover"
        />
      </View>
      {showText && (
        <View className="flex flex-1 justify-between gap-1">
          {caption && (
            <Text
              size="md"
              italic
              className="text-center line-clamp-2 font-light flex-1"
              testID="memento-card-caption"
            >
              {caption}
            </Text>
          )}
          <View className="flex flex-row justify-between items-center mt-auto font-medium">
            <Text className="flex-1" size="sm">
              {date}
            </Text>
            <Text className="flex-1 text-right" size="sm">
              {city}
            </Text>
          </View>
        </View>
      )}
      {selected && (
        <Fab
          size="lg"
          className="w-10 h-10 absolute top-2 right-2 bg-tertiary-500 pointer-events-none"
        >
          <FabIcon as={CheckIcon} />
        </Fab>
      )}
    </View>
  );
}
