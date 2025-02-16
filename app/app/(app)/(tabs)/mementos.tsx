import React from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet, View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";

const markers = [
  {
    id: 1,
    title: "Calgary",
    description: "This is Calgary",
    coordinate: {
      latitude: 51.0447,
      longitude: -114.0719,
    },
  },
  {
    id: 2,
    title: "Edmonton",
    description: "This is Edmonton",
    coordinate: {
      latitude: 53.5461,
      longitude: -113.4938,
    },
  },
  {
    id: 3,
    title: "Banff",
    description: "This is Banff",
    coordinate: {
      latitude: 51.1784,
      longitude: -115.5708,
    },
  },
];

export default function App() {
  return (
    <View className="flex gap-8">
      <Button className="mt-32">
        <ButtonText>Testing</ButtonText>
      </Button>
      <View className="flex w-full h-full">
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
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
            />
          ))}
        </MapView>
      </View>
    </View>
  );
}
