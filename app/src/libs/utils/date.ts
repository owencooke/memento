export const toISODate = (isoString: string): string => {
  return isoString.split("T")[0];
};
