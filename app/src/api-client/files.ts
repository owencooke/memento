// https://github.com/hey-api/openapi-ts/issues/1563

type FileUpload = {
  uri: string;
  type?: string;
  name?: string;
};

const isFileUpload = (value: unknown): value is FileUpload =>
  typeof value === "object" && typeof (value as any).uri === "string";

const serializeFormDataPair = (data: FormData, key: string, value: unknown) => {
  if (
    typeof value === "string" ||
    value instanceof Blob ||
    isFileUpload(value)
  ) {
    data.append(key, value as any);
  } else {
    data.append(key, JSON.stringify(value));
  }
};

export const formDataBodySerializer = {
  bodySerializer: <T extends Record<string, any> | Record<string, any>[]>(
    body: T,
  ) => {
    const data = new FormData();

    Object.entries(body).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((v) => serializeFormDataPair(data, key, v));
      } else {
        serializeFormDataPair(data, key, value);
      }
    });

    return data;
  },
};
