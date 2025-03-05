/**
 * @description Hook for requesting camera permissions and fetching
 *      photos/EXIF metadata from the device's camera or image library.
 * @requirements FR-4, FR-6, FR-7, FR-10
 */
import { useState, useEffect } from "react";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { removeImageBackgroundApiImageRemoveBackgroundPostMutation } from "../api-client/generated/@tanstack/react-query.gen";
import { formDataBodySerializer } from "../api-client/formData";

export type DeviceSource = "picker" | "camera";
export type Photo = Omit<
  ImagePicker.ImagePickerAsset,
  "width" | "height" | "pairedVideoAsset"
> & {
  storedInCloud?: boolean;
  isProcessed?: boolean;
};

interface UsePhotosProps {
  initialPhotos?: Photo[];
}

export default function usePhotos({ initialPhotos = [] }: UsePhotosProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [pendingProcessedPhotos, setPendingProcessedPhotos] = useState<Photo[]>(
    [],
  );

  // Check device has permissions for camera access
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Add new photos
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
      const photoStrings = await Promise.all(
        result.assets.map(removeBackground),
      );
      setPendingProcessedPhotos(
        photoStrings
          .filter((photoString) => photoString !== undefined)
          .map((photoString) => ({ uri: photoString })),
      );
    }
  };

  // Remove a selected photo
  const removePhoto = (photoToRemove: Photo) => {
    setPhotos((prevPhotos) =>
      prevPhotos.filter((photo) => photo.assetId !== photoToRemove.assetId),
    );
  };

  // Remove background from an image
  const removeBgMutation = useMutation(
    removeImageBackgroundApiImageRemoveBackgroundPostMutation(),
  );
  const removeBackground = async (
    photo: Photo,
  ): Promise<string | undefined> => {
    try {
      const body: any = {
        image_file: {
          uri: photo.uri,
          type: photo.mimeType,
          name: photo.fileName,
        },
      };

      // Call POST endpoint to remove background
      const response = await removeBgMutation.mutateAsync({
        body,
        bodySerializer: formDataBodySerializer.bodySerializer,
      });

      //   console.log(response);

      return new Promise<string>((resolve) => {
        const fileReaderInstance = new FileReader();
        fileReaderInstance.readAsDataURL(response as Blob);
        fileReaderInstance.onload = () => {
          resolve(fileReaderInstance.result as string);
        };
      });
    } catch (error) {
      console.error("Failed to remove image background:", error);
    }
  };

  // Replace a photo with a new version
  const replacePhoto = (originalPhoto: Photo, newPhoto: Photo) => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((p) =>
        p.assetId === originalPhoto.assetId ? newPhoto : p,
      ),
    );
  };

  return {
    hasPermission,
    photos,
    addPhotos,
    removePhoto,
    setPhotos,
    replacePhoto,
    pendingProcessedPhotos,
  };
}
