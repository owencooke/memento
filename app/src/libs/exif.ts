import { GeoLocation } from "../components/LocationInput";
import { Photo } from "../hooks/usePhotos";
import { toISODate } from "./date";

type ImageMetadata = {
  filename: string;
  date: string | null;
  lat: number | null;
  long: number | null;
};

export const getRelevantImageMetadata = (photo: Photo): ImageMetadata => {
  const { exif, fileName } = photo;

  // Date
  let date =
    exif?.DateTimeOriginal || exif?.DateTimeDigitized || exif?.DateTime;
  date = date ? toISODate(date) : null;

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

type Coordinates = {
  lat: number;
  long: number;
};

export const aggregateMetadata = (photos: Photo[]) => {
  const metadatas = photos.map(getRelevantImageMetadata);

  const dateString = findMostCommonDate(metadatas);

  const geocenter = findLocationCenter(metadatas);

  return {
    date: dateString ? new Date(dateString) : null,
    location: geocenter ? reverseCityGeocode(geocenter) : null,
  };
};

// Find the most common date
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

// Find the center of the largest coordinate cluster
const findLocationCenter = (metadatas: ImageMetadata[]): Coordinates | null => {
  // Filter locations with coordinates
  const locations = metadatas.filter(
    (m): m is ImageMetadata & { lat: number; long: number } =>
      m.lat !== null && m.long !== null,
  );

  if (locations.length === 0) return null;

  // City-level clustering (~10km)
  const THRESHOLD = 0.1;

  // Find clusters based on proximity
  const clusters = locations.reduce((acc: Coordinates[][], loc) => {
    // Try adding to existing cluster
    const matchingClusterIndex = acc.findIndex((cluster) =>
      cluster.some((point) => isNearby(point, loc, THRESHOLD)),
    );

    if (matchingClusterIndex >= 0) {
      acc[matchingClusterIndex].push(loc);
    } else {
      acc.push([loc]);
    }

    return acc;
  }, []);

  // Find largest cluster
  const largestCluster = clusters.reduce(
    (max, cluster) => (cluster.length > max.length ? cluster : max),
    [] as Coordinates[],
  );

  // Return center of largest cluster or first location
  return largestCluster.length > 0
    ? calculateCenter(largestCluster)
    : locations[0];
};

// Check if two points are within threshold
const isNearby = (
  p1: Coordinates,
  p2: Coordinates,
  threshold: number,
): boolean =>
  Math.abs(p1.lat - p2.lat) < threshold &&
  Math.abs(p1.long - p2.long) < threshold;

// Calculate center of points
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
