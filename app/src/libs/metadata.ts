import { Coordinates, ImageWithUrl, Memento } from "../api-client/generated";
import { GeoLocation } from "../components/inputs/LocationInput";
import { Photo } from "../hooks/usePhotos";
import { getDateFromISO, toISODateString } from "./date";

type SelectedPhotoMetadata = Pick<
  ImageWithUrl,
  "date" | "filename" | "coordinates"
>;

type Metadata = Pick<Memento | ImageWithUrl, "date" | "coordinates">;

/**
 * Extracts "relevant" properties from EXIF metadata of an image for our application.
 */
export const getRelevantImageMetadata = (
  photo: Photo,
): SelectedPhotoMetadata => {
  const { exif, fileName } = photo;

  // Date
  let date =
    exif?.DateTimeOriginal || exif?.DateTimeDigitized || exif?.DateTime;
  date = date ? toISODateString(date) : null;

  // Coordinates
  let coordinates = null;
  if (exif && "GPSLatitude" in exif) {
    coordinates = {
      lat: (exif.GPSLatitudeRef === "S" ? -1 : 1) * exif.GPSLatitude,
      long: (exif.GPSLongitudeRef === "W" ? -1 : 1) * exif.GPSLongitude,
    };
  }

  return {
    date,
    filename: fileName ?? "",
    coordinates,
  };
};

const isPhoto = (item: Photo | Memento): item is Photo => {
  return "exif" in item;
};

/**
 * Extracts relevant metadata from either a photo or memento.
 */
export const getRelevantMetadata = (item: Photo | Memento): Metadata => {
  if (isPhoto(item)) {
    const { exif, fileName } = item;

    // Date
    let date =
      exif?.DateTimeOriginal || exif?.DateTimeDigitized || exif?.DateTime;
    date = date ? toISODateString(date) : null;

    // Coordinates
    let coordinates = null;
    if (exif && "GPSLatitude" in exif) {
      coordinates = {
        lat: (exif.GPSLatitudeRef === "S" ? -1 : 1) * exif.GPSLatitude,
        long: (exif.GPSLongitudeRef === "W" ? -1 : 1) * exif.GPSLongitude,
      };
    }

    return { date, coordinates };
  }

  // Memento Metadata
  return {
    date: item.date ?? null,
    coordinates: item.coordinates ?? null,
  };
};

/**
 * Looks at the metadata for an array of images and tries to aggregate them into a final result.
 *  - Date: uses the mode
 *  - Location: finds center of largest coordinate cluster and uses reverse geocoding
 */
export const aggregateMetadata = async (items: (Photo | Memento)[]) => {
  const metadatas = items.map(getRelevantMetadata);

  const dateString = findMostCommonDate(metadatas);
  const geocenter = findLargestLocationCenter(metadatas);

  return {
    date: dateString ? getDateFromISO(dateString) : null,
    location: geocenter ? await reverseCityGeocode(geocenter) : null,
  };
};

/**
 * Get the most common date from list of metadata.
 */
const findMostCommonDate = (metadatas: Metadata[]): string | null => {
  const dateCounts: Record<string, number> = {};

  return metadatas
    .filter((m) => m.date)
    .reduce(
      (mostCommon, m) => {
        const date = m.date as string;
        dateCounts[date] = (dateCounts[date] || 0) + 1;

        return !mostCommon || dateCounts[date] > dateCounts[mostCommon]
          ? date
          : mostCommon;
      },
      null as string | null,
    );
};

/**
 * Use Google Geocode API to reverse coordinates into a named place
 * Reference: https://developers.google.com/maps/documentation/geocoding/requests-reverse-geocoding
 */
const reverseCityGeocode = async (
  coords: Coordinates,
): Promise<GeoLocation> => {
  const { lat, long } = coords;
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${apiKey}&result_type=locality`;
    const { results, status } = await fetch(url).then((res) => res.json());
    if (status !== "OK" || !results || results.length < 1) {
      throw new Error(
        `Reverse geocoding failed. Status: ${status}, results: ${JSON.stringify(results)}`,
      );
    }
    return { ...coords, text: results[0].formatted_address || "" };
  } catch (error) {
    console.error(error);
    return { ...coords, text: "" };
  }
};

/**
 * Finds the center (lat/long) of the largest coordinate cluster
 * Threshold for clustering is ~10km, in attempt to cluster by city
 */
const findLargestLocationCenter = (
  metadatas: Metadata[],
  clusterThreshold = 0.1,
): Coordinates | null => {
  const locations = metadatas
    .filter((m) => m.coordinates)
    .map((m) => m.coordinates) as Coordinates[];
  if (locations.length === 0) return null;

  // Find clusters based on proximity
  const clusters = locations.reduce((acc: Coordinates[][], loc) => {
    const matchingClusterIndex = acc.findIndex((cluster) =>
      cluster.some((point) => isNearby(point, loc, clusterThreshold)),
    );
    if (matchingClusterIndex >= 0) {
      acc[matchingClusterIndex].push(loc);
    } else {
      acc.push([loc]);
    }
    return acc;
  }, []);

  // Get the largest cluster
  const largestCluster = clusters.reduce(
    (max, cluster) => (cluster.length > max.length ? cluster : max),
    [],
  );
  return calculateCenter(largestCluster);
};

/**
 * Check if two points are within threshold
 */
const isNearby = (
  p1: Coordinates,
  p2: Coordinates,
  threshold: number,
): boolean =>
  Math.abs(p1.lat - p2.lat) < threshold &&
  Math.abs(p1.long - p2.long) < threshold;

/**
 * Calculate the center of a list of coordinates
 */
const calculateCenter = (points: Coordinates[]): Coordinates => {
  const sum = points.reduce(
    (acc, p) => ({
      lat: acc.lat + p.lat,
      long: acc.long + p.long,
    }),
    { lat: 0, long: 0 },
  );

  return {
    lat: sum.lat / points.length,
    long: sum.long / points.length,
  };
};
