import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { useSession } from "@/context/AuthContext";
import { Image } from "@/components/ui/image";

const headerLeft = () => {
  return (
    <Image
      size="sm"
      source={require("@/assets/images/react-logo.png")}
      alt="Memento Logo"
    />
  );
};

const headerRight = () => {
  const { session } = useSession();

  return (
    <Avatar size={"md"}>
      <AvatarFallbackText>
        {session?.user.user_metadata.full_name}
      </AvatarFallbackText>
      <AvatarImage
        source={{
          uri: session?.user.user_metadata.avatar_url,
        }}
      />
    </Avatar>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="mementos"
        options={{
          title: "Mementos",
          headerLeft,
          headerRight,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: "Collections",
          headerLeft,
          headerRight,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
