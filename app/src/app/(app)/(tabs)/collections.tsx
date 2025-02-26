import { Text } from "@/src/components/ui/text";
import usePhotos from "@/src/hooks/usePhotos";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/src/context/AuthContext";
import { getCollectionsApiUserIdCollectionsGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { Box } from "@/src/components/ui/box";
import { Fab, FabLabel, FabIcon } from "@/src/components/ui/fab";
import { AddIcon } from "@/src/components/ui/icon";
import { FlatList } from "react-native";

export default function Collections() {
  const { session } = useSession();
  const { hasPermission, addPhotos, photos, removePhoto } = usePhotos();
  const {
    data: collections,
    error,
    isLoading,
  } = useQuery({
    ...getCollectionsApiUserIdCollectionsGetOptions({
      path: {
        id: session?.user.id ?? "",
      },
    }),
    enabled: !!session?.user.id,
  });

  // console.log({ userInfo, error, isLoading });
  console.log({ collections, error, isLoading });

  if (!hasPermission) return <Text>No access to camera</Text>;
  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error fetching collections.</Text>;

  return (
    <Box className="h-full w-full bg-background-50 rounded-md">
      <FlatList
        numColumns={2}
        data={collections}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Box className="p-4 border-b border-gray-200">
            <Text className="text-lg font-bold">{item.title}</Text>
            {item.caption && (
              <Text className="text-gray-500">{item.caption}</Text>
            )}
          </Box>
        )}
      />

      <Fab
        size="md"
        placement="bottom right"
        isHovered={false}
        isDisabled={false}
        isPressed={false}
      >
        <FabIcon as={AddIcon} />
      </Fab>
    </Box>
  );
}
