/**
 * @description Hook for requesting camera permissions and fetching
 *      photos/EXIF metadata from the device's camera or image library.
 * @requirements FR-4, FR-6, FR-7
 */
import { useState, useEffect } from "react";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

export type DeviceSource = "picker" | "camera";
export type Photo = ImagePicker.ImagePickerAsset;

interface UsePhotosProps {
  initialPhotos?: Photo[];
}

export default function usePhotos({ initialPhotos = [] }: UsePhotosProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const addPhotos = async (source: DeviceSource) => {
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
      setPhotos((prevPhotos) => [...prevPhotos, ...result.assets]);
    }
  };

  const removePhoto = (photoToRemove: Photo) => {
    setPhotos((prevPhotos) =>
      prevPhotos.filter((photo) => photo.assetId !== photoToRemove.assetId),
    );
  };

  return {
    hasPermission,
    photos,
    addPhotos,
    removePhoto,
    setPhotos,
  };
}
