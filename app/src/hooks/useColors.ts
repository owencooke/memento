import { useColorScheme } from "react-native";
import { colors } from "@/src/components/ui/gluestack-ui-provider/config";

type Scheme = "dark" | "light";
type ColorKeys = keyof typeof colors.light | keyof typeof colors.dark;

const getColorValue = (colorName: string, mode: Scheme): string => {
  const colorValue = colors[mode][`--color-${colorName}` as ColorKeys];
  if (!colorValue) {
    throw new Error(`Color ${colorName} not found in ${mode} mode`);
  }
  return `rgb(${colorValue})`;
};

export const useColors = () => {
  const colorScheme = useColorScheme();

  const getColor = (colorName: string): string =>
    getColorValue(colorName, colorScheme as Scheme);

  return { getColor };
};
