/**
 * @description Screen for selecting mementos to add to a collection
 *
 * @requirements FR-41
 */
import MementoCard from "@/src/components/cards/MementoCard";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text, FlatList, Pressable } from "react-native";
import { useMemo, useState } from "react";
import { Button, ButtonText } from "@/src/components/ui/button";
import { MementoWithImages } from "@/src/api-client/generated";
import { useMementos } from "@/src/hooks/useMementos";
import { Heading } from "@/src/components/ui/heading";

export default function SelectMementos() {
  // Get local search params for pre-selected mementos IDs
  const { ids: idsString } = useLocalSearchParams<{ ids: string }>();
  const preSelectedIds = !idsString
    ? []
    : Array.isArray(idsString)
      ? idsString.map(Number)
      : idsString.split(",").map(Number);

  const { mementos } = useMementos({
    queryOptions: { refetchOnMount: false },
  });

  // State for tracking selected memento IDs (initialized with prev selected)
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>(() =>
    preSelectedIds.reduce(
      (acc, id) => {
        acc[id] = true;
        return acc;
      },
      {} as Record<number, boolean>,
    ),
  );

  // Prepare display data with selection state / spacer for odd # of mementos
  const gridData = useMemo(() => {
    const selectionMementos = mementos?.map((memento) => ({
      ...memento,
      selected: !!selectedIds[memento.id],
    }));

    return selectionMementos?.length && selectionMementos.length % 2
      ? [...selectionMementos, { spacer: true }]
      : selectionMementos;
  }, [mementos, selectedIds]);

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
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text>No mementos yet!</Text>
            </View>
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
    </View>
  );
}
