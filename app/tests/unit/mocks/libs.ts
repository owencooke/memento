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
