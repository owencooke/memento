import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { uniqueId } from "lodash";
import mime from "mime";

export type Photo = Omit<
  ImagePicker.ImagePickerAsset,
  "width" | "height" | "pairedVideoAsset"
> & {
  storedInCloud?: boolean;
};

/**
 * Create a standardized photo object (compressed and with necessary fields)
 */
export const createPhotoObject = async (photo: Photo): Promise<Photo> => {
  const { uri, mimeType } = await compressImage(photo);
  const uniqueFilename = uniqueId("photo_");
  return {
    ...photo,
    uri,
    mimeType: mimeType ?? mime.getType(uri) ?? "jpg",
    fileName: photo.fileName ?? `${uniqueFilename}.jpg`,
    assetId: uniqueFilename,
  };
};

/**
 * Get photo(s) from the device's built-in libraary
 *
 * Legacy mode is necessary to extract location metadata from images.
 * User must select through "More Options" > "Browse" instead of default screen
 * https://github.com/expo/expo/issues/24652#issuecomment-2669183057
 */
export const getPhotosFromLibrary = async (): Promise<Photo[]> => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 1,
    exif: true,
    allowsMultipleSelection: true,
    legacy: true,
  });

  if (result.canceled) return [];

  return await Promise.all(
    result.assets.map(async (photo) => createPhotoObject(photo)),
  );
};

/**
 * Converts a binary Blob to base64 URI.
 * Allows images to render a blob via source/uri by:
 *  1. encoding the binary image data into a base64 image string
 *  2. prefixing the string with data:image/png;base64,
 *
 * Reference: https://stackoverflow.com/a/78849297
 */
export const convertBlobToBase64Uri = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });

/**
 * Repeatedly compress the image until the size is small enough
 */
const compressImage = async (
  photo: Photo,
  maxSizeBytes: number = 500 * 1024, // 500KB
  initialCompression: number = 0.8,
  compressionStep: number = 0.2,
) => {
  let { uri, mimeType } = photo;
  let fileSize = await getFileSize(uri);
  let quality = initialCompression;

  while (fileSize > maxSizeBytes && quality > 0.1) {
    const compressedImage = await ImageManipulator.manipulateAsync(uri, [], {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    fileSize = await getFileSize(compressedImage.uri);
    uri = compressedImage.uri;
    quality -= compressionStep;
  }

  return {
    uri,
    mimeType: quality !== initialCompression ? "image/jpeg" : mimeType,
  };
};

/**
 * Get file size of an image on device
 */
const getFileSize = async (uri: string): Promise<number> => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists ? info.size : 0;
  } catch (error) {
    console.error("Error getting file size:", error);
    return 0;
  }
};
