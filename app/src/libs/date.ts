// Date utilities

/**
 * To get a generic date in the desired ISO format YYYY-MM-DD
 */
export const toISODateString = (date: string | Date): string => {
  const dateString = date instanceof Date ? date.toISOString() : date;

  if (dateString.includes(" ")) {
    // For exif (YYYY:MM:DD HH:MM:SS)
    return dateString.split(" ")[0].replaceAll(":", "-");
  }

  // For ISO (YYYY-MM-DDTHH:MM:SS)
  return dateString.split("T")[0];
};

/**
 * To convert an ISO date string into a Date object, preserving correct local time
 */
export const getDateFromISO = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};
