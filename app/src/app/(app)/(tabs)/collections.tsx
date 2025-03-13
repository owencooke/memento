import { Text } from "@/src/components/ui/text";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/src/hooks/useColors";
import { useSession } from "@/src/context/AuthContext";
import { getUsersCollectionsApiUserUserIdCollectionGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { Box } from "@/src/components/ui/box";
import { Fab, FabIcon } from "@/src/components/ui/fab";
import { AddIcon } from "@/src/components/ui/icon";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { router } from "expo-router";
import CollectionCard from "@/src/components/cards/CollectionCard";
import { Switch } from "@/src/components/ui/switch";
import MapView, { Marker } from "react-native-maps";

/**
 * @description Screen displaying a list of user created collections
 *
 * @requirements FR-3
 *
 * @return {JSX.Element} The rendered collections tab
 */
export default function Collections() {
  const { session } = useSession();
  const { getColor } = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const refreshColor = getColor("tertiary-500");

  const [showMapView, setShowMapView] = useState(false);

  // Get collections from backend
  const { data: collections, refetch } = useQuery({
    ...getUsersCollectionsApiUserUserIdCollectionGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
  });

  /**
   * transforms collections list to ensure an even grid layout
   *
   * if odd number of collections a spacer element is added to maintain consistent layout
   */
  const gridData = useMemo(
    () =>
      collections?.length && collections.length % 2
        ? [...collections, { spacer: true }]
        : collections,
    [collections],
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleToggleMapView = () => setShowMapView((prev) => !prev);

  /**
   * Navigates the user to the collection creation screen
   */
  const handleAddCollection = () => {
    router.push("/(app)/(screens)/(collection)/create");
  };

  const handleViewCollection = (id: number) => {
    router.push(`/(app)/(screens)/(collection)/${id}`);
  };

  console.log(collections);
  return (
    <Box className="flex-1 py-2 bg-background-100 flex gap-2">
      <View className="flex flex-row gap-2 items-center w-full px-6">
        <Text bold size="md">
          Map View
        </Text>
        {/* TODO: map icon might look nicer? */}
        <Switch
          size="sm"
          value={showMapView}
          onToggle={handleToggleMapView}
          trackColor={{
            true: getColor("primary-500"),
            false: getColor("background-300"),
          }}
          ios_backgroundColor={getColor("background-300")}
          thumbColor={getColor("secondary-100")}
        />
      </View>
      {collections && collections.length > 0 ? (
        showMapView ? (
          <MapView
            style={{
              width: "100%",
              height: "100%",
            }}
            initialRegion={{
              latitude: 52.2681,
              longitude: -113.8112,
              latitudeDelta: 5,
              longitudeDelta: 5,
            }}
          >
            {collections
              .filter((collection) => collection.coordinates)
              .map((collection) => (
                <Marker
                  key={collection.id}
                  coordinate={{
                    latitude: collection.coordinates?.lat!,
                    longitude: collection.coordinates?.long!,
                  }}
                >
                  <Pressable
                    //   className="flex-1"
                    onPress={() => handleViewCollection(collection.id)}
                  >
                    <CollectionCard {...collection} />
                  </Pressable>
                </Marker>
              ))}
          </MapView>
        ) : (
          <FlatList
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12, paddingHorizontal: 24 }}
            showsVerticalScrollIndicator={false}
            data={gridData}
            keyExtractor={(item, index) =>
              "spacer" in item ? `spacer-${index}` : String(item.id)
            }
            renderItem={({ item }) =>
              "spacer" in item ? (
                <Box className="flex-1" />
              ) : (
                <Pressable
                  className="flex-1"
                  onPress={() => handleViewCollection(item.id)}
                >
                  <CollectionCard {...item} />
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
        )
      ) : (
        <Box className="flex-1 items-center justify-center">
          <Text>No collections yet!</Text>
        </Box>
      )}
      <Fab size="lg" onPress={handleAddCollection}>
        <FabIcon as={AddIcon} />
      </Fab>
    </Box>
  );
}
