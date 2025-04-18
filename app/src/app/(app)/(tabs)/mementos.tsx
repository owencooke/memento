import { Fab, FabIcon } from "@/src/components/ui/fab";
import { AddIcon } from "@/src/components/ui/icon";
import { router } from "expo-router";
import { View, RefreshControl } from "react-native";
import { useState } from "react";
import { useColors } from "@/src/hooks/useColors";
import {
  Input,
  InputField,
  InputIcon,
  InputSlot,
} from "@/src/components/ui/input";
import { SearchIcon } from "@/src/components/ui/icon";
import { Button, ButtonIcon } from "@/src/components/ui/button";
import { ListFilter } from "lucide-react-native";
import FilterMementoSheet, {
  FilterMementoFormData,
} from "@/src/components/inputs/FilterMementoSheet";
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
import { Grid2x2Plus } from "lucide-react-native";
import { useMementos } from "@/src/hooks/useMementos";
import { toISODateString } from "@/src/libs/date";
import { Badge, BadgeText } from "@/src/components/ui/badge";
import MementoGrid from "@/src/components/lists/MementoGrid";
import { MementoWithImages } from "@/src/api-client/generated";

export default function Mementos() {
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [showCreateOptions, setShowCreateOptions] = useState(false);

  const { getColor } = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const refreshColor = getColor("tertiary-500");

  const {
    mementos,
    refetch,
    setFilters,
    activeFilterCount,
    searchText,
    setSearchText,
  } = useMementos();

  const closeCreateOptions = () => setShowCreateOptions(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleViewMemento = (memento: MementoWithImages) =>
    router.push(`/(app)/(screens)/memento/${memento.id}`);

  const handleAddMemento = () => {
    closeCreateOptions();
    router.push("/(app)/(screens)/memento/create/single");
  };

  const handleBulkCreate = () => {
    closeCreateOptions();
    router.push("/(app)/(screens)/memento/create/bulk");
  };

  const handleApplyFilters = (data: FilterMementoFormData) => {
    const { start_date, end_date, location, image_label } = data;
    setFilters({
      start_date: start_date ? toISODateString(start_date) : null,
      end_date: end_date ? toISODateString(end_date) : null,
      bbox: location.bbox ?? null,
      image_label: image_label ?? null,
    });
    setShowActionsheet(false);
  };

  return (
    <View className="flex-1 bg-background-100 py-4 px-6">
      <View className="flex-row items-center gap-x-2 mb-4">
        <Input className="flex-1 bg-background-0">
          <InputSlot className="pl-3">
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField
            testID="mementos-search-bar"
            placeholder="Search..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </Input>

        <Button
          testID="mementos-filter-button"
          size="md"
          variant="link"
          className="rounded-full p-3.5 relative"
          onPress={() => setShowActionsheet(true)}
        >
          <ButtonIcon as={ListFilter} />
          {activeFilterCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 z-10 h-[18px] w-[18px] p-0 bg-tertiary-600 rounded-full flex items-center justify-center"
              variant="solid"
            >
              <BadgeText className="text-white">{activeFilterCount}</BadgeText>
            </Badge>
          )}
        </Button>
      </View>
      <MementoGrid
        mementos={mementos}
        onMementoPress={handleViewMemento}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[refreshColor]}
            tintColor={refreshColor}
          />
        }
      />
      <Fab
        size="lg"
        onPress={() => setShowCreateOptions(true)}
        testID="fab-create-memento"
      >
        <FabIcon as={AddIcon} />
        <Actionsheet isOpen={showCreateOptions} onClose={closeCreateOptions}>
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
                as={Grid2x2Plus}
              />
              <ActionsheetItemText size="xl">
                Create multiple mementos
              </ActionsheetItemText>
            </ActionsheetItem>
          </ActionsheetContent>
        </Actionsheet>
      </Fab>
      <FilterMementoSheet
        visible={showActionsheet}
        setVisible={setShowActionsheet}
        onSubmit={handleApplyFilters}
      />
    </View>
  );
}
