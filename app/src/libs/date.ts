// Date utilities

/**
 * To get a generic date in the desired ISO format YYYY-MM-DD
 */
export const toISODate = (dateString: string): string => {
  if (dateString.includes(" ")) {
    // For exif (YYYY:MM:DD HH:MM:SS)
    return dateString.split(" ")[0].replaceAll(":", "-");
  }

  // For ISO (YYYY-MM-DDTHH:MM:SS)
  return dateString.split("T")[0];
};
