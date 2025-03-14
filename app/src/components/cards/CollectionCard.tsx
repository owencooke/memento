import { View } from "react-native";
import { Image } from "@/src/components/ui/image";
import { CollectionWithMementos } from "@/src/api-client/generated";
import { Text } from "@/src/components/ui/text";
import { useMemo } from "react";

type CollectionCardProps = CollectionWithMementos & {
  variant?: "default" | "marker";
};

export default function CollectionCard({
  id,
  title,
  date,
  location,
  mementos,
  variant = "default",
}: CollectionCardProps) {
  // Get thumbnail from first memento
  const thumbnail = null;

  // Extract city from whole location
  const city = useMemo(
    () => (location ? location.split(",")[0].trim() : location),
    [location],
  );

  const isMarker = variant === "marker";

  return (
    <View
      className={`flex flex-col rounded-xl shadow-hard-3 bg-background-0 ${
        isMarker ? "w-[80px] p-[6px]" : "flex-1 gap-4 p-3"
      }`}
    >
      <View className="aspect-square flex-1">
        <Image
          source={{ uri: "https://placehold.co/400.png" }}
          className="h-full w-full"
          alt=""
          resizeMode="cover"
        />
      </View>
      <View>
        <Text size={isMarker ? "sm" : "lg"} className="font-bold text-center">
          {title}
        </Text>
      </View>
      {!isMarker && (
        <View className="flex flex-row justify-between items-center mt-auto font-medium">
          <Text className="text-left" size="sm">
            {date}
          </Text>
          <Text className="text-right" size="sm">
            {city}
          </Text>
        </View>
      )}
    </View>
  );
}
