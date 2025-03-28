import MementoCard from "@/src/components/cards/MementoCard";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text, FlatList, Pressable } from "react-native";
import { useState } from "react";
import { Button, ButtonText } from "@/src/components/ui/button";
import { MementoWithImages } from "@/src/api-client/generated";
import { Fab, FabIcon } from "@/src/components/ui/fab";
import { CheckIcon } from "@/src/components/ui/icon";
import { useMementos } from "@/src/hooks/useMementos";
import { Heading } from "@/src/components/ui/heading";

/**
 * @description Screen for selecting mementos to add to a collection
 *
 * @requirements FR-41
 *
 * @component
 * @returns {JSX.Element} Rendered SelectMementos screen.
 */
export default function SelectMementos() {
  // Get local search params for pre-selected mementos
  const params = useLocalSearchParams();
  const preSelectedIds = !params.ids
    ? []
    : Array.isArray(params.ids)
      ? params.ids.map(Number)
      : params.ids.split(",").map(Number);

  // Fetch mementos
  const { mementos, isLoading } = useMementos({
    queryOptions: { refetchOnMount: false },
  });

  // State for tracking selected mementos
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>(
    () => {
      // Initialize with pre-selected IDs
      return preSelectedIds.reduce(
        (acc, id) => {
          acc[id] = true;
          return acc;
        },
        {} as Record<number, boolean>,
      );
    },
  );

  // Prepare display data with selection state
  const displayData =
    mementos?.map((memento) => ({
      ...memento,
      selected: !!selectedIds[memento.id],
    })) || [];

  // Add spacer for grid alignment if needed
  const gridData =
    displayData.length % 2 ? [...displayData, { spacer: true }] : displayData;

  // Calculate selected count
  const selectedCount = Object.keys(selectedIds).length;

  // Toggle selection for a memento
  const handleSelectMemento = (
    memento: MementoWithImages & { selected?: boolean },
  ) => {
    setSelectedIds((prev) => {
      const newState = { ...prev };
      if (newState[memento.id]) {
        delete newState[memento.id];
      } else {
        newState[memento.id] = true;
      }
      return newState;
    });
  };

  // Submit selected mementos
  const handleMementosSelected = () => {
    const idsString = Object.keys(selectedIds).toString();
    router.back();
    router.setParams({ ids: idsString });
  };

  return (
    <View className="flex-1 bg-background-100 py-4 px-6">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text>Loading...</Text>
        </View>
      ) : displayData.length > 0 ? (
        <View className="flex justify-center gap-6">
          <Heading className="block" size="2xl">
            Select Mementos
          </Heading>
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
                  <MementoCard {...item} />
                </Pressable>
              )
            }
          />
          <Button className="mt-4" size={"lg"} onPress={handleMementosSelected}>
            <ButtonText>
              {selectedCount > 0
                ? `Select Mementos (${selectedCount})`
                : "Select Mementos"}
            </ButtonText>
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
