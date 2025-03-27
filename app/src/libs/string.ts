export const toTitleCase = (str: string) =>
  str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  );

export const removeUnderscores = (str: string) => str.replace(/_/g, " ");

export const mimeTypeToExtension = (mimeType: string) => {
  const parts = mimeType.split("/");
  if (parts.length >= 2) {
    return parts[1];
  }
  return "png";
};

export const fileNameSafeString = (str: string) => str.replace(/[^\w\s]/gi, "");
