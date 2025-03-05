/**
 * @description Hook for:
 *      - requesting camera permissions
 *      - fetching photos/EXIF metadata from device's camera or image library
 *      - calling background removal API and handling accept/reject result actions
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

    // Get photos from device source
    let result = await operation({
      mediaTypes: ["images"],
      quality: 1,
      exif: true,
      allowsMultipleSelection: source === "picker",
    });

    if (!result.canceled) {
      const { assets: newPhotos } = result;
      // Update photos
      setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);

      // Get base64 images for each removed background
      const processedPhotoStrings = await Promise.all(
        newPhotos.map(removeBackground),
      );
      // Include metadata with processed photo and ignore empty base64 strings
      setPendingProcessedPhotos(
        processedPhotoStrings
          .map((photoString, idx) => ({
            ...newPhotos[idx],
            uri: photoString,
          }))
          .filter((p) => !!p.uri),
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
  const removeBackground = async (photo: Photo): Promise<string> => {
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

      // Convert binary blob result to base64 image string
      return new Promise<string>((resolve) => {
        const fileReaderInstance = new FileReader();
        fileReaderInstance.readAsDataURL(response as Blob);
        fileReaderInstance.onload = () => {
          resolve(fileReaderInstance.result as string);
        };
      });
    } catch (error) {
      console.error("Failed to remove image background:", error);
      return "";
    }
  };

  // Accept removed background result
  const acceptProcessedPhoto = (newPhoto: Photo) => {
    setPhotos((prevPhotos) =>
      prevPhotos.map((p) => (p.assetId === newPhoto.assetId ? newPhoto : p)),
    );
    rejectProcessedPhoto(newPhoto);
  };

  // Reject removed background result
  const rejectProcessedPhoto = (processedPhoto: Photo) => {
    setPendingProcessedPhotos((prev) =>
      prev.filter((p) => p.assetId !== processedPhoto.assetId),
    );
  };

  return {
    hasPermission,
    photos,
    addPhotos,
    removePhoto,
    setPhotos,
    pendingProcessedPhotos,
    acceptProcessedPhoto,
    rejectProcessedPhoto,
  };
}
