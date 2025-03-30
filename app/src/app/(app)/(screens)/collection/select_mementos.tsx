/**
 * @description Screen for selecting mementos to add to a collection
 *
 * @requirements FR-41
 *
 * @component
 * @returns {JSX.Element} Rendered SelectMementos screen.
 */
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useState } from "react";
import { Button, ButtonText } from "@/src/components/ui/button";
import { MementoWithImages } from "@/src/api-client/generated";
import { useMementos } from "@/src/hooks/useMementos";
import { Heading } from "@/src/components/ui/heading";
import { SafeAreaView } from "react-native-safe-area-context";
import MementoGrid from "@/src/components/lists/MementoGrid";
import { Text } from "@/src/components/ui/text";

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
    router.setParams({ ids: idsString, freshlySelected: "true" });
  };

  return (
    <SafeAreaView className="flex-1 py-4 px-6" edges={["bottom"]}>
      <MementoGrid
        mementos={mementos?.map((memento) => ({
          ...memento,
          selected: !!selectedIds[memento.id],
        }))}
        onMementoPress={handleSelectMemento}
        ListHeaderComponent={
          <View className="flex justify-center gap-2">
            <Heading className="block" size="2xl">
              Select Mementos
            </Heading>
            <Text size="lg" className="text-left font-light mb-4">
              Choose which mementos you want to be stored within this
              collection!
            </Text>
          </View>
        }
        ListFooterComponent={
          <Button className="mt-4" size={"lg"} onPress={handleMementosSelected}>
            <ButtonText>
              {selectedCount > 0
                ? `Select Mementos (${selectedCount})`
                : "Select Mementos"}
            </ButtonText>
          </Button>
        }
      />
    </SafeAreaView>
  );
}
