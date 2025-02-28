import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

interface LocationInputProps {
  value?: string | null;
  onChange?: (value: string) => void;
}

const LocationInput = ({
  value = "",
  onChange = (_) => {},
}: LocationInputProps) => {
  return (
    <GooglePlacesAutocomplete
      keyboardShouldPersistTaps="handled"
      enablePoweredByContainer={false}
      placeholder="Search location"
      onPress={(data) => onChange(data.description || "")}
      textInputProps={{
        value,
        onChangeText: (text) => onChange(text),
      }}
      query={{
        key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        language: "en",
      }}
    />
  );
};

export default LocationInput;
