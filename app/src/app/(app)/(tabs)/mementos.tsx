import { getUsersMementosApiUserUserIdMementoGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { Fab, FabIcon } from "@/src/components/ui/fab";
import { AddIcon } from "@/src/components/ui/icon";
import { useSession } from "@/src/context/AuthContext";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ScrollView, View, Text } from "react-native";

export default function Mementos() {
  const tabBarHeight = useBottomTabBarHeight();
  const { session } = useSession();

  const {
    data: mementos,
    error,
    isLoading,
  } = useQuery({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
  });

  const handleAddMemento = () => {
    router.push("/(app)/(screens)/(memento)/create");
  };

  console.log(mementos);

  return (
    <ScrollView>
      <View
        // TODO: fix this offset for bottom bar
        className={`w-full h-full bg-slate-400 pb-safe-offset-0`}
        style={{ paddingBottom: tabBarHeight }}
      >
        <View className="flex flex-wrap flex-row gap-[2%]">
          {mementos &&
            mementos.length > 0 &&
            mementos.map((memento, index) => (
              <View key={index} className="relative basis-[32%] aspect-square">
                <Text>{JSON.stringify(memento)}</Text>
              </View>
            ))}
        </View>
        <Fab placement="bottom right" size="lg" onPress={handleAddMemento}>
          <FabIcon as={AddIcon} />
        </Fab>
      </View>
    </ScrollView>
  );
}
