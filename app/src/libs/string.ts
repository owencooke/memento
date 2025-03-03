export const toTitleCase = (str: string) =>
  str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
  );

export const removeUnderscores = (str: string) => str.replace(/_/g, " ");
