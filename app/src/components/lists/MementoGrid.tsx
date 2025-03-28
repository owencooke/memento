import React, { useMemo } from "react";
import { FlatList, FlatListProps, Pressable, View } from "react-native";
import { MementoWithImages } from "@/src/api-client/generated";
import MementoCard from "@/src/components/cards/MementoCard";
import { Text } from "@/src/components/ui/text";

interface MementoGridProps<ItemT extends MementoWithImages>
  extends Omit<
    FlatListProps<ItemT | { spacer: boolean }>,
    "data" | "renderItem" | "keyExtractor"
  > {
  mementos: ItemT[];
  onMementoPress?: (memento: ItemT) => void;
  emptyMessage?: string;
}

// A reusable grid component for displaying mementos.
export default function MementoGrid<ItemT extends MementoWithImages>({
  mementos,
  onMementoPress = () => {},
  emptyMessage = "No mementos yet!",
  numColumns = 2,
  ...restProps
}: MementoGridProps<ItemT>) {
  // Calculate spacers needed to complete the last row
  // (so last memento doesn't expand to fill multiple columns)
  const gridData = useMemo(() => {
    if (!mementos?.length) return [];
    const spacers = Array(
      (numColumns - (mementos.length % numColumns)) % numColumns,
    )
      .fill(null)
      .map((_, i) => ({ spacer: true, id: `spacer-${i}` }));
    return [...mementos, ...spacers];
  }, [mementos, numColumns]);

  const showText = numColumns <= 2;

  return (
    <FlatList
      columnWrapperStyle={{ gap: 12 }}
      contentContainerStyle={{ gap: 12, flexGrow: 1 }}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
      data={gridData}
      keyExtractor={(item, index) =>
        "spacer" in item ? `spacer-${index}` : String(item.id)
      }
      renderItem={({ item }) =>
        "spacer" in item ? (
          <View className="flex-1" />
        ) : (
          <Pressable
            className="flex-1"
            onPress={() => onMementoPress(item as ItemT)}
          >
            <MementoCard {...item} showText={showText} />
          </Pressable>
        )
      }
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center">
          <Text>{emptyMessage}</Text>
        </View>
      }
      {...restProps}
    />
  );
}
