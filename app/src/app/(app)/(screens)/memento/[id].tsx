/**
 * @description Screen for viewing an individual keepsake/memento.
 *    Also supports sharing a memento's images to another platform.
 * @requirements FR-26, FR-27, FR-28, FR-54
 */
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
import { useMementos } from "@/src/hooks/useMementos";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { shareAsync, isAvailableAsync } from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { mimeTypeToExtension } from "@/src/libs/string";

const buttonClasses = "flex-1";
const iconClasses = "w-6 h-6";

export default function ViewMemento() {
  // Get memento
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mementos } = useMementos({
    queryOptions: { refetchOnMount: false },
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
    router.push(`/(app)/(screens)/memento/edit/${memento?.id}`);

  const handleShareImage = async () => {
    try {
      const image = memento?.images[currentImageIndex];
      if (image?.url) {
        // Download the image content to a temp file
        const localUri = `${FileSystem.cacheDirectory}Memento.${mimeTypeToExtension(image.mime_type)}`;
        await FileSystem.downloadAsync(image.url, localUri);

        // Share the downloaded content
        if (await isAvailableAsync()) {
          await shareAsync(localUri, {
            mimeType: image.mime_type,
            UTI: image.mime_type,
          });
        } else {
          console.log("Sharing is not available on this device");
        }
      }
    } catch (error) {
      console.error("Error sharing image:", error);
    }
  };

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
                      testID="view-memento-carousel-image"
                      source={{ uri: image.url }}
                      className="w-full h-full"
                      alt=""
                      resizeMode="contain"
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
                    <Text
                      size="2xl"
                      italic
                      className="font-light mb-2"
                      testID="view-memento-caption"
                    >
                      {memento.caption}
                    </Text>
                    <View className="flex flex-row justify-between items-center mt-auto font-medium">
                      <Text className="flex-1" testID="view-memento-date">
                        {memento.date}
                      </Text>
                      <Text
                        className="flex-1 text-right"
                        testID="view-memento-location"
                      >
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
        <Button size="xl" className={buttonClasses} onPress={handleShareImage}>
          <ButtonIcon as={ShareIcon} className={iconClasses} />
        </Button>
        <Button
          size="xl"
          className={buttonClasses}
          onPress={handleShowMoreDetails}
          testID="view-memento-show-details"
        >
          <ButtonIcon
            as={InfoIcon}
            className={`${iconClasses} ${showImageMetadata && "text-tertiary-500"}`}
          />
        </Button>
        <Button
          size="xl"
          className={buttonClasses}
          onPress={handleEditMemento}
          testID="view-memento-edit-button"
        >
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
