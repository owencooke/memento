// https://github.com/hey-api/openapi-ts/issues/1563

type FileUpload = {
  uri: string;
  type?: string;
  name?: string;
};

const isFileUpload = (value: unknown): value is FileUpload => {
  return (
    typeof value === "object" &&
    value !== null &&
    "uri" in value &&
    typeof (value as any).uri === "string"
  );
};

const isBlob = (value: unknown): value is Blob => {
  return (
    value instanceof Blob ||
    (typeof value === "object" &&
      value !== null &&
      typeof (value as any).size === "number" &&
      typeof (value as any).type === "string")
  );
};

const serializeFormDataPair = (data: FormData, key: string, value: unknown) => {
  if (isBlob(value)) {
    // Handle blobs directly
    console.log("APPENDING BLOB:", key);
    data.append(key, value);
  } else if (isFileUpload(value)) {
    // Handle React Native file uploads
    console.log("APPENDING FILE UPLOAD:", key, value.uri);
    data.append(key, {
      uri: value.uri,
      type: value.type || "image/jpeg",
      name: value.name || "image.jpg",
    } as any);
  } else if (typeof value === "string") {
    // Handle strings
    console.log("APPENDING STRING:", key, value);
    data.append(key, value);
  } else {
    // Handle objects/arrays by stringifying
    console.log("STRINGIFYING:", key, value);
    data.append(key, JSON.stringify(value));
  }
};

export const formDataBodySerializer = {
  bodySerializer: <T extends Record<string, any>>(body: T) => {
    console.log("SERIALIZING BODY:", JSON.stringify(body, null, 2));
    const data = new FormData();

    Object.entries(body).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (Array.isArray(value)) {
        console.log(`ARRAY FOUND for ${key} with length ${value.length}`);
        if (key === "images") {
          // Special handling for images array
          value.forEach((v, i) => {
            console.log(`Processing image ${i}:`, v);
            serializeFormDataPair(data, key, v);
          });
        } else {
          // For other arrays like imageMetadata
          serializeFormDataPair(data, key, value);
        }
      } else {
        serializeFormDataPair(data, key, value);
      }
    });

    return data;
  },
};
