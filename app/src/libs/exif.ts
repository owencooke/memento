import { Photo } from "../hooks/usePhotos";
import { toISODate } from "./date";

export const getRelevantExifMetadata = (photo: Photo) => {
  const { exif, fileName } = photo;

  // Extract date from one of available properties
  let date =
    exif?.DateTimeOriginal || exif?.DateTimeDigitized || exif?.DateTime;
  date = date ? toISODate(date) : null;

  // TODO: location. Available fields are GPSLongitude and GPSLatitude

  return {
    date,
    filename: fileName ?? "",
  };
};
