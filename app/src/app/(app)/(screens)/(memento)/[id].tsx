/**
 * @description Screen for viewing an individual keepsake/memento.
 * @requirements FR-26, FR-27, FR-28
 */
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
import { router, useLocalSearchParams } from "expo-router";
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
  const { data: mementos } = useQuery({
    ...getUsersMementosApiUserUserIdMementoGetOptions({
      path: {
        user_id: session?.user.id ?? "",
      },
    }),
    refetchOnMount: false,
  });
  const memento = mementos?.find((m) => m.id === Number(id));

  // State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageMetadata, setShowImageMetadata] = useState(false);

  // Handlers
  const handleImageSelected = (e: PagerViewOnPageSelectedEvent) => {
    setCurrentImageIndex(e.nativeEvent.position);
  };

  const handleShowMoreDetails = () => setShowImageMetadata((prev) => !prev);

  const handleEditMemento = () =>
    router.push(`/(app)/(screens)/(memento)/edit/${memento?.id}`);

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
              {memento.images.length > 1 && (
                <View className="flex-row justify-center">
                  {memento.images.map((_, index) => (
                    <View
                      key={index}
                      className={`h-2 w-2 mx-1 rounded-full bg-primary-500 ${
                        currentImageIndex !== index && "opacity-30"
                      }`}
                    />
                  ))}
                </View>
              )}
            </View>
            {/* Details Card */}
            {(memento.caption ||
              memento.date ||
              memento.location ||
              showImageMetadata) && (
              <View className="bg-background-0 rounded-3xl shadow-hard-3 p-4">
                {showImageMetadata ? (
                  <ImageMetadataCard
                    image={memento.images[currentImageIndex]}
                  />
                ) : (
                  <>
                    <Text size="2xl" italic className="font-light mb-2">
                      {memento.caption}
                    </Text>
                    <View className="flex flex-row justify-between items-center mt-auto font-medium">
                      <Text className="flex-1">{memento.date}</Text>
                      <Text className="flex-1 text-right">
                        {memento.location}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}
          </>
        )}
      </View>
      {/* Options bar (info, edit, delete, share) */}
      <View className="flex flex-row justify-between items-center bg-primary-500">
        {/* TODO: open Share options */}
        <Button size="xl" className={buttonClasses}>
          <ButtonIcon as={ShareIcon} className={iconClasses} />
        </Button>
        <Button
          size="xl"
          className={buttonClasses}
          onPress={handleShowMoreDetails}
        >
          <ButtonIcon
            as={InfoIcon}
            className={`${iconClasses} ${showImageMetadata && "text-tertiary-500"}`}
          />
        </Button>
        <Button size="xl" className={buttonClasses} onPress={handleEditMemento}>
          <ButtonIcon as={EditIcon} className={iconClasses} />
        </Button>
        {/* TODO: open Delete confirmation modal */}
        <Button size="xl" className={buttonClasses}>
          <ButtonIcon as={TrashIcon} className={iconClasses} />
        </Button>
      </View>
    </SafeAreaView>
  );
}
