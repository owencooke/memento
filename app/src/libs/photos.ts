import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { uniqueId } from "lodash";
// import { Photo } from "@/src/context/PhotoContext";

type Photo = Omit<
  ImagePicker.ImagePickerAsset,
  "width" | "height" | "pairedVideoAsset"
> & {
  storedInCloud?: boolean;
};

// Constants
export const MAX_IMAGE_SIZE_BYTES = 500 * 1024; // 500KB
export const INITIAL_COMPRESSION = 0.8;
export const COMPRESSION_STEP = 0.2;

/**
 * Get file size of an image from its URI
 */
export const getFileSize = async (uri: string): Promise<number> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists ? info.size : 0;
  } catch (error) {
    console.error("Error getting file size:", error);
    return 0;
  }
};

/**
 * Repeatedly compress the image until the size is small enough
 */
export const compressImage = async (photo: Photo) => {
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

/**
 * Generate a unique ID for a photo with an optional prefix
 */
export const generatePhotoId = (prefix: string = "photo_"): string => {
  return uniqueId(prefix);
};

/**
 * Create a standardized photo object with required properties
 */
export const createPhotoObject = async (photo: Photo): Promise<Photo> => {
  const { uri, mimeType } = await compressImage(photo as Photo);
  const uniqueFilename = generatePhotoId();

  return {
    ...photo,
    uri,
    mimeType,
    fileName: (photo as any).fileName ?? `${uniqueFilename}.jpg`,
    assetId: photo.assetId ?? uniqueFilename,
  };
};

/**
 * Get photo(s) from the device's built-in photo libraary
 */
export const getPhotosFromLibrary = async (): Promise<Photo[]> => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 1,
    exif: true,
    allowsMultipleSelection: true,
  });

  if (result.canceled) return [];

  return await Promise.all(
    result.assets.map(async (photo) => createPhotoObject(photo)),
  );
};

/**
 * Converts a binary Blob to base64 string.
 * Allows images to render a blob via source/uri
 *
 * Reference: https://stackoverflow.com/a/78849297
 */
export const convertBlobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
