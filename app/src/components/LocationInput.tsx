import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const LocationInput = () => {
  return (
    <GooglePlacesAutocomplete
      placeholder="Search"
      onPress={(data, details = null) => {
        // 'details' is provided when fetchDetails = true
        console.log(data, details);
      }}
      query={{
        key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        language: "en",
      }}
    />
  );
};

export default LocationInput;
