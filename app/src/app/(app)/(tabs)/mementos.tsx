import { getUsersMementosApiUserUserIdMementoGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import MementoCard from "@/src/components/cards/MementoCard";
import { Box } from "@/src/components/ui/box";
import { Fab, FabIcon } from "@/src/components/ui/fab";
import { AddIcon } from "@/src/components/ui/icon";
import { useSession } from "@/src/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { View, Text, FlatList } from "react-native";

export default function Mementos() {
  const { session } = useSession();

  const {
    data: mementos,
    error,
    isLoading,
  } = useQuery({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
  });

  const handleAddMemento = () => {
    router.push("/(app)/(screens)/(memento)/create");
  };

  return (
    <Box className="flex-1 bg-background-100 py-4 px-6">
      {mementos && mementos.length > 0 ? (
        <FlatList
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12 }}
          numColumns={2}
          data={mementos}
          renderItem={({ item }) => <MementoCard {...item} />}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text>No mementos yet</Text>
        </View>
      )}

      <Fab size="lg" onPress={handleAddMemento}>
        <FabIcon as={AddIcon} />
      </Fab>
    </Box>
  );
}
