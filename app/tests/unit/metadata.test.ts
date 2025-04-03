import { getRelevantMetadata, aggregateMetadata } from "@/src/libs/metadata";
import { getDateFromISO, toISODateString } from "@/src/libs/date";
import { Photo } from "@/src/libs/photos";
import { MementoWithImages } from "@/src/api-client/generated";

// Mock fetch for the reverse geocoding
global.fetch = jest.fn();

// Mock dependencies
jest.mock("@/src/libs/date", () => ({
  toISODateString: jest.fn((_) => "mocked-iso-date"),
  getDateFromISO: jest.fn((_) => new Date(2023, 0, 1)),
}));

describe("Metadata Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getRelevantMetadata", () => {
    describe("Photo metadata extraction", () => {
      it("extracts EXIF metadata from a photo with complete information", () => {
        // Given
        const photo: Photo = {
          uri: "file://test/image.jpg",
          fileName: "image.jpg",
          mimeType: "image/jpeg",
          assetId: "asset123",
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
            GPSLatitude: 37.7749,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.4194,
            GPSLongitudeRef: "W",
          },
        };

        // When
        const metadata = getRelevantMetadata(photo);

        // Then
        expect(toISODateString).toHaveBeenCalledWith("2023:01:15 14:30:00");
        expect(metadata).toEqual({
          date: "mocked-iso-date",
          coordinates: {
            lat: 37.7749,
            long: -122.4194, // W longitude is negative
          },
          mime_type: "image/jpeg",
          filename: "image.jpg",
        });
      });

      it("handles photos with southern hemisphere coordinates", () => {
        // Given
        const photo: Photo = {
          uri: "file://test/image.jpg",
          fileName: "image.jpg",
          mimeType: "image/jpeg",
          assetId: "asset123",
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
            GPSLatitude: 33.9249,
            GPSLatitudeRef: "S", // Southern hemisphere
            GPSLongitude: 18.4241,
            GPSLongitudeRef: "E", // Eastern hemisphere
          },
        };

        // When
        const metadata = getRelevantMetadata(photo);

        // Then
        expect(metadata.coordinates).toEqual({
          lat: -33.9249, // S latitude is negative
          long: 18.4241, // E longitude is positive
        });
      });

      it("handles photos with missing EXIF date using fallbacks", () => {
        // Given
        const photo: Photo = {
          uri: "file://test/image.jpg",
          fileName: "image.jpg",
          mimeType: "image/jpeg",
          assetId: "asset123",
          exif: {
            // No DateTimeOriginal
            DateTimeDigitized: "2023:01:15 14:30:00",
            GPSLatitude: 37.7749,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.4194,
            GPSLongitudeRef: "W",
          },
        };

        // When
        const metadata = getRelevantMetadata(photo);

        // Then
        expect(toISODateString).toHaveBeenCalledWith("2023:01:15 14:30:00");
        expect(metadata.date).toBe("mocked-iso-date");
      });

      it("handles photos with DateTime as last fallback", () => {
        // Given
        const photo: Photo = {
          uri: "file://test/image.jpg",
          fileName: "image.jpg",
          mimeType: "image/jpeg",
          assetId: "asset123",
          exif: {
            // No DateTimeOriginal or DateTimeDigitized
            DateTime: "2023:01:15 14:30:00",
            GPSLatitude: 37.7749,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.4194,
            GPSLongitudeRef: "W",
          },
        };

        // When
        const metadata = getRelevantMetadata(photo);

        // Then
        expect(toISODateString).toHaveBeenCalledWith("2023:01:15 14:30:00");
        expect(metadata.date).toBe("mocked-iso-date");
      });

      it("handles photos with missing GPS coordinates", () => {
        // Given
        const photo: Photo = {
          uri: "file://test/image.jpg",
          fileName: "image.jpg",
          mimeType: "image/jpeg",
          assetId: "asset123",
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
            // No GPS data
          },
        };

        // When
        const metadata = getRelevantMetadata(photo);

        // Then
        expect(metadata.coordinates).toBeNull();
        expect(metadata.date).toBe("mocked-iso-date");
      });

      it("handles photos with missing fileName", () => {
        // Given
        const photo: Photo = {
          uri: "file://test/image.jpg",
          mimeType: "image/jpeg",
          assetId: "asset123",
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
          },
        };

        // When
        const metadata = getRelevantMetadata(photo);

        // Then
        expect(metadata.filename).toBe("");
      });

      it("handles photos with missing mimeType", () => {
        // Given
        const photo: Photo = {
          uri: "file://test/image.jpg",
          fileName: "image.jpg",
          assetId: "asset123",
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
          },
        };

        // When
        const metadata = getRelevantMetadata(photo);

        // Then
        expect(metadata.mime_type).toBe("image/png");
      });

      it("handles photos with no EXIF data", () => {
        // Given
        const photo: Photo = {
          uri: "file://test/image.jpg",
          fileName: "image.jpg",
          mimeType: "image/jpeg",
          assetId: "asset123",
          exif: {},
        };

        // When
        const metadata = getRelevantMetadata(photo);

        // Then
        expect(metadata.date).toBeNull();
        expect(metadata.coordinates).toBeNull();
      });
    });

    describe("Memento metadata extraction", () => {
      it("extracts metadata from a memento with complete information", () => {
        // Given
        const memento: MementoWithImages = {
          id: 1,
          caption: "Test Memento",
          date: "2023-01-15",
          coordinates: { lat: 37.7749, long: 122.4194 },
          user_id: "",
          images: [],
        };

        // When
        const metadata = getRelevantMetadata(memento);

        // Then
        expect(metadata).toEqual({
          date: "2023-01-15",
          coordinates: { lat: 37.7749, long: 122.4194 },
          mime_type: "image/png",
          filename: "",
        });
      });

      it("handles mementos with missing date and coordinates", () => {
        // Given
        const memento: MementoWithImages = {
          id: 1,
          caption: "Test Memento",
          date: null,
          coordinates: null,
          user_id: "",
          images: [],
        };

        // When
        const metadata = getRelevantMetadata(memento);

        // Then
        expect(metadata).toEqual({
          date: null,
          coordinates: null,
          mime_type: "image/png",
          filename: "",
        });
      });
    });
  });

  describe("aggregateMetadata", () => {
    it("aggregates metadata from multiple photos with common date", async () => {
      // Given
      const photos: Photo[] = [
        {
          uri: "file://test/image1.jpg",
          fileName: "image1.jpg",
          mimeType: "image/jpeg",
          assetId: "asset1",
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
            GPSLatitude: 37.7749,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.4194,
            GPSLongitudeRef: "W",
          },
        },
        {
          uri: "file://test/image2.jpg",
          fileName: "image2.jpg",
          mimeType: "image/jpeg",
          assetId: "asset2",
          exif: {
            DateTimeOriginal: "2023:01:15 15:00:00", // Same date, different time
            GPSLatitude: 37.7746,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.4199,
            GPSLongitudeRef: "W",
          },
        },
      ];

      // Mock functions for geocoding
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          status: "OK",
          results: [{ formatted_address: "San Francisco, CA, USA" }],
        }),
      });

      // When
      const result = await aggregateMetadata(photos);

      // Then
      expect(getDateFromISO).toHaveBeenCalled();
      expect(result.date).toEqual(new Date(2023, 0, 1));
      expect(result.location?.lat).toBeCloseTo(37.775, 2);
      expect(result.location?.long).toBeCloseTo(-122.419, 2);
      expect(result.location?.text).toBe("San Francisco, CA, USA");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(
          /maps\.googleapis\.com\/maps\/api\/geocode\/json\?latlng=37\.77[0-9]*,-122\.419[0-9]*/,
        ),
      );
    });

    it("handles photos with different dates by finding the most common", async () => {
      // Given
      jest
        .mocked(toISODateString)
        .mockReturnValueOnce("2023-01-15")
        .mockReturnValueOnce("2023-01-15")
        .mockReturnValueOnce("2023-01-16");

      const photos: Photo[] = [
        {
          uri: "file://test/image1.jpg",
          fileName: "image1.jpg",
          mimeType: "image/jpeg",
          assetId: "asset1",
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00", // Will mock to '2023-01-15'
          },
        },
        {
          uri: "file://test/image2.jpg",
          fileName: "image2.jpg",
          mimeType: "image/jpeg",
          assetId: "asset2",
          exif: {
            DateTimeOriginal: "2023:01:15 15:00:00", // Will mock to '2023-01-15'
          },
        },
        {
          uri: "file://test/image3.jpg",
          fileName: "image3.jpg",
          mimeType: "image/jpeg",
          assetId: "asset3",
          exif: {
            DateTimeOriginal: "2023:01:16 10:00:00", // Will mock to '2023-01-16'
          },
        },
      ];

      // When
      const result = await aggregateMetadata(photos);

      // Then
      expect(result.date).toEqual(new Date(2023, 0, 1)); // Most common date (2 instances of 2023-01-15)
    });

    it("handles photos with no location data", async () => {
      // Given
      const photos: Photo[] = [
        {
          uri: "file://test/image1.jpg",
          fileName: "image1.jpg",
          mimeType: "image/jpeg",
          assetId: "asset1",
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
            // No GPS data
          },
        },
      ];

      // When
      const result = await aggregateMetadata(photos);

      // Then
      expect(result.location).toBeNull();
    });

    it("handles geocoding API errors", async () => {
      // Given
      const photos: Photo[] = [
        {
          uri: "file://test/image1.jpg",
          fileName: "image1.jpg",
          mimeType: "image/jpeg",
          assetId: "asset1",
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
            GPSLatitude: 37.7749,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.4194,
            GPSLongitudeRef: "W",
          },
        },
      ];

      // Mock geocoding error
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          status: "ZERO_RESULTS",
          results: [],
        }),
      });

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // When
      const result = await aggregateMetadata(photos);

      // Then
      expect(result.location).toEqual({
        lat: 37.7749,
        long: -122.4194,
        text: "", // Empty text because geocoding failed
      });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("handles fetch errors during geocoding", async () => {
      // Given
      const photos: Photo[] = [
        {
          uri: "file://test/image1.jpg",
          fileName: "image1.jpg",
          mimeType: "image/jpeg",
          assetId: "asset1",
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
            GPSLatitude: 37.7749,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.4194,
            GPSLongitudeRef: "W",
          },
        },
      ];

      // Mock fetch error
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      // Spy on console.error
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // When
      const result = await aggregateMetadata(photos);

      // Then
      expect(result.location).toEqual({
        lat: 37.7749,
        long: -122.4194,
        text: "", // Empty text because geocoding failed
      });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("handles multiple location clusters by finding the largest", async () => {
      // Given
      const photos: Photo[] = [
        // San Francisco cluster (3 photos)
        {
          uri: "file://test/sf1.jpg",
          fileName: "sf1.jpg",
          mimeType: "image/jpeg",
          assetId: "asset1",
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
            GPSLatitude: 37.775,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.419,
            GPSLongitudeRef: "W",
          },
        },
        {
          uri: "file://test/sf2.jpg",
          fileName: "sf2.jpg",
          mimeType: "image/jpeg",
          assetId: "asset2",
          exif: {
            DateTimeOriginal: "2023:01:15 15:00:00",
            GPSLatitude: 37.774,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.42,
            GPSLongitudeRef: "W",
          },
        },
        {
          uri: "file://test/sf3.jpg",
          fileName: "sf3.jpg",
          mimeType: "image/jpeg",
          assetId: "asset3",
          exif: {
            DateTimeOriginal: "2023:01:15 16:00:00",
            GPSLatitude: 37.776,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.418,
            GPSLongitudeRef: "W",
          },
        },
        // New York cluster (2 photos - smaller cluster)
        {
          uri: "file://test/ny1.jpg",
          fileName: "ny1.jpg",
          mimeType: "image/jpeg",
          assetId: "asset4",
          exif: {
            DateTimeOriginal: "2023:01:20 10:00:00",
            GPSLatitude: 40.713,
            GPSLatitudeRef: "N",
            GPSLongitude: 74.006,
            GPSLongitudeRef: "W",
          },
        },
        {
          uri: "file://test/ny2.jpg",
          fileName: "ny2.jpg",
          mimeType: "image/jpeg",
          assetId: "asset5",
          exif: {
            DateTimeOriginal: "2023:01:20 11:00:00",
            GPSLatitude: 40.714,
            GPSLatitudeRef: "N",
            GPSLongitude: 74.005,
            GPSLongitudeRef: "W",
          },
        },
      ];

      // Mock geocoding response for San Francisco (the largest cluster)
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          status: "OK",
          results: [{ formatted_address: "San Francisco, CA, USA" }],
        }),
      });

      // When
      const result = await aggregateMetadata(photos);

      // Then
      // Should use the center of the San Francisco cluster (largest one)
      expect(result.location?.lat).toBeCloseTo(37.775, 8);
      expect(result.location?.long).toBeCloseTo(-122.419, 8);
      expect(result.location?.text).toBe("San Francisco, CA, USA");

      // Verify the API was called with coordinates close to San Francisco
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(
          /maps\.googleapis\.com\/maps\/api\/geocode\/json\?latlng=37\.77[0-9]*,-122\.419[0-9]*/,
        ),
      );
    });

    it("handles photos with no date information", async () => {
      // Given
      const photos: Photo[] = [
        {
          uri: "file://test/image1.jpg",
          fileName: "image1.jpg",
          mimeType: "image/jpeg",
          assetId: "asset1",
          exif: {
            // No date information
            GPSLatitude: 37.7749,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.4194,
            GPSLongitudeRef: "W",
          },
        },
      ];

      // Mock geocoding
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue({
          status: "OK",
          results: [{ formatted_address: "San Francisco, CA, USA" }],
        }),
      });

      // When
      const result = await aggregateMetadata(photos);

      // Then
      expect(result.date).toBeNull();
      expect(result.location).not.toBeNull(); // Location should still be processed
    });

    it("handles empty input array", async () => {
      // Given
      const photos: Photo[] = [];

      // When
      const result = await aggregateMetadata(photos);

      // Then
      expect(result).toEqual({
        date: null,
        location: null,
      });
    });
  });
});
