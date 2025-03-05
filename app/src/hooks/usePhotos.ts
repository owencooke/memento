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
import { convertBlobToBase64 } from "../libs/blob";

export type DeviceSource = "picker" | "camera";
export type Photo = Omit<
  ImagePicker.ImagePickerAsset,
  "width" | "height" | "pairedVideoAsset"
> & {
  storedInCloud?: boolean;
};

const getPhotosFromDevice = async (source: DeviceSource): Promise<Photo[]> => {
  const pickFunction =
    source === "camera"
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

  const result = await pickFunction({
    mediaTypes: ["images"],
    quality: 1,
    exif: true,
    allowsMultipleSelection: source === "picker",
  });

  if (result.canceled) return [];
  return result.assets;
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
  const removeBgMutation = useMutation(
    removeImageBackgroundApiImageRemoveBackgroundPostMutation(),
  );

  // Check device has permissions for camera access
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Remove a specific photo from selection
  const deletePhoto = (photoToRemove: Photo) => {
    setPhotos((prevPhotos) =>
      prevPhotos.filter((photo) => photo.assetId !== photoToRemove.assetId),
    );
  };

  // Add new photos
  const addPhotos = async (source: DeviceSource) => {
    const photos = await getPhotosFromDevice(source);
    setPhotos((prevPhotos) => [...prevPhotos, ...photos]);
    processPhotos(photos);
  };

  // Remove background from an image
  const removeBackground = async (photo: Photo): Promise<string> => {
    try {
      const body: any = {
        image_file: {
          uri: photo.uri,
          type: photo.mimeType,
          name: photo.fileName,
        },
      };
      const response = await removeBgMutation.mutateAsync({
        body,
        bodySerializer: formDataBodySerializer.bodySerializer,
      });
      return convertBlobToBase64(response as Blob);
    } catch (error) {
      console.error("Failed to remove image background:", error);
      return "";
    }
  };

  const processPhotos = async (photos: Photo[]) => {
    // Get base64 images for each removed background
    const processedPhotoStrings = await Promise.all(
      photos.map(removeBackground),
    );
    const processedPhotos = processedPhotoStrings
      // Include actual photo details with each base64 string
      .map((photoString, idx) => ({
        ...photos[idx],
        uri: photoString,
      }))
      // Don't include empty base64 strings
      .filter((p) => !!p.uri);
    setPendingProcessedPhotos((prev) => [...prev, ...processedPhotos]);
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
    deletePhoto,
    setPhotos,
    pendingProcessedPhotos,
    acceptProcessedPhoto,
    rejectProcessedPhoto,
  };
}
