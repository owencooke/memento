import { getUsersMementosApiUserUserIdMementoGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { ButtonIcon, Button } from "@/src/components/ui/button";
import {
  EditIcon,
  InfoIcon,
  ShareIcon,
  TrashIcon,
} from "@/src/components/ui/icon";
import { Image } from "@/src/components/ui/image";
import { Text } from "@/src/components/ui/text";
import { useSession } from "@/src/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";

const buttonClasses = "flex-1";
const iconClasses = "w-6 h-6";

export default function ViewMemento() {
  const { session } = useSession();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: mementos } = useQuery({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
    // Don't call API again when page loaded
    refetchOnMount: false,
  });

  const memento = mementos?.find((m) => m.id === Number(id));

  return (
    <SafeAreaView className="flex-1 bg-primary-500" edges={["bottom"]}>
      <View className="flex-1 bg-background-100 p-6 flex gap-8">
        {memento && (
          <>
            <PagerView style={{ flex: 1, flexGrow: 1 }} initialPage={0}>
              {memento.images.map((image, index) => (
                <View key={index}>
                  <Image
                    source={{ uri: image.url }}
                    className="w-full h-full"
                    alt=""
                    resizeMode="cover"
                  />
                </View>
              ))}
            </PagerView>
            <View className="bg-background-0 rounded-3xl shadow-hard-3 p-4">
              {memento.caption && (
                <Text size="2xl" italic className="font-light">
                  {memento.caption}
                </Text>
              )}
            </View>
          </>
        )}
      </View>
      <View className="flex flex-row justify-between items-center bg-primary-500">
        <Button size="xl" className={buttonClasses}>
          <ButtonIcon as={InfoIcon} className={iconClasses} />
        </Button>
        <Button size="xl" className={buttonClasses}>
          <ButtonIcon as={EditIcon} className={iconClasses} />
        </Button>
        <Button size="xl" className={buttonClasses}>
          <ButtonIcon as={TrashIcon} className={iconClasses} />
        </Button>
        <Button size="xl" className={buttonClasses}>
          <ButtonIcon as={ShareIcon} className={iconClasses} />
        </Button>
      </View>
    </SafeAreaView>
  );
}
