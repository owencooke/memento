import { useTheme, Theme } from "../context/ThemeContext";
import { colors } from "@/src/components/ui/gluestack-ui-provider/config";

type ColorKeys = keyof typeof colors.light | keyof typeof colors.dark;

const getColorValue = (colorName: string, mode: Theme): string => {
  const colorValue = colors[mode][`--color-${colorName}` as ColorKeys];
  if (!colorValue) {
    throw new Error(`Color ${colorName} not found in ${mode} mode`);
  }
  return `rgb(${colorValue})`;
};

/**
 * Hook that provides access to the Gluestack/Nativewind CSS color variables,
 * for use in TypeScript code. Automatically adapts to the current theme.
 *
 * Example usage:
 * ```typescript
 * const { getColor } = useColors();
 * getColor("primary-500");
 * ```
 */
export const useColors = () => {
  const { theme } = useTheme();

  const getColor = (colorName: string): string =>
    getColorValue(colorName, theme);

  return { getColor };
};
