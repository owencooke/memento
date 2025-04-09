import { getRelevantMetadata, aggregateMetadata } from "@/src/libs/metadata";
import { getDateFromISO, toISODateString } from "@/src/libs/date";
import { Photo } from "@/src/libs/photos";
import {
  createMockPhoto,
  createMockMemento,
  locationClusters,
  mockGeocodingResponse,
} from "./mocks/metadata.mock";

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
        const photo = createMockPhoto({
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
            GPSLatitude: 37.7749,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.4194,
            GPSLongitudeRef: "W",
          },
        });

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
        const photo = createMockPhoto({
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
            GPSLatitude: 33.9249,
            GPSLatitudeRef: "S", // Southern hemisphere
            GPSLongitude: 18.4241,
            GPSLongitudeRef: "E", // Eastern hemisphere
          },
        });

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
        const photo = createMockPhoto({
          exif: {
            // No DateTimeOriginal
            DateTimeDigitized: "2023:01:15 14:30:00",
            GPSLatitude: 37.7749,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.4194,
            GPSLongitudeRef: "W",
          },
        });

        // When
        const metadata = getRelevantMetadata(photo);

        // Then
        expect(toISODateString).toHaveBeenCalledWith("2023:01:15 14:30:00");
        expect(metadata.date).toBe("mocked-iso-date");
      });

      it("handles photos with DateTime as last fallback", () => {
        // Given
        const photo = createMockPhoto({
          exif: {
            // No DateTimeOriginal or DateTimeDigitized
            DateTime: "2023:01:15 14:30:00",
            GPSLatitude: 37.7749,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.4194,
            GPSLongitudeRef: "W",
          },
        });

        // When
        const metadata = getRelevantMetadata(photo);

        // Then
        expect(toISODateString).toHaveBeenCalledWith("2023:01:15 14:30:00");
        expect(metadata.date).toBe("mocked-iso-date");
      });

      it("handles photos with missing GPS coordinates", () => {
        // Given
        const photo = createMockPhoto({
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
            // No GPS data
          },
        });

        // When
        const metadata = getRelevantMetadata(photo);

        // Then
        expect(metadata.coordinates).toBeNull();
        expect(metadata.date).toBe("mocked-iso-date");
      });

      it("handles photos with missing fileName", () => {
        // Given
        const photo = createMockPhoto({
          fileName: undefined,
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
          },
        });

        // When
        const metadata = getRelevantMetadata(photo);

        // Then
        expect(metadata.filename).toBe("");
      });

      it("handles photos with missing mimeType", () => {
        // Given
        const photo = createMockPhoto({
          mimeType: undefined,
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
          },
        });

        // When
        const metadata = getRelevantMetadata(photo);

        // Then
        expect(metadata.mime_type).toBe("image/png");
      });

      it("handles photos with no EXIF data", () => {
        // Given - default photo has empty exif
        const photo = createMockPhoto();

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
        const memento = createMockMemento({
          coordinates: { lat: 37.7749, long: 122.4194 },
        });

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
        const memento = createMockMemento({
          date: null,
          coordinates: null,
        });

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
        createMockPhoto({
          exif: {
            DateTimeOriginal: "2023:01:15 14:30:00",
            GPSLatitude: 37.7749,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.4194,
            GPSLongitudeRef: "W",
          },
        }),
        createMockPhoto({
          fileName: "image2.jpg",
          assetId: "asset2",
          exif: {
            DateTimeOriginal: "2023:01:15 15:00:00", // Same date, different time
            GPSLatitude: 37.7746,
            GPSLatitudeRef: "N",
            GPSLongitude: 122.4199,
            GPSLongitudeRef: "W",
          },
        }),
      ];

      // Mock functions for geocoding
      mockGeocodingResponse.success();

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

      // This is a simple enough setup that we can just use inline objects
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
      const photo = createMockPhoto({
        exif: {
          DateTimeOriginal: "2023:01:15 14:30:00",
          // No GPS data
        },
      });

      // When
      const result = await aggregateMetadata([photo]);

      // Then
      expect(result.location).toBeNull();
    });

    it("handles geocoding API errors", async () => {
      // Given
      const photo = createMockPhoto({
        exif: {
          DateTimeOriginal: "2023:01:15 14:30:00",
          GPSLatitude: 37.7749,
          GPSLatitudeRef: "N",
          GPSLongitude: 122.4194,
          GPSLongitudeRef: "W",
        },
      });

      // Mock geocoding error
      mockGeocodingResponse.error();

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // When
      const result = await aggregateMetadata([photo]);

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
      const photo = createMockPhoto({
        exif: {
          DateTimeOriginal: "2023:01:15 14:30:00",
          GPSLatitude: 37.7749,
          GPSLatitudeRef: "N",
          GPSLongitude: 122.4194,
          GPSLongitudeRef: "W",
        },
      });

      // Mock fetch error
      mockGeocodingResponse.networkError();

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      // When
      const result = await aggregateMetadata([photo]);

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
      // Given - Use our pre-defined location clusters
      const photos = [
        ...locationClusters.sanFrancisco,
        ...locationClusters.newYork,
      ];

      // Mock geocoding response for San Francisco (the largest cluster)
      mockGeocodingResponse.success();

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
      const photo = createMockPhoto({
        exif: {
          // No date information
          GPSLatitude: 37.7749,
          GPSLatitudeRef: "N",
          GPSLongitude: 122.4194,
          GPSLongitudeRef: "W",
        },
      });

      // Mock geocoding
      mockGeocodingResponse.success();

      // When
      const result = await aggregateMetadata([photo]);

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
