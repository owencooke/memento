export const toISODate = (dateString: string): string => {
  if (dateString.includes(" ")) {
    // For exif (YYYY:MM:DD HH:MM:SS)
    return dateString.split(" ")[0];
  }

  // For ISO (YYYY-MM-DDTHH:MM:SS)
  return dateString.split("T")[0];
};
