import { useState, useEffect } from "react";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

export type DeviceSource = "picker" | "camera";
export type Photo = ImagePicker.ImagePickerAsset;

/**
 * Hook for requesting camera permissions and fetching photos
 * from the device's camera or image library.
 */
export default function usePhotos() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const getPhotos = async (source: DeviceSource): Promise<Photo[]> => {
    let operation =
      source === "camera"
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;

    let result = await operation({
      mediaTypes: ["images"],
      quality: 1,
      exif: true,
      allowsMultipleSelection: source === "picker",
    });

    if (!result.canceled) {
      return result.assets;
    }
    return [];
  };

  return {
    hasPermission,
    getPhotos,
  };
}
