/**
 * Converts a binary Blob to base64 URI.
 * Allows images to render a blob via source/uri by:
 *  1. encoding the binary image data into a base64 image string
 *  2. prefixing the string with data:image/png;base64,
 *
 * Reference: https://stackoverflow.com/a/78849297
 */
export const convertBlobToBase64Uri = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
