import { GeoLocation } from "../components/LocationInput";
import { Photo } from "../hooks/usePhotos";
import { getDateFromISO, toISODateString } from "./date";

type ImageMetadata = {
  filename: string;
  date: string | null;
  lat: number | null;
  long: number | null;
};

type Coordinates = {
  lat: number;
  long: number;
};

/**
 * Extracts "relevant" properties from EXIF metadata of an image for our application.
 */
export const getRelevantImageMetadata = (photo: Photo): ImageMetadata => {
  const { exif, fileName } = photo;

  // Date
  let date =
    exif?.DateTimeOriginal || exif?.DateTimeDigitized || exif?.DateTime;
  date = date ? toISODateString(date) : null;

  // Coordinates
  let lat = null,
    long = null;
  if (exif && "GPSLatitude" in exif) {
    lat = (exif.GPSLatitudeRef === "S" ? -1 : 1) * exif.GPSLatitude;
    long = (exif.GPSLongitudeRef === "W" ? -1 : 1) * exif.GPSLongitude;
  }

  return {
    date,
    filename: fileName ?? "",
    lat,
    long,
  };
};

/**
 * Looks at the metadata for an array of images and tries to aggregate them into a final result.
 *  - Date: uses the mode
 *  - Location: finds center of largest coordinate cluster and uses reverse geocoding
 */
export const aggregateMetadata = (photos: Photo[]) => {
  const metadatas = photos.map(getRelevantImageMetadata);

  const dateString = findMostCommonDate(metadatas);
  const geocenter = findLargestLocationCenter(metadatas);

  return {
    date: dateString ? getDateFromISO(dateString) : null,
    location: geocenter ? reverseCityGeocode(geocenter) : null,
  };
};

/**
 * Get the most common date from list of metadata.
 */
const findMostCommonDate = (metadatas: ImageMetadata[]): string | null => {
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

// TODO: implement
const reverseCityGeocode = (coords: Coordinates) =>
  ({ ...coords, text: "" }) as GeoLocation;

/**
 * Finds the center (lat/long) of the largest coordinate cluster
 * Threshold for clustering is ~10km, in attempt to cluster by city
 */
const findLargestLocationCenter = (
  metadatas: ImageMetadata[],
  clusterThreshold = 0.1,
): Coordinates | null => {
  const locations = metadatas.filter(
    (m) => m.lat !== null && m.long !== null,
  ) as Coordinates[];
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
