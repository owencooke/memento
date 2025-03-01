import React, { useRef, useEffect } from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

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
  const autocompleteRef = useRef<any>(null);

  // Updates the autocomplete text when controlled value changes
  useEffect(() => {
    if (
      autocompleteRef.current &&
      value !== null &&
      typeof value === "string"
    ) {
      autocompleteRef.current.setAddressText(value);
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
        onChange({ text: data.description || "", lat, long });
      }}
      textInputProps={{
        onChangeText: (text) => onChange({ ...value, text }),
      }}
      query={{
        types: "(cities)",
        key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        language: "en",
      }}
      styles={{
        description: {
          width: "100%",
        },
      }}
    />
  );
};

export default LocationInput;
