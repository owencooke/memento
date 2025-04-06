import { Tabs } from "expo-router";
import { HapticTab } from "@/src/components/navigation/HapticTab";
import TabBarBackground from "@/src/components/ui/TabBarBackground";
import Header from "@/src/components/navigation/Header";
import { useColors } from "@/src/hooks/useColors";
import { BookHeart, FolderHeart } from "lucide-react-native";

export default function TabLayout() {
  const { getColor } = useColors();

  const primaryColor = getColor("primary-500");

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
          tabBarIcon: ({ color, size }) => (
            <BookHeart size={size} color={color || primaryColor} />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: "Collections",
          tabBarIcon: ({ color, size }) => (
            <FolderHeart size={size} color={color || primaryColor} testID="collections-tab"/>
          ),
        }}
      />
    </Tabs>
  );
}
