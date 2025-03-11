import { getUsersMementosApiUserUserIdMementoGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import MementoCard from "@/src/components/cards/MementoCard";
import { useSession } from "@/src/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { View, Text, FlatList, Pressable } from "react-native";
import { useState } from "react";
import { Button, ButtonText } from "@/src/components/ui/button";
import { MementoWithImages } from "@/src/api-client/generated";

/**
 * @description Screen for selecting mementos to add to a collection
 *
 * @requirements FR-41
 *
 * @component
 * @returns {JSX.Element} Rendered SelectMementos screen.
 */
export default function SelectMementos() {
  const { session } = useSession();

  const { data: mementos, isLoading, isFetching } = useQuery({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
  });

  // For odd number of mementos, add a spacer for last grid element
  const gridData = mementos?.length && mementos.length % 2
    ? [...mementos, { spacer: true }]
    : mementos;

  const [ids, setIds] = useState({}); // IDs of mementos selected
  const [selectedCount, setSelectedCount] = useState(0); // Number of mementos selected

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
        ? {...prev, [item.id]: item.id,} // Add ID
        : Object.fromEntries(Object.entries(prev).filter(([key]) => key !== item.id.toString())) // Remove ID if not selected
    );
  };

  const handleMementosSelected = () => {
    const ids_string: string = Object.keys(ids).toString();
    
    // Navigate back to the collection create page with selected mementos' IDs
    router.back();
    router.setParams({ ids: ids_string });
  };

  return (
    <View className="flex-1 bg-background-100 py-4 px-6">
      {isLoading || isFetching ? (
        <View className="flex-1 items-center justify-center">
          <Text>Loading...</Text>
        </View>
      ) : mementos && mementos.length > 0 ? (
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
            className="mt-4"
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
