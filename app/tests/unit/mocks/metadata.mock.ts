import { Photo } from "@/src/libs/photos";
import { MementoWithImages } from "@/src/api-client/generated";

/**
 * Creates a mock photo with sensible defaults that can be overridden
 */
export const createMockPhoto = (overrides?: Partial<Photo>): Photo => ({
  uri: "file://test/image.jpg",
  fileName: "image.jpg",
  mimeType: "image/jpeg",
  assetId: "asset123",
  exif: {},
  ...overrides,
});

/**
 * Creates a mock memento with sensible defaults that can be overridden
 */
export const createMockMemento = (
  overrides?: Partial<MementoWithImages>,
): MementoWithImages => ({
  id: 1,
  caption: "Test Memento",
  date: "2023-01-15",
  coordinates: null,
  user_id: "",
  images: [],
  ...overrides,
});

/**
 * Pre-defined location clusters for testing
 */
export const locationClusters = {
  sanFrancisco: [
    createMockPhoto({
      uri: "file://test/sf1.jpg",
      fileName: "sf1.jpg",
      assetId: "asset1",
      exif: {
        DateTimeOriginal: "2023:01:15 14:30:00",
        GPSLatitude: 37.775,
        GPSLatitudeRef: "N",
        GPSLongitude: 122.419,
        GPSLongitudeRef: "W",
      },
    }),
    createMockPhoto({
      uri: "file://test/sf2.jpg",
      fileName: "sf2.jpg",
      assetId: "asset2",
      exif: {
        DateTimeOriginal: "2023:01:15 15:00:00",
        GPSLatitude: 37.774,
        GPSLatitudeRef: "N",
        GPSLongitude: 122.42,
        GPSLongitudeRef: "W",
      },
    }),
    createMockPhoto({
      uri: "file://test/sf3.jpg",
      fileName: "sf3.jpg",
      assetId: "asset3",
      exif: {
        DateTimeOriginal: "2023:01:15 16:00:00",
        GPSLatitude: 37.776,
        GPSLatitudeRef: "N",
        GPSLongitude: 122.418,
        GPSLongitudeRef: "W",
      },
    }),
  ],
  newYork: [
    createMockPhoto({
      uri: "file://test/ny1.jpg",
      fileName: "ny1.jpg",
      assetId: "asset4",
      exif: {
        DateTimeOriginal: "2023:01:20 10:00:00",
        GPSLatitude: 40.713,
        GPSLatitudeRef: "N",
        GPSLongitude: 74.006,
        GPSLongitudeRef: "W",
      },
    }),
    createMockPhoto({
      uri: "file://test/ny2.jpg",
      fileName: "ny2.jpg",
      assetId: "asset5",
      exif: {
        DateTimeOriginal: "2023:01:20 11:00:00",
        GPSLatitude: 40.714,
        GPSLatitudeRef: "N",
        GPSLongitude: 74.005,
        GPSLongitudeRef: "W",
      },
    }),
  ],
};

/**
 * Helper functions for mocking geocoding responses
 */
export const mockGeocodingResponse = {
  success: () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        status: "OK",
        results: [{ formatted_address: "San Francisco, CA, USA" }],
      }),
    });
  },
  error: () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        status: "ZERO_RESULTS",
        results: [],
      }),
    });
  },
  networkError: () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
  },
};
