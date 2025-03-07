import { GeoLocation } from "../components/inputs/LocationInput";
import { Photo } from "../hooks/usePhotos";
import { toISODateString } from "../libs/date";
import { getRelevantImageMetadata } from "../libs/metadata";

export interface MementoFormData {
  memento: { date: Date | null; location: GeoLocation; caption: string };
  photos: Photo[];
}

// Maps the form data for a Memento into the proper payload for Create API
export const prepareCreateMementoPayload = (form: MementoFormData) => {
  const {
    location: { lat, long, text },
    date,
    ...restMemento
  } = form.memento;

  return {
    memento_str: {
      ...restMemento,
      date: date ? toISODateString(date) : null,
      location: text || null,
      coordinates: lat && long ? { lat, long } : null,
    },
    image_metadata_str: form.photos.map((photo, idx) => ({
      ...getRelevantImageMetadata(photo),
      order_index: idx,
    })),
    images: form.photos.map((photo) => ({
      uri: photo.uri,
      type: photo.mimeType,
      name: photo.fileName,
    })),
  };
};
