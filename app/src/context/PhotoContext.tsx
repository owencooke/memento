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
import { Dimensions, Modal, View } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { useMutation } from "@tanstack/react-query";
import { removeImageBackgroundApiImageRemoveBackgroundPostMutation } from "@/src/api-client/generated/@tanstack/react-query.gen";
import { formDataBodySerializer } from "@/src/api-client/formData";
import { Button } from "../components/ui/button";
import {
  getPhotosFromLibrary,
  createPhotoObject,
  convertBlobToBase64,
  Photo,
} from "@/src/libs/photos";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeftIcon,
  CircleIcon,
  RectangleVerticalIcon,
} from "lucide-react-native";

export { Photo } from "@/src/libs/photos";
export type DeviceSource = "picker" | "camera";

interface PhotoContextType {
  hasPermission: boolean;
  photos: Photo[];
  addPhotos: (source: DeviceSource) => void;
  deletePhoto: (photoToRemove: Photo) => void;
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  pendingProcessedPhotos: Photo[];
  acceptProcessedPhoto: (newPhoto: Photo) => void;
  rejectProcessedPhoto: (processedPhoto: Photo) => void;
  resetState: () => void;
}
const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export const CameraProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const { height } = Dimensions.get("window");

  const [photos, setPhotos] = useState<Photo[]>([]);
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

  // Show the camera view or select images from library
  const addPhotos = async (source: DeviceSource) => {
    if (source === "camera") {
      showCamera();
    } else {
      getPhotosFromLibrary().then(processPhotos);
    }
  };

  // Take a new photo using the camera view
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

  // Remove a specific photo
  const deletePhoto = useCallback((photoToRemove: Photo) => {
    setPhotos((prevPhotos) =>
      prevPhotos.filter((photo) => photo.assetId !== photoToRemove.assetId),
    );
  }, []);

  // Remove background from an image
  const removeBackground = async (photo: Photo): Promise<string | null> => {
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
      console.log("Failed to remove image background:", error);
      return null;
    }
  };

  // Process the new photos added from camera/library
  const processPhotos = async (newPhotos: Photo[]) => {
    setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);

    if (process.env.EXPO_PUBLIC_DISABLE_BG_REMOVAL !== "true") {
      newPhotos.forEach(async (photo) => {
        try {
          const photoString = await removeBackground(photo);
          if (photoString) {
            setPendingProcessedPhotos((prev) => [
              ...prev,
              {
                ...photo,
                uri: photoString,
              },
            ]);
          }
        } catch (error) {
          console.error(`Failed to process photo ${photo.assetId}:`, error);
        }
      });
    }
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

  const resetState = useCallback(() => {
    setPhotos([]);
    setPendingProcessedPhotos([]);
  }, []);

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
    resetState,
  };

  return (
    <PhotoContext.Provider value={context}>
      {children}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isCameraVisible}
        onRequestClose={hideCamera}
      >
        <SafeAreaView className="flex-1 relative">
          <CameraView
            style={{ flex: 1 }}
            ref={(ref) => setCameraRef(ref)}
            ratio="4:3"
          />
          {/* Rectangle reference overlay */}
          <View className="absolute inset-0 justify-center items-center z-50">
            <RectangleVerticalIcon
              size={height * 0.7}
              strokeWidth={0.1}
              color="#DADADA"
            />
          </View>
          <View className="absolute bottom-0 left-0 right-0 z-20">
            <View className="flex-row items-center justify-between px-6">
              {/* Back Button */}
              <View className="flex-1">
                <Button
                  variant="link"
                  className="w-8 h-8 p-0"
                  onPress={hideCamera}
                  testID="camera-back-button"
                >
                  <ChevronLeftIcon size={32} color="white" />
                </Button>
              </View>

              {/* Capture Button */}
              <View className="flex-1 items-center flex">
                <Button
                  className="w-24 h-24 p-0 m-0"
                  onPress={takePicture}
                  variant="link"
                  testID="camera-capture-button"
                >
                  <CircleIcon size={96} strokeWidth={1.5} color="white" />
                </Button>
              </View>
              <View className="flex-1" />
            </View>
            <View className="h-12 opacity-0" />
          </View>
        </SafeAreaView>
      </Modal>
    </PhotoContext.Provider>
  );
};

// Hook to use the photo context in other components
export const usePhotos = (initialPhotos?: Photo[]) => {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error("usePhotos must be used within a CameraProvider");
  }
  const { setPhotos, resetState } = context;

  const [pendingInitialPhotos, setPendingInitialPhotos] = useState<
    Photo[] | undefined
  >(initialPhotos);

  // Set initial photos provided via hook
  useEffect(() => {
    if (pendingInitialPhotos && pendingInitialPhotos.length > 0) {
      setPhotos([...pendingInitialPhotos]);
      setPendingInitialPhotos([]);
    }
  }, [pendingInitialPhotos, setPhotos]);

  // Reset states when parent using hook unmounted
  useEffect(() => {
    return () => {
      resetState();
      setPendingInitialPhotos([]);
    };
  }, [resetState]);

  return context;
};
