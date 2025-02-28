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
    <View className="flex-1 bg-background-0 p-10 gap-10 flex border-r-8 shadow-hard-1">
      <Image
        source={{ uri: thumbnail.url }}
        className="w-full h-full "
        alt=""
      />
      <View className="w-full flex flex-row justify-between items-center">
        <Text size="xs">{date}</Text>
        {/* TODO: replace with city */}
        <Text size="xs">{caption}</Text>
      </View>
    </View>
  );
}
