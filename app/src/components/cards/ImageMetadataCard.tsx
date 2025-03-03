import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import {
  Coordinates,
  ImageWithUrl,
} from "@/src/api-client/generated/types.gen";
import { removeUnderscores, toTitleCase } from "@/src/libs/string";

const INCLUDE_FIELDS = ["coordinates", "detected_text", "image_label", "date"];

interface ImageMetadataCardProps {
  image: ImageWithUrl;
}

export default function ImageMetadataCard({ image }: ImageMetadataCardProps) {
  // Transform specific metadata fields for display
  const displayItems = Object.entries(image)
    .filter(([key]) => INCLUDE_FIELDS.includes(key))
    .map(([key, value]) => {
      let displayValue = value;

      // Format specific field types
      if (key === "coordinates" && value) {
        const coords = value as Coordinates;
        displayValue = `${coords.lat.toFixed(4)}, ${coords.long.toFixed(4)}`;
      }

      return { key: toTitleCase(removeUnderscores(key)), value: displayValue };
    });

  return (
    <View className="flex flex-col gap-3">
      {displayItems.map((item) => (
        <View key={item.key} className="flex-row justify-between items-start">
          <Text size="lg" bold>
            {item.key}
          </Text>
          <Text size="lg" className="flex-1 text-right">
            {item.value ? String(item.value) : "-"}
          </Text>
        </View>
      ))}
    </View>
  );
}
