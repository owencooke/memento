import { getUsersMementosApiUserUserIdMementoGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import MementoCard from "@/src/components/cards/MementoCard";
import { useSession } from "@/src/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { View, Text, FlatList, Pressable, StyleProp, ViewStyle } from "react-native";
import { useState } from "react";
import { Button, ButtonText } from "@/src/components/ui/button";
import { MementoWithImages } from "@/src/api-client/generated";
import { Fab, FabIcon } from "@/src/components/ui/fab";
import { CheckIcon } from "@/src/components/ui/icon";

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

  // Extend the MementoWithImages type locally
  type MementoWithUIProps = MementoWithImages & {
    style?: StyleProp<ViewStyle> | null;
    selected?: boolean | null;
  };

  const { data: mementos, isLoading, isFetching } = useQuery({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
  });
  
  // Convert fetched mementos to extended type
  const mementosWithUI: MementoWithUIProps[] = mementos?.map((memento) => ({
    ...memento,
    style: null,
    selected: false,
  })) ?? [];

  // For odd number of mementos, add a spacer for last grid element
  const gridData = mementosWithUI?.length && mementosWithUI.length % 2
    ? [...mementosWithUI, { spacer: true }]
    : mementosWithUI;

  const [ids, setIds] = useState({}); // IDs of mementos selected
  const [selectedCount, setSelectedCount] = useState(0); // Number of mementos selected

  const [mementosWithUIState, setMementosWithUIState] = useState(gridData);

  const handleSelectMemento = (item: MementoWithUIProps) => {
    const updatedMementos = mementosWithUIState.map((m) =>
      "id" in m && m.id === item.id ? { ...m, selected: !m.selected } : m
    );
    
    setMementosWithUIState(updatedMementos);

    const newSelectedCount = updatedMementos.filter((m) => "selected" in m && m.selected).length;
    setSelectedCount(newSelectedCount);
    
    // Get the updated selected status from the updatedMementos array
    const updatedItem = updatedMementos.find((m) => "id" in m && m.id === item.id);
    
    setIds((prev) => {
      if (updatedItem && "selected" in updatedItem && updatedItem.selected) { // Item selected
        return { ...prev, [updatedItem.id]: updatedItem.id };
      } else if (updatedItem && "selected" in updatedItem && !updatedItem.selected) { // Item unselected
        return Object.fromEntries(
          Object.entries(prev).filter(([key]) => key !== updatedItem.id.toString())
        );
      } else {
        return prev;
      }
    });
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
      ) : mementosWithUI && mementosWithUI.length > 0 ? (
        <View>
          <FlatList
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12 }}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            data={mementosWithUIState}
            renderItem={({ item }) =>
              "spacer" in item ? (
                <View className="flex-1" />
              ) : (
                <Pressable
                  className="flex-1"
                  onPress={() => handleSelectMemento(item)}
                >
                  <MementoCard
                    {...item} 
                  />
                  {item.selected && (
                    <Fab size="lg" className="w-12 h-12 absolute top-2 right-2 bg-green-500 pointer-events-none">
                      <FabIcon as={CheckIcon} />
                    </Fab>
                  )}
                  
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
