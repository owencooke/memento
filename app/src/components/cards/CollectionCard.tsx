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
  // Extract city from whole location
  const city = useMemo(
    () => (location ? location.split(",")[0].trim() : location),
    [location],
  );

  const isMarker = variant === "marker";

  return (
    <View className="p-4">
      <View className="relative">
        {/* Background Stacked Cards */}
        <View
          className={`absolute w-full h-full rounded-xl bg-background-0 shadow-hard-3 -rotate-3
            ${isMarker ? "top-1 -left-1" : "top-2 -left-2"}`}
        />
        <View
          className={`absolute w-full h-full rounded-xl bg-background-0 shadow-hard-3 rotate-3
            ${isMarker ? "-top-1 left-1" : "-top-2 left-2"}`}
        />
        {/* Actual Card with Contents */}
        <View
          className={`relative flex flex-col rounded-xl shadow-hard-3 bg-background-0 
            ${isMarker ? "w-[80px] p-[6px]" : "flex-1 gap-1 p-3"}`}
        >
          <View className="aspect-square flex-1">
            <Image
              source={{ uri: "https://placehold.co/400.png" }}
              className="h-full w-full"
              alt=""
              resizeMode="cover"
            />
          </View>
          <Text
            size={isMarker ? "sm" : "lg"}
            className="font-bold text-center mt-1"
          >
            {title}
          </Text>
          {!isMarker && (
            <View className="flex flex-col justify-between items-center">
              <Text className="font-light" size="sm">
                {city || ""}
              </Text>
              <Text className="font-extralight" size="sm">
                {date || ""}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
