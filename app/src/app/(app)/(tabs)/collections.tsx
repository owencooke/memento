import { Button, ButtonIcon, ButtonText } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import usePhotos from "@/src/hooks/usePhotos";
import { Image } from "@/src/components/ui/image";
import { View } from "react-native";
import { ScrollView } from "react-native";
import { TrashIcon } from "@/src/components/ui/icon";

export default function Collections() {
  const { hasPermission, addPhotos, photos, removePhoto } = usePhotos();

  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBlock: 8,
      }}
    >
      <Button onPress={() => addPhotos("camera")}>
        <ButtonText>Take a photo</ButtonText>
      </Button>
      <Button className="my-4" onPress={() => addPhotos("picker")}>
        <ButtonText>Select from camera roll</ButtonText>
      </Button>
      <>
        {photos.map((photo, index) => (
          <View key={index}>
            <Image source={photo.uri} size="xl" alt="" />
            {photo.exif && (
              <Text style={{ marginTop: 5 }}>
                {Object.entries(photo.exif).map(([key, value]) => (
                  <Text key={key}>{`${key}: ${value}\n`}</Text>
                ))}
              </Text>
            )}
            <Button
              size="lg"
              className="rounded-full p-3.5"
              onPress={() => removePhoto(photo)}
            >
              <ButtonIcon as={TrashIcon} />
            </Button>
          </View>
        ))}
      </>
    </ScrollView>
  );
}
