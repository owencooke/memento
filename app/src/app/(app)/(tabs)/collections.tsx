/**
 * @description Screen for displaying a list of user created collections.
 *    User can see collections displayed in a grid view or on a map using their location.
 * @requirements FR-3, FR-51, FR-52
 */

import { Text } from "@/src/components/ui/text";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/src/hooks/useColors";
import { useSession } from "@/src/context/AuthContext";
import { getUsersCollectionsApiUserUserIdCollectionGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { Fab, FabIcon, FabLabel } from "@/src/components/ui/fab";
import { AddIcon } from "@/src/components/ui/icon";
import { FlatList, Platform, Pressable, RefreshControl } from "react-native";
import { router } from "expo-router";
import CollectionCard from "@/src/components/cards/CollectionCard";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet } from "react-native";
import { useMementos } from "@/src/hooks/useMementos";
import { Image } from "@/src/components/ui/image";
import { LayoutGridIcon, MapIcon } from "lucide-react-native";
import { Box } from "@/src/components/ui/box";
import { MementoLogo } from "@/src/components/MementoLogo";

export default function Collections() {
  const { session } = useSession();
  const { getColor } = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const refreshColor = getColor("tertiary-500");

  const [showMapView, setShowMapView] = useState(false);

  // Get collections from backend
  const { data, refetch } = useQuery({
    ...getUsersCollectionsApiUserUserIdCollectionGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
  });
  const { mementos } = useMementos();
  const collections = useMemo(
    () =>
      data
        ? data.map((collection) => {
            const thumbnailUri = mementos.find(
              (m) => m.id === collection.mementos[0]?.memento_id,
            )?.images[0]?.url;
            return {
              ...collection,
              thumbnailUri: thumbnailUri
                ? thumbnailUri
                : `https://placehold.co/400x400.png?text=${collection.title.replace(" ", "+")}`,
            };
          })
        : [],
    [data, mementos],
  );

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
      {showMapView ? (
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
              >
                {Platform.OS === "android" ? (
                  //NOTE: Android does not support rendering custom views with size larger than 40x40px.
                  //   So we render just the thumbnail image as a marker, instead of complex card.
                  <Image
                    className="max-w-10 max-h-10"
                    resizeMode="cover"
                    source={{
                      uri: collection.thumbnailUri,
                    }}
                    alt="Thumbnail for Collection"
                  />
                ) : (
                  <Pressable
                    onPress={() => handleViewCollection(collection.id)}
                  >
                    <CollectionCard {...collection} variant="marker" />
                  </Pressable>
                )}
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
            flexGrow: 1,
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
          ListEmptyComponent={
            <Box className="flex-1 items-center justify-center gap-2">
              <MementoLogo size="lg" variant="sad" />
              <Text size="lg">No collections yet. Start your first one!</Text>
            </Box>
          }
        />
      )}
      {!showMapView && (
        <Fab
          testID="fab-create-collection"
          size="lg"
          onPress={handleAddCollection}
        >
          <FabIcon as={AddIcon} />
        </Fab>
      )}
      <Fab
        className="bg-secondary-500 border-secondary-300 data-[hover=true]:bg-secondary-600 data-[hover=true]:border-secondary-400 data-[active=true]:bg-secondary-700 data-[active=true]:border-secondary-700 data-[focus-visible=true]:web:ring-indicator-info"
        placement="bottom left"
        size="lg"
        onPress={handleToggleMapView}
        testID="view-map-button"
      >
        <FabIcon
          className="text-typography-800 data-[hover=true]:text-typography-800 data-[active=true]:text-typography-800"
          as={showMapView ? LayoutGridIcon : MapIcon}
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
