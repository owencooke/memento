import { Text } from "@/src/components/ui/text";
import { useState } from "react";
import usePhotos from "@/src/hooks/usePhotos";
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
    <Box className="flex-1 p-4 bg-white">
      {alertMessage && (
        <Alert action="muted" variant="solid">
          <AlertText>{alertMessage}</AlertText>
        </Alert>
      )}

      <FlatList
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12 }}
        data={collections}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Box className="flex-1">
            <Pressable onPress={() => handleSelect(String(item.id))}>
              <Box
                className={`p-4 rounded-md shadow ${
                  selectedId === String(item.id) ? "bg-gray-300" : "bg-white"
                }`}
              >
                <VStack space="md">
                  <Box className="aspect-square">
                    <Image
                      source={{ uri: "https://placehold.co/400.png" }}
                      alt="Collection Image"
                      className="w-auto h-full"
                    />
                  </Box>
                  <VStack className="justify-center">
                    <Text className="text-lg font-bold flex-1 text-wrap">
                      {item.title}
                    </Text>
                    <HStack className="justify-between">
                      <Text className="text-gray-700 flex-1">{"Location"}</Text>
                      <Text className="text-gray-700 flex-1 text-right">
                        {"Date"}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </Box>
            </Pressable>
          </Box>
        )}
      />

      <Fab onPress={handleAddCollection}>
        <FabIcon as={AddIcon} />
      </Fab>
    </Box>
  );
}
