import { getUsersMementosApiUserUserIdMementoGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import MementoCard from "@/src/components/cards/MementoCard";
import { Fab, FabIcon } from "@/src/components/ui/fab";
import { AddIcon, EditIcon, EyeOffIcon } from "@/src/components/ui/icon";
import { useSession } from "@/src/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import { useMemo, useState } from "react";
import { useColors } from "@/src/hooks/useColors";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetIcon,
  ActionsheetItem,
  ActionsheetItemText,
} from "@/src/components/ui/actionsheet";

export default function Mementos() {
  const { session } = useSession();

  const { getColor } = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const refreshColor = getColor("tertiary-500");

  const [showCreateOptions, setShowCreateOptions] = useState(false);

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

  const handleViewMemento = (id: number) =>
    router.push(`/(app)/(screens)/(memento)/${id}`);

  const handleAddMemento = () => {
    handleCloseModal();
    router.push("/(app)/(screens)/(memento)/create");
  };

  const handleBulkCreate = () => {
    handleCloseModal();
    router.push("/(app)/(screens)/(memento)/create/bulk");
  };

  const handleCloseModal = () => setShowCreateOptions(false);

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

      <Fab size="lg" onPress={() => setShowCreateOptions(true)}>
        <FabIcon as={AddIcon} />
      </Fab>
      <Actionsheet isOpen={showCreateOptions} onClose={handleCloseModal}>
        <ActionsheetBackdrop />
        <ActionsheetContent>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <ActionsheetItem onPress={handleAddMemento}>
            <ActionsheetIcon
              size="lg"
              className="stroke-background-700"
              as={AddIcon}
            />
            <ActionsheetItemText size="xl">
              Create a single memento
            </ActionsheetItemText>
          </ActionsheetItem>
          <ActionsheetItem onPress={handleBulkCreate}>
            <ActionsheetIcon
              size="lg"
              className="stroke-background-700"
              // TODO: find a good icon representation
              //   as={EyeOffIcon}
            />
            <ActionsheetItemText size="xl">
              Create several at once
            </ActionsheetItemText>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
}
