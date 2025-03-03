import React, { useRef, useEffect } from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useColors } from "../../hooks/useColors";

export interface GeoLocation {
  text: string;
  lat?: number;
  long?: number;
}

interface LocationInputProps {
  value: GeoLocation | null;
  onChange?: (value: GeoLocation) => void;
}

const LocationInput = ({
  value = { text: "", lat: 0, long: 0 },
  onChange = (_) => {},
}: LocationInputProps) => {
  const { getColor } = useColors();
  const autocompleteRef = useRef<any>(null);
  const prevTextRef = useRef<string>("");

  // Updates the autocomplete text when controlled value changes
  useEffect(() => {
    if (
      autocompleteRef.current &&
      value !== null &&
      value.text !== prevTextRef.current
    ) {
      prevTextRef.current = value.text;
      autocompleteRef.current.setAddressText(value.text);
    }
  }, [value]);

  return (
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
        prevTextRef.current = text;
        onChange({ text, lat, long });
      }}
      textInputProps={{
        onChangeText: (text) => {
          if (text !== prevTextRef.current) {
            prevTextRef.current = text;
            onChange({ ...value, text });
          }
        },
      }}
      query={{
        types: "(cities)",
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
  );
};

export default LocationInput;
