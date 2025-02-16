import React, { useState, useEffect } from "react";
import { View, Button, Image, Text, ScrollView } from "react-native";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

type ImageSource = "picker" | "camera";

export default function CameraPicker() {
  const [hasPermission, setHasPermission] = useState(false);
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const getImages = async (source: ImageSource) => {
    let operation =
      source === "camera"
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

    let result = await operation({
      mediaTypes: ["images"],
      quality: 1,
      exif: true,
    });

    if (!result.canceled) {
      setImages((prevImages) => [...prevImages, ...result.assets]);
    }
  };

  if (hasPermission === false) {
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
      <Button
        title="Select from camera roll"
        onPress={() => getImages("picker")}
      />
      <Button title="Take a photo" onPress={() => getImages("camera")} />
      {images.map((image, index) => (
        <View key={index} style={{ margin: 10 }}>
          <Image
            source={{ uri: image.uri }}
            style={{ width: 200, height: 200 }}
          />
          {image.exif && (
            <Text style={{ marginTop: 5 }}>
              {Object.entries(image.exif).map(([key, value]) => (
                <Text key={key}>{`${key}: ${value}\n`}</Text>
              ))}
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
