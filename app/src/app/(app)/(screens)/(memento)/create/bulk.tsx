/**
 * @description Screen for creating multiple new keepsake/mementos in bulk.
 * @requirements FR-22, FR-23
 */

import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import DraggableGrid from "react-native-draggable-grid";

interface GridItem {
  key: string;
  uri: string;
}

type Groups = Record<string, GridItem[]>;

const initialGroups: Groups = {
  group1: [
    { key: "1", uri: "https://via.placeholder.com/100" },
    { key: "2", uri: "https://via.placeholder.com/100/222" },
  ],
  group2: [
    { key: "3", uri: "https://via.placeholder.com/100/444" },
    { key: "4", uri: "https://via.placeholder.com/100/666" },
  ],
};

export default function BulkCreateMemento() {
  const [groups, setGroups] = useState<Groups>(initialGroups);
  const [draggedItem, setDraggedItem] = useState<GridItem | null>(null);
  const [sourceGroup, setSourceGroup] = useState<string | null>(null);

  const handleDragStart = (item: GridItem, groupKey: string) => {
    setDraggedItem(item);
    setSourceGroup(groupKey);
  };

  const handleDragEnd = (groupKey: string, newData: GridItem[]) => {
    setGroups((prev) => ({
      ...prev,
      [groupKey]: newData,
    }));
  };

  const handleDropOutside = (targetGroup: string) => {
    if (!draggedItem || !sourceGroup || sourceGroup === targetGroup) return;

    setGroups((prev) => {
      const updatedSourceGroup = prev[sourceGroup].filter(
        (item) => item.key !== draggedItem.key,
      );

      const updatedTargetGroup = [...prev[targetGroup], draggedItem];

      return {
        ...prev,
        [sourceGroup]: updatedSourceGroup,
        [targetGroup]: updatedTargetGroup,
      };
    });

    // Reset drag state
    setDraggedItem(null);
    setSourceGroup(null);
  };

  return (
    <SafeAreaView className="flex-1" edges={["bottom"]}>
      <View style={styles.container}>
        {Object.entries(groups).map(([groupKey, items]) => (
          <View key={groupKey} style={styles.gridContainer}>
            <Text>{groupKey}</Text>
            <DraggableGrid<GridItem>
              data={items}
              renderItem={(item) => (
                <Image source={{ uri: item.uri }} style={styles.image} />
              )}
              onDragStart={(draggedItem) =>
                handleDragStart(draggedItem, groupKey)
              }
              onDragRelease={(newData) => handleDragEnd(groupKey, newData)}
              numColumns={2}
            />
            <View
              style={styles.dropZone}
              onLayout={() => handleDropOutside(groupKey)}
            />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  gridContainer: { marginBottom: 20 },
  image: { width: 50, height: 50, borderRadius: 8 },
  dropZone: { height: 50, backgroundColor: "#f0f0f0", marginTop: 10 },
});
