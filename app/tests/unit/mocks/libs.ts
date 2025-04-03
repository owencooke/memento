jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-auth-session", () => ({
  ...jest.requireActual("expo-auth-session"),
  makeRedirectUri: jest.fn(() => "http://localhost:8081/auth/redirect"),
}));

jest.mock("@/src/libs/supabase", () => {
  return {
    supabase: {
      auth: {
        signOut: jest.fn(),
        onAuthStateChange: jest.fn(),
      },
    },
  };
});

jest.mock("expo-notifications", () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  SchedulableTriggerInputTypes: {
    CALENDAR: "calendar",
    YEARLY: "yearly",
    TIME_INTERVAL: "timeInterval",
  },
}));

jest.mock("react-native", () => ({
  Platform: {
    OS: "android", // Default to Android for tests
  },
}));

jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: "jpeg",
  },
}));

jest.mock("expo-file-system", () => ({
  getInfoAsync: jest.fn(),
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("mime", () => ({
  getType: jest.fn(),
}));

jest.mock("lodash", () => ({
  uniqueId: jest.fn((prefix) => `${prefix}123456`),
}));

// Mock implementations for File and FileReader for convertBlobToBase64Uri tests
const mockFileReader = {
  onload: null as (() => void) | null,
  result: "",
  readAsDataURL: function (blob: Blob) {
    // Simulate async operation
    setTimeout(() => {
      this.result = `data:${blob.type};base64,mockBase64Data`;
      if (this.onload) this.onload();
    }, 0);
  },
};

// @ts-ignore - create a minimal viable mock for the global
global.FileReader = jest.fn(() => mockFileReader) as any;
