import React, { useRef, useEffect } from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useColors } from "../../hooks/useColors";
import { View, ViewProps } from "react-native";

export interface GeoLocation {
  text: string;
  lat?: number;
  long?: number;
  bbox?: BoundingBox;
}

// This is the type that represents the bounding box received from places api
export interface BoundingBox {
  northeast: {
    lat: number;
    lng: number;
  };
  southwest: {
    lat: number;
    lng: number;
  };
}

interface LocationInputProps extends ViewProps {
  value: GeoLocation | null;
  onChange?: (value: GeoLocation) => void;
  queryType?: string;
}

const LocationInput = ({
  value = { text: "", lat: 0, long: 0 },
  onChange = (_) => {},
  queryType = "(cities)", // queryType defaults to cities
  ...props
}: LocationInputProps) => {
  const { getColor } = useColors();
  const autocompleteRef = useRef<any>(null);
  const prevTextRef = useRef<string>("");
  const programmaticChangeRef = useRef(false);

  useEffect(() => {
    if (
      autocompleteRef.current &&
      value !== null &&
      value.text !== prevTextRef.current
    ) {
      if (programmaticChangeRef.current) {
        // If this change came from the user typing, don't call setAddressText
        programmaticChangeRef.current = false;
        return;
      }

      // Only set address text if the change came externally
      autocompleteRef.current.setAddressText(value.text);
      prevTextRef.current = value.text;
    }
  }, [value]);

  return (
    <View {...props}>
      <GooglePlacesAutocomplete
        ref={autocompleteRef}
        keyboardShouldPersistTaps="handled"
        enablePoweredByContainer={false}
        debounce={300}
        fetchDetails={true}
        placeholder="Find a place…"
        // Handle when user selects an autocomplete option
        onPress={(data, details) => {
          const lat = details?.geometry.location.lat;
          const long = details?.geometry.location.lng;
          const text = data.description || "";
          const bbox = details?.geometry.viewport; // This is how the bounding box is accessed

          programmaticChangeRef.current = true;
          prevTextRef.current = text;

          onChange({ text, lat, long, bbox });
        }}
        textInputProps={{
          autoCorrect: false,
          autoCapitalize: "none",
          spellCheck: false,
          onChangeText: (text) => {
            if (text !== prevTextRef.current) {
              prevTextRef.current = text;
              onChange({ ...value, text });
            }
          },
        }}
        query={{
          types: queryType,
          key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
          language: "en",
        }}
        styles={{
          description: {
            width: "100%",
            color: getColor("typography-900"),
          },
          textInput: {
            backgroundColor: getColor("background-0"),
            borderWidth: 1,
            borderColor: getColor("background-300"),
            color: getColor("typography-900"),
          },
          row: {
            backgroundColor: getColor("background-0"),
          },
          listView: {
            backgroundColor: getColor("background-0"),
          },
          separator: { backgroundColor: getColor("background-300") },
        }}
      />
    </View>
  );
};

export default LocationInput;
