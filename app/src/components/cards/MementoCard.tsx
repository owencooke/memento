import { View } from "react-native";
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
    <View className="flex-1 bg-background-0 p-6 gap-2 flex items-center rounded-xl shadow-hard-1">
      <Image source={{ uri: thumbnail.url }} className="flex-1" alt="" />
      <View>
        <Text size="md" className="text-center line-clamp-1">
          {caption}
        </Text>
        <View className="w-full flex flex-row justify-between items-center">
          <Text size="md">{date}</Text>
          {/* TODO: replace with city */}
          <Text size="md">Edmonton</Text>
        </View>
      </View>
    </View>
  );
}
