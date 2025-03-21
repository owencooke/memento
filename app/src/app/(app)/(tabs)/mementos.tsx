import { getUsersMementosApiUserUserIdMementoGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import MementoCard from "@/src/components/cards/MementoCard";
import { Fab, FabIcon } from "@/src/components/ui/fab";
import { AddIcon } from "@/src/components/ui/icon";
import { useSession } from "@/src/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { View, Text, FlatList, Pressable, RefreshControl } from "react-native";
import { useMemo, useState } from "react";
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
import { BoundingBox } from "@/src/components/inputs/LocationInput";
import { useDebounce } from "@/src/hooks/useDebounce";

const tenMinutesInMs = 10 * 60 * 1000;

interface FilterParams {
  start_date: string | null;
  end_date: string | null;
  bbox: BoundingBox | null;
}

export default function Mementos() {
  const { session } = useSession();
  const { getColor } = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const refreshColor = getColor("tertiary-500");

  // States for search bar text and filter parameters from filter actionsheet
  const [searchText, setSearchText] = useState("");
  const [filterParams, setFilterParams] = useState<FilterParams>({
    start_date: null,
    end_date: null,
    bbox: null,
  });

  const debouncedQueryParams = useDebounce(
    {
      start_date: filterParams.start_date ?? undefined,
      end_date: filterParams.end_date ?? undefined,
      min_lat: filterParams.bbox?.southwest.lat ?? undefined,
      min_long: filterParams.bbox?.southwest.lng ?? undefined,
      max_lat: filterParams.bbox?.northeast.lat ?? undefined,
      max_long: filterParams.bbox?.northeast.lng ?? undefined,
      text: searchText.trim() || undefined,
    },
    600,
  );

  const { data: mementos, refetch } = useQuery({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
      query: debouncedQueryParams,
    }),
    // Keep previous results in cache for certain time period
    staleTime: tenMinutesInMs,
    gcTime: tenMinutesInMs,
    // Keep showing previous data while loading new result
    placeholderData: (previousData) => previousData,
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

  const handleAddMemento = () => {
    router.push("/(app)/(screens)/(memento)/create");
  };

  const handleViewMemento = (id: number) => {
    router.push(`/(app)/(screens)/(memento)/${id}`);
  };

  // Passes the filter actionsheet form data back to memento tab state
  const [showActionsheet, setShowActionsheet] = useState(false);
  const handleApplyFilters = (data: FilterMementoFormData) => {
    setFilterParams({
      start_date: data.start_date?.toISOString().split("T")[0] ?? null,
      end_date: data.end_date?.toISOString().split("T")[0] ?? null,
      bbox: data.location.bbox ?? null,
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
            placeholder="Search..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </Input>
        <Button
          size="md"
          variant="link"
          className="rounded-full p-3.5"
          onPress={() => setShowActionsheet(true)}
        >
          <ButtonIcon as={ListFilter} />
        </Button>
      </View>
      <FlatList
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, flexGrow: 1 }}
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
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text>No mementos yet!</Text>
          </View>
        }
      />
      <Fab size="lg" onPress={handleAddMemento}>
        <FabIcon as={AddIcon} />
      </Fab>
      <FilterMementoSheet
        visible={showActionsheet}
        setVisible={setShowActionsheet}
        onSubmit={handleApplyFilters}
      />
    </View>
  );
}
