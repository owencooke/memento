import { Text } from "@/src/components/ui/text";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/src/context/AuthContext";
import { getUsersCollectionsApiUserUserIdCollectionGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { Box } from "@/src/components/ui/box";
import { Fab, FabIcon } from "@/src/components/ui/fab";
import { AddIcon } from "@/src/components/ui/icon";
import { FlatList } from "react-native";
import { Pressable } from "@/src/components/ui/pressable";
import { Alert, AlertText } from "@/src/components/ui/alert";
import { HStack } from "@/src/components/ui/hstack";
import { VStack } from "@/src/components/ui/vstack";
import { Image } from "@/src/components/ui/image";
import { router } from "expo-router";
import CollectionCard from "@/src/components/cards/CollectionCard";

const placeholderImage = "https://via.placeholder.com/100";

export default function Collections() {
  const { session } = useSession();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const {
    data: collections,
    error,
    isLoading,
  } = useQuery({
    ...getUsersCollectionsApiUserUserIdCollectionGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
    enabled: !!session?.user.id,
  });

  const gridData = useMemo(
    () =>
      collections?.length && collections.length % 2
        ? [...collections, { spacer: true }]
        : collections,
    [collections],
  );

  const showAlert = (message: string) => {
    setAlertMessage(message);
    // Alert for 2 second
    setTimeout(() => setAlertMessage(null), 2000);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    showAlert(`Selected collection: ${id}`);
  };

  const handleAddCollection = () => {
    router.push("/(app)/(screens)/(collection)/create");
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error fetching collections.</Text>;

  return (
    <Box className="flex-1 py-4 px-6 bg-background-100">
      {collections && collections.length > 0 ? (
        <FlatList
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12 }}
          showsVerticalScrollIndicator={false}
          data={gridData}
          keyExtractor={(item, index) =>
            "spacer" in item ? `spacer-${index}` : String(item.id)
          }
          renderItem={({ item }) => (
            <Box className="flex-1">
              {!("spacer" in item) && (
                <CollectionCard
                  {...item}
                  onPress={() => handleSelect(String(item.id))}
                  selected={selectedId === String(item.id)}
                />
              )}
            </Box>
          )}
        />
      ) : (
        <Box className="flex-1 items-center justify-center">
          <Text>No collections yet!</Text>
        </Box>
      )}

      <Fab size="lg" onPress={handleAddCollection}>
        <FabIcon as={AddIcon} />
      </Fab>
    </Box>
  );
}
