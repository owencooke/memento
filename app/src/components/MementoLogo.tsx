import React from "react";
import { Image, ImageProps } from "@/src/components/ui/image";

export type LogoProps = Omit<ImageProps, "source" | "alt">;

/**
 * Logo component for displaying the Memento logo consistently across the app
 */
export const MementoLogo = ({
  className = "",
  resizeMode = "contain",
  ...props
}: LogoProps) => {
  return (
    <Image
      source={require("@/src/assets/images/logo.png")}
      alt="Memento Logo"
      className={`${className}`}
      resizeMode={resizeMode}
      {...props}
    />
  );
};
