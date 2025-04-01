import React from "react";
import { Image, ImageProps } from "@/src/components/ui/image";

export type MementoLogoProps = Omit<ImageProps, "source" | "alt"> & {
  variant?: "default" | "sad";
};

export const MementoLogo = ({
  variant = "default",
  className = "",
  resizeMode = "contain",
  ...props
}: MementoLogoProps) => {
  return (
    <Image
      source={
        variant === "sad"
          ? require("@/src/assets/images/logo-sad.png")
          : require("@/src/assets/images/logo.png")
      }
      alt="Memento Logo"
      className={`${className}`}
      resizeMode={resizeMode}
      {...props}
    />
  );
};
