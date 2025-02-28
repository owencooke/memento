import { View, Dimensions } from "react-native";
import { Image } from "@/src/components/ui/image";
import { MementoWithImages } from "@/src/api-client/generated";
import { Text } from "../ui/text";

export default function MementoCard({
  caption,
  date,
  images,
}: MementoWithImages) {
  // TODO: ensure thumbnail always the same via DB property
  const [thumbnail] = images;

  return (
    <View className="flex-1 bg-background-0 overflow-hidden rounded-xl shadow-hard-1 p-3 gap-4">
      <View className="aspect-square">
        <Image
          source={{ uri: thumbnail.url }}
          className="w-full h-full"
          alt=""
          resizeMode="cover"
        />
      </View>
      <View className="flex flex-1 justify-between gap-1">
        {caption && (
          <Text
            size="md"
            italic
            className="text-center line-clamp-2 font-light flex-1"
          >
            {caption}
          </Text>
        )}
        <View className="flex flex-row justify-between items-center mt-auto font-medium">
          <Text size="sm">{date}</Text>
          {/* TODO: replace with city */}
          <Text size="sm">Edmonton</Text>
        </View>
      </View>
    </View>
  );
}
