/**
 * Converts a binary Blob to base64 string.
 * Allows images to render a blob via source/uri
 *
 * Reference: https://stackoverflow.com/a/78849297
 */
export const convertBlobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
