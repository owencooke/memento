import { Button, ButtonText } from "@/src/components/ui/button";
import { Center } from "@/src/components/ui/center";
import { Text } from "@/src/components/ui/text";
import usePhotos, { Photo, DeviceSource } from "@/src/hooks/usePhotos";
import { useState } from "react";
import { Image } from "@/src/components/ui/image";
import { View } from "react-native";
import { ScrollView } from "react-native";

export default function Collections() {
  const { hasPermission, getPhotos } = usePhotos();
  const [photos, setPhotos] = useState<Photo[]>([]);

  const handleGetPhotos = async (source: DeviceSource) => {
    const newPhotos = await getPhotos(source);
    setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
  };

  if (!hasPermission) {
    return <Text>No access to camera</Text>;
  }
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button onPress={() => handleGetPhotos("picker")}>
        <ButtonText>Select from camera roll</ButtonText>
      </Button>
      <Button onPress={() => handleGetPhotos("camera")}>
        <ButtonText>Take a photo</ButtonText>
      </Button>
      <Center className="flex flex-col gap-2">
        {photos.map((photo, index) => (
          <View key={index}>
            <Image source={photo.uri} size="md" />
            {photo.exif && (
              <Text style={{ marginTop: 5 }}>
                {Object.entries(photo.exif).map(([key, value]) => (
                  <Text key={key}>{`${key}: ${value}\n`}</Text>
                ))}
              </Text>
            )}
          </View>
        ))}
      </Center>
    </ScrollView>
  );
}
