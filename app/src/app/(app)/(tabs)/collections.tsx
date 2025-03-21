import { Text } from "@/src/components/ui/text";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/src/hooks/useColors";
import { useSession } from "@/src/context/AuthContext";
import { getUsersCollectionsApiUserUserIdCollectionGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { Box } from "@/src/components/ui/box";
import { Fab, FabIcon, FabLabel } from "@/src/components/ui/fab";
import { AddIcon, GlobeIcon, MenuIcon } from "@/src/components/ui/icon";
import { FlatList, Pressable, RefreshControl, View } from "react-native";
import { router } from "expo-router";
import CollectionCard from "@/src/components/cards/CollectionCard";
import { Switch } from "@/src/components/ui/switch";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet } from "react-native";
import { useMementos } from "@/src/hooks/useMementos";

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
  const { mementos } = useMementos();

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
    router.push("/(app)/(screens)/collection/create");
  };

  const handleViewCollection = (id: number) => {
    router.push(`/(app)/(screens)/collection/${id}`);
  };

  return (
    <Box className="flex-1 bg-background-100">
      {collections && collections.length > 0 ? (
        showMapView ? (
          <MapView style={styles.mapView} initialRegion={initialMapRegion}>
            {collections
              .filter((collection) => collection.coordinates)
              .map((collection) => (
                <Marker
                  key={collection.id}
                  coordinate={{
                    latitude: collection.coordinates?.lat!,
                    longitude: collection.coordinates?.long!,
                  }}
                  title={collection.title}
                  description={collection.caption || undefined}
                  onCalloutPress={() => handleViewCollection(collection.id)}
                  image={
                    collection.mementos.length > 0
                      ? {
                          // width: 100,
                          scale: 0.5,
                          height: 50,
                          width: 50,
                          uri: mementos.find(
                            (m) => m.id === collection.mementos[0].memento_id,
                          )?.images[0].url,
                        }
                      : undefined
                  }
                >
                  {/* <Callout></Callout> */}
                  {/* <Pressable
                    onPress={() => handleViewCollection(collection.id)}
                  >
                    <CollectionCard {...collection} variant="marker" />
                  </Pressable> */}
                </Marker>
              ))}
          </MapView>
        ) : (
          <FlatList
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{
              gap: 12,
              paddingHorizontal: 24,
              paddingVertical: 24,
            }}
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
      {!showMapView && (
        <Fab size="lg" onPress={handleAddCollection}>
          <FabIcon as={AddIcon} />
        </Fab>
      )}
      <Fab
        className="bg-secondary-500 border-secondary-300 data-[hover=true]:bg-secondary-600 data-[hover=true]:border-secondary-400 data-[active=true]:bg-secondary-700 data-[active=true]:border-secondary-700 data-[focus-visible=true]:web:ring-indicator-info"
        placement="bottom left"
        size="lg"
        onPress={handleToggleMapView}
      >
        {/* TODO: replace with better icons once Lucide added; maybe remove label */}
        <FabIcon
          className="text-typography-800 data-[hover=true]:text-typography-800 data-[active=true]:text-typography-800"
          as={showMapView ? MenuIcon : GlobeIcon}
        />
        <FabLabel className="text-typography-800 data-[hover=true]:text-typography-800 data-[active=true]:text-typography-800">
          {showMapView ? "Grid" : "Map"}
        </FabLabel>
      </Fab>
    </Box>
  );
}

// Map View Configurations

const initialMapRegion = {
  latitude: 52.2681,
  longitude: -113.8112,
  latitudeDelta: 5,
  longitudeDelta: 5,
};

const styles = StyleSheet.create({
  mapView: { width: "100%", height: "100%" },
});
