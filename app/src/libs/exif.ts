import { Photo } from "../hooks/usePhotos";
import { toISODate } from "./date";

export const getRelevantExifMetadata = (photo: Photo) => {
  const { exif, fileName } = photo;

  // Extract date from one of available properties
  let date =
    exif?.DateTimeOriginal || exif?.DateTimeDigitized || exif?.DateTime;
  date = date ? toISODate(date) : null;

  // Extract location coordinates
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
