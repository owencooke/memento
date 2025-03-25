/**
 * @description Context for:
 *      - requesting camera permissions
 *      - fetching photos/EXIF metadata from device's camera or image library
 *      - drawing a rectangle reference overlay over device's camera
 *      - calling background removal API and handling accept/reject result actions
 * @requirements FR-4, FR-5, FR-6, FR-7, FR-10
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { View } from "react-native";
import { Camera, CameraView } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { removeImageBackgroundApiImageRemoveBackgroundPostMutation } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { formDataBodySerializer } from "@/src/api-client/formData";
import { Button, ButtonText } from "../components/ui/button";
import {
  getPhotosFromLibrary,
  createPhotoObject,
  convertBlobToBase64,
} from "@/src/libs/photos";

export type Photo = Omit<
  ImagePicker.ImagePickerAsset,
  "width" | "height" | "pairedVideoAsset"
> & {
  storedInCloud?: boolean;
};

export type DeviceSource = "picker" | "camera";

interface PhotoContextType {
  hasPermission: boolean;
  photos: Photo[];
  addPhotos: (source: DeviceSource) => Promise<Photo[]>;
  deletePhoto: (photoToRemove: Photo) => void;
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  pendingProcessedPhotos: Photo[];
  acceptProcessedPhoto: (newPhoto: Photo) => void;
  rejectProcessedPhoto: (processedPhoto: Photo) => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

interface CameraProviderProps {
  children: React.ReactNode;
  initialPhotos?: Photo[];
}

export const CameraProvider: React.FC<CameraProviderProps> = ({
  children,
  initialPhotos = [],
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [pendingProcessedPhotos, setPendingProcessedPhotos] = useState<Photo[]>(
    [],
  );
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);

  const removeBgMutation = useMutation(
    removeImageBackgroundApiImageRemoveBackgroundPostMutation(),
  );

  // Check for camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Remove a specific photo from selection
  const deletePhoto = useCallback((photoToRemove: Photo) => {
    setPhotos((prevPhotos) =>
      prevPhotos.filter((photo) => photo.assetId !== photoToRemove.assetId),
    );
  }, []);

  // Take photo using expo-camera
  const takePicture = async (): Promise<Photo[]> => {
    if (!cameraRef) return [];

    try {
      const capturedPicture = await cameraRef.takePictureAsync({ exif: true });
      if (!capturedPicture) {
        return [];
      }

      const newPhoto = await createPhotoObject(capturedPicture);

      setPhotos((prevPhotos) => [...prevPhotos, newPhoto]);
      setIsCameraVisible(false);

      // Process for background removal if enabled
      if (process.env.EXPO_PUBLIC_DISABLE_BG_REMOVAL !== "true") {
        processPhotos([newPhoto]);
      }

      return [newPhoto];
    } catch (error) {
      console.error("Error taking picture:", error);
      setIsCameraVisible(false);
      return [];
    }
  };

  // Add photos from either camera or image picker
  const addPhotos = async (source: DeviceSource): Promise<Photo[]> => {
    if (source === "camera") {
      showCamera();
      return [];
    } else {
      const newPhotos = await getPhotosFromLibrary();
      setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);

      if (process.env.EXPO_PUBLIC_DISABLE_BG_REMOVAL !== "true") {
        processPhotos(newPhotos);
      }

      return newPhotos;
    }
  };

  // Remove background from image
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

  // Process photos for background removal
  const processPhotos = async (photosToProcess: Photo[]) => {
    photosToProcess.forEach(async (photo) => {
      try {
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

  // Reject processed photo
  const rejectProcessedPhoto = useCallback((processedPhoto: Photo) => {
    setPendingProcessedPhotos((prev) =>
      prev.filter((p) => p.assetId !== processedPhoto.assetId),
    );
  }, []);

  // Accept processed photo with removed background
  const acceptProcessedPhoto = useCallback(
    (newPhoto: Photo) => {
      setPhotos((prevPhotos) =>
        prevPhotos.map((p) => (p.assetId === newPhoto.assetId ? newPhoto : p)),
      );
      rejectProcessedPhoto(newPhoto);
    },
    [rejectProcessedPhoto],
  );

  // Show/hide camera methods
  const showCamera = useCallback(() => setIsCameraVisible(true), []);
  const hideCamera = useCallback(() => setIsCameraVisible(false), []);

  // Create context
  const context: PhotoContextType = {
    hasPermission,
    photos,
    addPhotos,
    deletePhoto,
    setPhotos,
    pendingProcessedPhotos,
    acceptProcessedPhoto,
    rejectProcessedPhoto,
  };

  return (
    <PhotoContext.Provider value={context}>
      {children}

      {isCameraVisible && (
        <View className="absolute inset-0">
          <CameraView
            ref={(ref) => setCameraRef(ref)}
            // type={CameraType.back}
            className="absolute inset-0"
            ratio="16:9"
          >
            <View className="flex-1 justify-end mb-8">
              <View className="flex-row justify-between px-5">
                <View className="flex-1 mr-2">
                  <Button action="secondary" onPress={hideCamera}>
                    <ButtonText>Cancel</ButtonText>
                  </Button>
                </View>
                <View className="flex-1 ml-2">
                  <Button action="primary" onPress={takePicture}>
                    <ButtonText>Take Photo</ButtonText>
                  </Button>
                </View>
              </View>
            </View>
          </CameraView>
        </View>
      )}
    </PhotoContext.Provider>
  );
};

// Hook to use the photo context
export const usePhotos = (initialPhotos?: Photo[]) => {
  const context = useContext(PhotoContext);
  if (context === undefined) {
    throw new Error("usePhotos must be used within a CameraProvider");
  }
  const { setPhotos } = context;

  // If initialPhotos are provided, reset the photos state
  useEffect(() => {
    if (initialPhotos && initialPhotos.length > 0) {
      setPhotos(initialPhotos);
    }
  }, [initialPhotos, setPhotos]);

  return context;
};
