jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-auth-session", () => ({
  ...jest.requireActual("expo-auth-session"),
  makeRedirectUri: jest.fn(() => "http://localhost:8081/auth/redirect"),
}));
