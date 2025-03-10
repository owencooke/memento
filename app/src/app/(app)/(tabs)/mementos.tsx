import { getUsersMementosApiUserUserIdMementoGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import MementoCard from "@/src/components/cards/MementoCard";
import { Fab, FabIcon } from "@/src/components/ui/fab";
import { AddIcon } from "@/src/components/ui/icon";
import { useSession } from "@/src/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import { useMemo, useState } from "react";
import { useColors } from "@/src/hooks/useColors";

export default function Mementos() {
  const { session } = useSession();
  const { getColor } = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const refreshColor = getColor("tertiary-500");

  const { data: mementos, refetch } = useQuery({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
  });

  // For odd number of mementos, add a spacer for last grid element
  const gridData = useMemo(
    () =>
      mementos?.length && mementos.length % 2
        ? [...mementos, { spacer: true }]
        : mementos,
    [mementos],
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddMemento = () => {
    router.push("/(app)/(screens)/(memento)/create");
  };

  const handleViewMemento = (id: number) => {
    router.push(`/(app)/(screens)/(memento)/${id}`);
  };

  return (
    <View className="flex-1 bg-background-100 py-4 px-6">
      {mementos && mementos.length > 0 ? (
        <FlatList
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12 }}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          data={gridData}
          renderItem={({ item }) =>
            "spacer" in item ? (
              <View className="flex-1" />
            ) : (
              <Pressable
                className="flex-1"
                onPress={() => handleViewMemento(item.id)}
              >
                <MementoCard {...item} />
              </Pressable>
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[refreshColor]}
              tintColor={refreshColor}
            />
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text>No mementos yet!</Text>
        </View>
      )}

      <Fab size="lg" onPress={handleAddMemento}>
        <FabIcon as={AddIcon} />
      </Fab>
    </View>
  );
}
