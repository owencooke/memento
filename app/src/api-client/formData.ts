// Fixes an issue with hey-api fetch client, where it stringifies the
// React Native photo objects instead of properly including in form formData
// Reference: https://github.com/hey-api/openapi-ts/issues/1563

type FileUpload = {
  uri: string;
  type?: string;
  name?: string;
};

const isFileUpload = (value: unknown): value is FileUpload =>
  typeof value === "object" && typeof (value as any).uri === "string";

const serializeFormDataPair = (
  formData: FormData,
  key: string,
  value: unknown,
) => {
  if (
    typeof value === "string" ||
    value instanceof Blob ||
    isFileUpload(value)
  ) {
    formData.append(key, value as any);
  } else {
    formData.append(key, JSON.stringify(value));
  }
};

/**
 *  Use this to override the default bodySerializer when calling a multi=part
 * form endpoint to ensure proper image upload
 */
export const formDataBodySerializer = {
  bodySerializer: <T extends Record<string, any> | Record<string, any>[]>(
    body: T,
  ) => {
    const formData = new FormData();

    Object.entries(body).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (Array.isArray(value) && isFileUpload(value[0])) {
        value.forEach((v) => serializeFormDataPair(formData, key, v));
      } else {
        serializeFormDataPair(formData, key, value);
      }
    });

    return formData;
  },
};
