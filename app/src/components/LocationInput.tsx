import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

interface LocationInputProps {
  value?: string | null;
  onChange?: (value: string) => void;
}

const LocationInput = ({ value = "", onChange }: LocationInputProps) => {
  return (
    <GooglePlacesAutocomplete
      keyboardShouldPersistTaps="handled"
      enablePoweredByContainer={false}
      placeholder="Search location"
      onPress={(data, details = null) => {
        // Send the selected place data
        if (onChange) {
          onChange(data.description || "");
        }
      }}
      textInputProps={{
        value,
        onChangeText: (text) => {
          // Also trigger onChange when typing to update the form state
          if (onChange) {
            onChange(text);
          }
        },
      }}
      query={{
        key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        language: "en",
      }}
    />
  );
};

export default LocationInput;
