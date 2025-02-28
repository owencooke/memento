import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/src/components/navigation/HapticTab";
import { IconSymbol } from "@/src/components/ui/IconSymbol";
import TabBarBackground from "@/src/components/ui/TabBarBackground";
import Header from "@/src/components/navigation/Header";
import { useColors } from "@/src/hooks/useColors";

export default function TabLayout() {
  const { getColor } = useColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: getColor("tertiary-500"),
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        header: ({ options }) => <Header title={options.title} />,
      }}
    >
      <Tabs.Screen
        name="mementos"
        options={{
          title: "Mementos",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: "Collections",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
