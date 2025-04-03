import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import {
  Photo,
  createPhotoObject,
  getPhotosFromLibrary,
  convertBlobToBase64Uri,
} from "@/src/libs/photos";
import mime from "mime";

// Setup common test data
const mockPhoto: Photo = {
  uri: "file://test/photo.jpg",
  mimeType: "image/jpeg",
  fileName: "photo.jpg",
  assetId: "asset123",
};

const mockLargeFileInfo = {
  exists: true,
  size: 1024 * 1024, // 1MB
};

const mockSmallFileInfo = {
  exists: true,
  size: 100 * 1024, // 100KB
};

const mockCompressedImage = {
  uri: "file://test/compressed-photo.jpg",
  width: 800,
  height: 600,
};

describe("Photo utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createPhotoObject", () => {
    it("should create a standardized photo object from a photo", async () => {
      // Mock file size check to be small enough to not need compression
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue(
        mockSmallFileInfo,
      );

      // Mock mime.getType to return a default value
      (mime.getType as jest.Mock).mockReturnValue("image/jpeg");

      const result = await createPhotoObject(mockPhoto);

      expect(result).toEqual({
        ...mockPhoto,
        fileName: "photo.jpg", // Original name should be preserved
        assetId: "photo_123456", // Generated by uniqueId
      });
    });

    it("should compress the image if it's too large", async () => {
      // Mock initial file size check to be large
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce(
        mockLargeFileInfo,
      );

      // Mock the file size after compression to be small
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce(
        mockSmallFileInfo,
      );

      // Mock the image manipulator to return compressed image
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue(
        mockCompressedImage,
      );

      const result = await createPhotoObject(mockPhoto);

      // Check that the image was compressed
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        mockPhoto.uri,
        [],
        { compress: 0.8, format: "jpeg" },
      );

      // Check the returned object has the compressed URI and jpeg mimetype
      expect(result).toEqual({
        ...mockPhoto,
        uri: mockCompressedImage.uri,
        mimeType: "image/jpeg",
        fileName: "photo.jpg",
        assetId: "photo_123456",
      });
    });

    it("should handle photo without fileName by generating one", async () => {
      // Mock file size check to be small enough to not need compression
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue(
        mockSmallFileInfo,
      );

      // Mock mime.getType to return a default value
      (mime.getType as jest.Mock).mockReturnValue("image/jpeg");

      const photoWithoutFileName: Photo = {
        uri: "file://test/unknown.jpg",
        mimeType: "image/jpeg",
        assetId: "asset123",
      };

      const result = await createPhotoObject(photoWithoutFileName);

      expect(result).toEqual({
        ...photoWithoutFileName,
        fileName: "photo_123456.jpg", // Generated filename
        assetId: "photo_123456", // Generated by uniqueId
      });
    });

    it("should handle photo without mimeType by inferring from URI", async () => {
      // Mock file size check to be small enough to not need compression
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue(
        mockSmallFileInfo,
      );

      // Mock mime.getType to infer the type
      (mime.getType as jest.Mock).mockReturnValue("image/png");

      const photoWithoutMimeType: Photo = {
        uri: "file://test/photo.png",
        fileName: "photo.png",
        assetId: "asset123",
      };

      const result = await createPhotoObject(photoWithoutMimeType);

      expect(result.mimeType).toBe("image/png");
      expect(mime.getType).toHaveBeenCalledWith(photoWithoutMimeType.uri);
    });
  });

  describe("getPhotosFromLibrary", () => {
    it("should return an empty array if user cancels selection", async () => {
      // Mock image picker to return canceled result
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
        assets: [],
      });

      const result = await getPhotosFromLibrary();

      expect(result).toEqual([]);
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ["images"],
        quality: 1,
        exif: true,
        allowsMultipleSelection: true,
      });
    });

    it("should process and return selected photos", async () => {
      // Mock small file size for compression check
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue(
        mockSmallFileInfo,
      );

      // Mock image picker to return selected assets
      const mockAssets = [
        {
          uri: "file://test/photo1.jpg",
          fileName: "photo1.jpg",
          assetId: "asset1",
          mimeType: "image/jpeg",
        },
        {
          uri: "file://test/photo2.jpg",
          fileName: "photo2.jpg",
          assetId: "asset2",
          mimeType: "image/jpeg",
        },
      ];

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: mockAssets,
      });

      const result = await getPhotosFromLibrary();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("uri", "file://test/photo1.jpg");
      expect(result[1]).toHaveProperty("uri", "file://test/photo2.jpg");
      // Each photo should have a generated assetId
      expect(result[0]).toHaveProperty("assetId", "photo_123456");
      expect(result[1]).toHaveProperty("assetId", "photo_123456");
    });
  });

  describe("convertBlobToBase64Uri", () => {
    it("should convert a blob to a base64 URI", async () => {
      // Create a mock blob
      const mockBlob = new Blob(["test data"], { type: "image/png" });

      const result = await convertBlobToBase64Uri(mockBlob);

      expect(result).toEqual("data:image/png;base64,mockBase64Data");
    });

    it("should handle different MIME types", async () => {
      // Create a mock blob with different MIME type
      const mockBlob = new Blob(["test data"], { type: "image/gif" });

      const result = await convertBlobToBase64Uri(mockBlob);

      expect(result).toEqual("data:image/gif;base64,mockBase64Data");
    });
  });

  describe("compressImage (internal function tested via createPhotoObject)", () => {
    it("should compress an image in multiple steps if needed", async () => {
      // Setup for progressive compression
      // First size check - large file
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: true,
        size: 2 * 1024 * 1024, // 2MB (very large)
      });

      // First compression - still too large
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValueOnce({
        uri: "file://test/compressed-1.jpg",
      });
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: true,
        size: 700 * 1024, // 700KB (still too large)
      });

      // Second compression - now small enough
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValueOnce({
        uri: "file://test/compressed-2.jpg",
      });
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: true,
        size: 300 * 1024, // 300KB (now acceptable)
      });

      // Call createPhotoObject to test internal compression
      await createPhotoObject(mockPhoto);

      // Check that compression was done in steps
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledTimes(2);

      // First call with initial quality
      expect(ImageManipulator.manipulateAsync).toHaveBeenNthCalledWith(
        1,
        mockPhoto.uri,
        [],
        { compress: 0.8, format: "jpeg" },
      );

      // Second call with reduced quality
      expect(ImageManipulator.manipulateAsync).toHaveBeenNthCalledWith(
        2,
        "file://test/compressed-1.jpg",
        [],
        { compress: expect.closeTo(0.6, 8), format: "jpeg" },
      );
    });

    it("should handle errors when getting file size", async () => {
      // Mock error when getting file size
      (FileSystem.getInfoAsync as jest.Mock).mockRejectedValue(
        new Error("File access error"),
      );

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Call createPhotoObject
      const result = await createPhotoObject(mockPhoto);

      // Should not compress if error occurs getting file size
      expect(ImageManipulator.manipulateAsync).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error getting file size:",
        expect.any(Error),
      );

      // Should still return a valid photo object
      expect(result).toHaveProperty("uri", mockPhoto.uri);

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
