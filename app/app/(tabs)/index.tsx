import React from "react";
import MapView from "react-native-maps";
import { StyleSheet, View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";

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
        />
      </View>
    </View>
  );
}
