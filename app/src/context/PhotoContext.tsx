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
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { useMutation } from "@tanstack/react-query";
import { removeImageBackgroundApiImageRemoveBackgroundPostMutation } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { formDataBodySerializer } from "@/src/api-client/formData";
import { convertBlobToBase64 } from "@/src/libs/blob";
import { Button, ButtonText } from "../components/ui/button";

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

// Max image size and compression constants
const MAX_IMAGE_SIZE_BYTES = 500 * 1024; // 500KB
const INITIAL_COMPRESSION = 0.8;
const COMPRESSION_STEP = 0.2;

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

  // Compress image to reduce size
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

  // Get file size
  const getFileSize = async (uri: string) => {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      return info.exists ? info.size : 0;
    } catch (error) {
      console.error("Error getting file size:", error);
      return 0;
    }
  };

  // Take photo using expo-camera
  const takePicture = async (): Promise<Photo[]> => {
    if (!cameraRef) return [];

    try {
      const photo = await cameraRef.takePictureAsync({ exif: true });

      // Generate a unique ID for the photo
      const assetId = `camera_${Date.now()}`;

      // Compress the image
      if (!photo) {
        throw new Error("Photo URI is undefined");
      }
      const { uri, mimeType } = await compressImage({
        ...photo,
        assetId,
        mimeType: "image/jpeg",
      });

      const newPhoto: Photo = {
        uri,
        assetId,
        mimeType,
        fileName: `photo_${assetId}.jpg`,
      };

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

  // Get photos from the image picker
  const getPhotosFromImagePicker = async (): Promise<Photo[]> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      exif: true,
      allowsMultipleSelection: true,
    });

    if (result.canceled) return [];

    return await Promise.all(
      result.assets.map(async (photo) => {
        const { uri, mimeType } = await compressImage(photo as Photo);
        return {
          ...photo,
          uri,
          mimeType,
        } as Photo;
      }),
    );
  };

  // Add photos from either camera or image picker
  const addPhotos = async (source: DeviceSource): Promise<Photo[]> => {
    if (source === "camera") {
      showCamera();
      return []; // The actual photos will be added when takePicture is called
    } else {
      const newPhotos = await getPhotosFromImagePicker();
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

  // Create context value
  const contextValue: PhotoContextType = {
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
    <PhotoContext.Provider value={contextValue}>
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
