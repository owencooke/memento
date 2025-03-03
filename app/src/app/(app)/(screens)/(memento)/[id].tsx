import { getUsersMementosApiUserUserIdMementoGetOptions } from "@/src/api-client/generated/@tanstack/react-query.gen";
import ImageMetadataCard from "@/src/components/cards/ImageMetadataCard";
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
import { useState } from "react";
import { View } from "react-native";
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";

const buttonClasses = "flex-1";
const iconClasses = "w-6 h-6";

export default function ViewMemento() {
  // Get memento
  const { session } = useSession();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(0);
  const { data: mementos } = useQuery({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
    refetchOnMount: false,
  });
  const memento = mementos?.find((m) => m.id === Number(id));

  const [showMetadata, setShowMetadata] = useState(false);

  const handleImageSelected = (e: PagerViewOnPageSelectedEvent) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const handleShowMoreDetails = () => setShowMetadata((prev) => !prev);

  return (
    <SafeAreaView className="flex-1 bg-primary-500" edges={["bottom"]}>
      <View className="flex-1 bg-background-100 p-6 flex gap-6">
        {memento && (
          <>
            <View className="flex-1 flex gap-4">
              {/* Image Carousel */}
              <PagerView
                style={{ flex: 1 }}
                initialPage={0}
                onPageSelected={handleImageSelected}
              >
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
              {/* Pagination dots */}
              <View className="flex-row justify-center">
                {memento.images.map((_, index) => (
                  <View
                    key={index}
                    className={`h-2 w-2 mx-1 rounded-full bg-primary-500 ${
                      currentPage !== index && "opacity-30"
                    }`}
                  />
                ))}
              </View>
            </View>
            {/* Details Card */}
            {(memento.caption || showMetadata) && (
              <View className="bg-background-0 rounded-3xl shadow-hard-3 p-4">
                {showMetadata ? (
                  <ImageMetadataCard image={memento.images[currentPage]} />
                ) : (
                  <Text size="2xl" italic className="font-light">
                    {memento.caption}
                  </Text>
                )}
              </View>
            )}
          </>
        )}
      </View>
      {/* Options bar (info, edit, delete, share) */}
      <View className="flex flex-row justify-between items-center bg-primary-500">
        <Button
          size="xl"
          className={buttonClasses}
          onPress={handleShowMoreDetails}
        >
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
