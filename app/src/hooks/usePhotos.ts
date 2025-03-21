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
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
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
  const addPhotos = async (source: DeviceSource): Promise<Photo[]> => {
    const photos = await getPhotosFromDevice(source);
    setPhotos((prevPhotos) => [...prevPhotos, ...photos]);
    if (process.env.EXPO_PUBLIC_DISABLE_BG_REMOVAL !== "true") {
      processPhotos(photos);
    }
    return photos;
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
    photos.forEach(async (photo) => {
      try {
        // Get base64 image for each removed background and update state
        const photoString = await removeBackground(photo);
        setPendingProcessedPhotos((prev) => [
          ...prev,
          {
            ...photo,
            uri: photoString,
          },
        ]);
      } catch (error) {
        console.error(`Failed to process photo ${photo.assetId}:`, error);
      }
    });
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

// HELPER FUNCTIONS

// Get photos from device (via either camera or library)
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
  return await Promise.all(
    result.assets.map(async (photo) => {
      const { uri, mimeType } = await compressImage(photo);
      return {
        ...photo,
        uri,
        mimeType,
      };
    }),
  );
};

// Repeatedly compress the image until the size is small enough
const MAX_IMAGE_SIZE_BYTES = 500 * 1024; // 500KB
const INITIAL_COMPRESSION = 0.8;
const COMPRESSION_STEP = 0.2;

const compressImage = async (photo: Photo) => {
  let { uri, mimeType } = photo;
  let fileSize = await getFileSize(uri);
  let quality = INITIAL_COMPRESSION;

  while (fileSize > MAX_IMAGE_SIZE_BYTES && quality > 0.1) {
    const compressedImage = await ImageManipulator.manipulateAsync(uri, [], {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    fileSize = await getFileSize(compressedImage.uri);
    uri = compressedImage.uri;
    quality -= COMPRESSION_STEP;
  }
  return {
    uri,
    mimeType: quality !== INITIAL_COMPRESSION ? "image/jpeg" : mimeType,
  };
};

const getFileSize = async (uri: string) => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists ? info.size : 0;
  } catch (error) {
    console.error("Error getting file size:", error);
    return 0;
  }
};
