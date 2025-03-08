import { getUsersMementosApiUserUserIdMementoGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import MementoCard from "@/src/components/cards/MementoCard";
import { Fab, FabIcon } from "@/src/components/ui/fab";
import { AddIcon } from "@/src/components/ui/icon";
import { useSession } from "@/src/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useColors } from "@/src/hooks/useColors";
import { Button, ButtonText } from "@/src/components/ui/button";
import { MementoWithImages } from "@/src/api-client/generated";

export default function Mementos() {
  const { session } = useSession();
  const { getColor } = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const refreshColor = getColor("tertiary-500");

  // WAIT TO LOAD BEFORE PROCEEDING
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

  const [ids, setIds] = useState({});
  const [selectedCount, setSelectedCount] = useState(0);

  const handleSelectMemento = (item: MementoWithImages) => {
    item.selected = !item.selected;

    // Update number of mementos selected
    if (item.selected) {
      setSelectedCount(selectedCount + 1);
    } else {
      setSelectedCount(selectedCount - 1);
    }

    setIds(prev => 
      item.selected 
      ? {...prev, [item.id]: item.id,} 
      : Object.fromEntries(Object.entries(prev).filter(([key]) => key !== item.id.toString())) // Remove item if not selected
    );
  };

  useEffect(() => {
    console.log(Object.keys(ids).toString());
  }, [ids]);

  const handleMementosSelected = () => {
    const ids_string: string = Object.keys(ids).toString();
    
    router.back();
    router.setParams({ ids: ids_string });
  };

  return (
    <View className="flex-1 bg-background-100 py-4 px-6">
      {mementos && mementos.length > 0 ? (
        <View>
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
                  onPress={() => handleSelectMemento(item)}
                >
                  <MementoCard 
                    style={{
                      opacity: item.selected ? 0.5 : 1,
                    }} 
                    {...item} 
                  />
                </Pressable>
              )
            }
          />
          <Button
            className="mt-auto"
            size={"lg"}
            onPress={handleMementosSelected}
          >
            {selectedCount > 0 
              ? <ButtonText>Select Mementos ({selectedCount})</ButtonText>
              : <ButtonText>Select Mementos</ButtonText>
            }
          </Button>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text>No mementos yet!</Text>
        </View>
      )}
    </View>
  );
}
