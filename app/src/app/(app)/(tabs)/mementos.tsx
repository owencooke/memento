import { Center } from "@/src/components/ui/center";
import { Fab, FabIcon } from "@/src/components/ui/fab";
import { AddIcon } from "@/src/components/ui/icon";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { ScrollView } from "react-native";

export default function Mementos() {
  const tabBarHeight = useBottomTabBarHeight();

  const handleAddMemento = () => {
    router.push("/(app)/(screens)/(memento)/create");
  };

  return (
    <ScrollView>
      <Center
        // TODO: fix this offset for bottom bar
        className={`w-full h-full bg-slate-400 pb-safe-offset-0`}
        style={{ paddingBottom: tabBarHeight }}
      >
        <Fab placement="bottom right" size="lg" onPress={handleAddMemento}>
          <FabIcon as={AddIcon} />
        </Fab>
      </Center>
    </ScrollView>
  );
}
