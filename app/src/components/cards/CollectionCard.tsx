import { View } from "react-native";
import { Image } from "@/src/components/ui/image";
import { CollectionWithMementos } from "@/src/api-client/generated";
import { Text } from "@/src/components/ui/text";
import { useMemo } from "react";
import { Box } from "@/src/components/ui/box";

/**
 * @description A card component for displaying a collection with its metadata.
 *
 * @requirements FR-3
 *
 * @component
 * @param {CollectionCardProps} props - Component props.
 * @returns {JSX.Element} The rendered collection card component.
 */
export default function CollectionCard({
  id,
  title,
  date,
  location,
  mementos,
}: CollectionWithMementos): JSX.Element {
  // Get thumbnail from first memento
  const thumbnail = null;

  // Extract city from whole location
  const city = useMemo(
    () => (location ? location.split(",")[0].trim() : location),
    [location],
  );

  return (
    <Box
      className={"flex-1 gap-4 p-3 rounded-xl shadow-hard-3 bg-background-0"}
    >
      <Box className="aspect-square">
        <Image
          source={{ uri: "https://placehold.co/400.png" }}
          className="w-full h-full"
          alt=""
          resizeMode="cover"
        />
      </Box>
      <Box className="flex flex-1 justify-between gap-1">
        <Text size="lg" className="font-bold text-center flex-1">
          {title}
        </Text>
        <View className="flex flex-row justify-between items-center mt-auto font-medium">
          <Text className="flex-1 text-left" size="sm">
            {date}
          </Text>
          <Text className="flex-1 text-right" size="sm">
            {city}
          </Text>
        </View>
      </Box>
    </Box>
  );
}
