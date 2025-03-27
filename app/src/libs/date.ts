// Date utilities

/**
 * To get a generic date in the desired ISO format YYYY-MM-DD
 */
export const toISODateString = (date: string | Date): string => {
  if (typeof date === "string") {
    if (date.includes(" ")) {
      // For exif (YYYY:MM:DD HH:MM:SS)
      return date.split(" ")[0].replaceAll(":", "-");
    }
    // For ISO (YYYY-MM-DDTHH:MM:SS)
    return date.split("T")[0];
  }

  // Ensure the date is formatted based on local datetime
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

/**
 * To convert an ISO date string into a Date object, preserving correct local time
 */
export const getDateFromISO = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};
