# Collage Generation

The Jest tests for frontend white-box testing were written with the help of Generative AI and iterated upon to improve the quality of the result (code and testing coverage). The prompts and output are cited below.

LLM Model used: Claude 3.7 Sonnet

## Prompt

### User Input

write a jest unit test for all possibilities of these date utilities

### LLM Output

Plan for Testing Date Utilities
Create a test file for the date utilities
Test toISODateString function with:
Date object input
EXIF format string (YYYY:MM:DD HH:MM:SS)
ISO format string (YYYY-MM-DDTHH:MM:SS)
Edge cases
Test getDateFromISO function with:
Valid ISO date string
Edge cases like month boundaries
Include tests for different date formats and potential errors

```typescript
import { toISODateString, getDateFromISO } from "@/src/libs/date";

describe("toISODateString", () => {
  test("converts Date object to ISO string format YYYY-MM-DD", () => {
    const date = new Date(2023, 0, 15); // January 15, 2023
    expect(toISODateString(date)).toBe("2023-01-15");

    const date2 = new Date(2023, 11, 31); // December 31, 2023
    expect(toISODateString(date2)).toBe("2023-12-31");

    const date3 = new Date(2023, 9, 5); // October 5, 2023
    expect(toISODateString(date3)).toBe("2023-10-05");
  });

  test("converts EXIF format string (YYYY:MM:DD HH:MM:SS) to ISO date string", () => {
    const exifDate = "2023:02:15 14:30:25";
    expect(toISODateString(exifDate)).toBe("2023-02-15");

    const exifDate2 = "2022:12:01 09:45:00";
    expect(toISODateString(exifDate2)).toBe("2022-12-01");
  });

  test("converts ISO format string (YYYY-MM-DDTHH:MM:SS) to ISO date string", () => {
    const isoDate = "2023-03-20T10:15:30";
    expect(toISODateString(isoDate)).toBe("2023-03-20");

    const isoDate2 = "2023-11-05T22:45:10.123Z";
    expect(toISODateString(isoDate2)).toBe("2023-11-05");
  });

  test("handles single-digit months and days properly", () => {
    const date = new Date(2023, 0, 1); // January 1, 2023
    expect(toISODateString(date)).toBe("2023-01-01");

    const date2 = new Date(2023, 8, 9); // September 9, 2023
    expect(toISODateString(date2)).toBe("2023-09-09");
  });
});

describe("getDateFromISO", () => {
  test("converts ISO date string to Date object", () => {
    const dateStr = "2023-04-15";
    const date = getDateFromISO(dateStr);

    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(3); // April is 3 (zero-based index)
    expect(date.getDate()).toBe(15);
  });

  test("handles month boundaries correctly", () => {
    const dateStr1 = "2023-01-01";
    const date1 = getDateFromISO(dateStr1);
    expect(date1.getFullYear()).toBe(2023);
    expect(date1.getMonth()).toBe(0); // January is 0
    expect(date1.getDate()).toBe(1);

    const dateStr2 = "2023-12-31";
    const date2 = getDateFromISO(dateStr2);
    expect(date2.getFullYear()).toBe(2023);
    expect(date2.getMonth()).toBe(11); // December is 11
    expect(date2.getDate()).toBe(31);
  });

  test("preserved local time", () => {
    const dateStr = "2023-06-15";
    const date = getDateFromISO(dateStr);

    // Check if it's initialized to midnight in local time
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);

    // Converting back should give the same date string
    expect(toISODateString(date)).toBe(dateStr);
  });
});
```

## Prompt

### User Input

ok great. let's do the same thing for string utilities

### LLM Output

I'll create tests for the string utilities following the same pattern as the date utilities test file.

```typescript
import {
  toTitleCase,
  removeUnderscores,
  mimeTypeToExtension,
  fileNameSafeString,
} from "@/src/libs/string";

describe("toTitleCase", () => {
  test("converts strings to title case", () => {
    expect(toTitleCase("hello world")).toBe("Hello World");
    expect(toTitleCase("this is a TEST")).toBe("This Is A Test");
    expect(toTitleCase("already Title Case")).toBe("Already Title Case");
  });

  test("handles special characters and mixed cases", () => {
    expect(toTitleCase("hello-world")).toBe("Hello-World");
    expect(toTitleCase("camelCase format")).toBe("Camelcase Format");
    expect(toTitleCase("snake_case_format")).toBe("Snake_case_format");
  });

  test("handles empty strings", () => {
    expect(toTitleCase("")).toBe("");
  });
});

describe("removeUnderscores", () => {
  test("replaces underscores with spaces", () => {
    expect(removeUnderscores("hello_world")).toBe("hello world");
    expect(removeUnderscores("this_is_a_test")).toBe("this is a test");
    expect(removeUnderscores("no_underscores_here")).toBe(
      "no underscores here",
    );
  });

  test("handles strings without underscores", () => {
    expect(removeUnderscores("hello world")).toBe("hello world");
    expect(removeUnderscores("nounderscores")).toBe("nounderscores");
  });

  test("handles empty strings", () => {
    expect(removeUnderscores("")).toBe("");
  });
});

describe("mimeTypeToExtension", () => {
  test("extracts extension from common MIME types", () => {
    expect(mimeTypeToExtension("image/jpeg")).toBe("jpeg");
    expect(mimeTypeToExtension("image/png")).toBe("png");
    expect(mimeTypeToExtension("application/pdf")).toBe("pdf");
    expect(mimeTypeToExtension("text/html")).toBe("html");
  });

  test("handles MIME types with parameters", () => {
    expect(mimeTypeToExtension("image/jpeg; charset=utf-8")).toBe("jpeg");
  });

  test("defaults to png for invalid MIME types", () => {
    expect(mimeTypeToExtension("invalid")).toBe("png");
    expect(mimeTypeToExtension("")).toBe("png");
  });
});

describe("fileNameSafeString", () => {
  test("removes special characters from strings", () => {
    expect(fileNameSafeString("file-name.txt")).toBe("filenametxt");
    expect(fileNameSafeString("photo (2).jpg")).toBe("photo 2jpg");
    expect(fileNameSafeString("hello!@#$%^&*()_+world")).toBe("hello_world");
  });

  test("preserves alphanumeric characters and spaces", () => {
    expect(fileNameSafeString("Hello World 123")).toBe("Hello World 123");
    expect(fileNameSafeString("test file")).toBe("test file");
  });

  test("handles empty strings", () => {
    expect(fileNameSafeString("")).toBe("");
  });
});
```

## Prompt

### User Input

write unit tests for all the non testing functions for notifications (not log or test). make sure to test edge cases for dates

### LLM Output

I'll create comprehensive unit tests for the notification functions, focusing on the non-test functions and edge cases for dates.

```typescript
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { scheduleAllNotifications } from "./notifications";
import { getDateFromISO } from "./date";

// Mock dependencies
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
    OS: "ios", // Default to iOS for tests
  },
}));

jest.mock("./date", () => ({
  getDateFromISO: jest.fn(),
}));

describe("Notification functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("scheduleAllNotifications", () => {
    it("should cancel all notifications and schedule birthday, Christmas, and Valentine's notifications", async () => {
      // Mock the date to be a random day (not a special day)
      const mockDate = new Date(2025, 5, 15); // June 15, 2025
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Setup mock for getDateFromISO
      const mockBirthday = new Date(1990, 2, 20); // March 20
      (getDateFromISO as jest.Mock).mockReturnValue(mockBirthday);

      await scheduleAllNotifications("1990-03-20");

      expect(
        Notifications.cancelAllScheduledNotificationsAsync,
      ).toHaveBeenCalledTimes(1);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);

      // Verify birthday notification was scheduled
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Happy Birthday! 🎂",
          body: "Make your day unforgettable — save your birthday cards and memories in Memento!",
        },
        trigger: {
          type: "calendar",
          month: 3, // March
          day: 20,
          hour: expect.any(Number),
          minute: expect.any(Number),
          repeats: true,
        },
      });

      // Verify Christmas notification was scheduled
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Happy Holidays! 🎄",
          body: "Capture the magic of your holiday memories in some new mementos!",
        },
        trigger: {
          type: "calendar",
          month: 12,
          day: 25,
          hour: expect.any(Number),
          minute: expect.any(Number),
          repeats: true,
        },
      });

      // Verify Valentine's notification was scheduled
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Happy Valentine's Day! 💘",
          body: "Keep love alive by saving your Valentine's cards and gifts in Memento!",
        },
        trigger: {
          type: "calendar",
          month: 2,
          day: 14,
          hour: expect.any(Number),
          minute: expect.any(Number),
          repeats: true,
        },
      });
    });
  });

  describe("scheduleAnnualNotification", () => {
    it("should schedule regular notification when date is not today", async () => {
      // Mock the date to be a regular day
      const mockDate = new Date(2025, 5, 15, 10, 30); // June 15, 2025, 10:30 AM
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Test by calling scheduleAllNotifications and checking internal calls
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 2, 20)); // March 20

      await scheduleAllNotifications("1990-03-20");

      // First call should be birthday notification (not today)
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
        1,
        {
          content: expect.any(Object),
          trigger: {
            type: "calendar",
            month: 3,
            day: 20,
            hour: 10,
            minute: 31, // current minute + 1
            repeats: true,
          },
        },
      );
    });

    it("should schedule immediate notification when date is today", async () => {
      // Mock the date to be Valentine's day
      const mockDate = new Date(2025, 1, 14, 10, 30); // Feb 14, 2025, 10:30 AM
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Test by calling scheduleAllNotifications
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 2, 20)); // Not Valentine's

      await scheduleAllNotifications("1990-03-20");

      // Get the Valentine's day notification (should be the 3rd call)
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
        3,
        {
          content: {
            title: "Happy Valentine's Day! 💘",
            body: "Keep love alive by saving your Valentine's cards and gifts in Memento!",
          },
          trigger: {
            type: "timeInterval",
            seconds: 15,
          },
        },
      );
    });

    it("should handle minute rollover into next hour correctly", async () => {
      // Mock the date to be 10:59 AM
      const mockDate = new Date(2025, 5, 15, 10, 59); // June 15, 2025, 10:59 AM
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 6, 15)); // July 15, not today

      await scheduleAllNotifications("1990-07-15");

      // Check that the hour rolled over correctly in the birthday notification
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
        1,
        {
          content: expect.any(Object),
          trigger: expect.objectContaining({
            hour: 11, // Hour incremented
            minute: 0, // Minutes rolled over
          }),
        },
      );
    });

    it("should handle hour rollover at midnight correctly", async () => {
      // Mock the date to be 11:59 PM
      const mockDate = new Date(2025, 5, 15, 23, 59); // June 15, 2025, 23:59 PM
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 6, 15)); // July 15, not today

      await scheduleAllNotifications("1990-07-15");

      // Check that the hour rolled over correctly in the birthday notification
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
        1,
        {
          content: expect.any(Object),
          trigger: expect.objectContaining({
            hour: 0, // Hour rolled over to midnight
            minute: 0, // Minutes rolled over
          }),
        },
      );
    });

    it("should use yearly trigger type on Android", async () => {
      // Mock platform as Android
      jest.spyOn(Platform, "OS", "get").mockReturnValue("android");

      // Mock the date
      const mockDate = new Date(2025, 5, 15, 10, 30);
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 2, 20)); // March 20

      await scheduleAllNotifications("1990-03-20");

      // Check that Android uses yearly trigger type
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
        1,
        {
          content: expect.any(Object),
          trigger: expect.objectContaining({
            type: "yearly",
          }),
        },
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle leap year birthday (February 29) correctly", async () => {
      const mockDate = new Date(2025, 1, 28); // Feb 28, 2025 (non-leap year)
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Birthday on Feb 29 (leap day)
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(2024, 1, 29)); // Feb 29, 2024 (leap year)

      await scheduleAllNotifications("2024-02-29");

      // Verify notification scheduled for Feb 29
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
        1,
        {
          content: expect.any(Object),
          trigger: expect.objectContaining({
            month: 2, // February
            day: 29,
          }),
        },
      );
    });

    it("should handle current day being Christmas", async () => {
      const mockDate = new Date(2025, 11, 25, 10, 30); // December 25, 2025
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 2, 20)); // Not Christmas

      await scheduleAllNotifications("1990-03-20");

      // Check that Christmas notification is immediate (15 seconds)
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Happy Holidays! 🎄",
          body: "Capture the magic of your holiday memories in some new mementos!",
        },
        trigger: {
          type: "timeInterval",
          seconds: 15,
        },
      });
    });

    it("should handle all three special days if birthday is on Christmas", async () => {
      const mockDate = new Date(2025, 11, 25, 10, 30); // Christmas Day
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Birthday on Christmas
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 11, 25));

      await scheduleAllNotifications("1990-12-25");

      // Both birthday and Christmas should be immediate notifications
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);

      // Check that both birthday and Christmas are immediate
      const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock
        .calls;

      // Find the birthday notification
      const birthdayCall = calls.find((call) =>
        call[0].content.title.includes("Birthday"),
      );

      // Find the Christmas notification
      const christmasCall = calls.find((call) =>
        call[0].content.title.includes("Holidays"),
      );

      expect(birthdayCall[0].trigger.type).toBe("timeInterval");
      expect(christmasCall[0].trigger.type).toBe("timeInterval");
    });
  });
});
```

## Prompt

### User Input

none of the tests are passing. i will share the error messages beneath this prompt. fix the issues with the unit tests.

also note: i changed the mock platform from iOS to Android. so account for that

### LLM Output

I'll fix the unit tests for the notification functions, addressing the issues shown in the error messages. The main problems appear to be:

The dates in tests are being detected as "today" when we don't expect them to be
Issues with mocking the Platform.OS property for Android
Problems with expected trigger types and values
Here's the updated test file:

```typescript
import { getDateFromISO } from "@/src/libs/date";
import { scheduleAllNotifications } from "@/src/libs/notifications";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Mock dependencies
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

jest.mock("@/src/libs/date", () => ({
  getDateFromISO: jest.fn(),
}));

describe("Notification functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("scheduleAllNotifications", () => {
    it("should cancel all notifications and schedule birthday, Christmas, and Valentine's notifications", async () => {
      // Mock the date to be a random day (not a special day)
      const mockDate = new Date(2025, 5, 15); // June 15, 2025
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Setup mock for getDateFromISO - make sure birthday is NOT today
      const mockBirthday = new Date(1990, 7, 20); // August 20 (different from current date)
      (getDateFromISO as jest.Mock).mockReturnValue(mockBirthday);

      // Make sure the trigger type is correct for Android
      Platform.OS = "android";

      await scheduleAllNotifications("1990-08-20");

      expect(
        Notifications.cancelAllScheduledNotificationsAsync,
      ).toHaveBeenCalledTimes(1);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);

      // Verify birthday notification was scheduled with yearly type for Android
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Happy Birthday! 🎂",
          body: "Make your day unforgettable — save your birthday cards and memories in Memento!",
        },
        trigger: {
          type: "yearly",
          month: 8, // August
          day: 20,
          hour: expect.any(Number),
          minute: expect.any(Number),
          repeats: true,
        },
      });

      // Verify Christmas notification was scheduled
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Happy Holidays! 🎄",
          body: "Capture the magic of your holiday memories in some new mementos!",
        },
        trigger: {
          type: "yearly",
          month: 12,
          day: 25,
          hour: expect.any(Number),
          minute: expect.any(Number),
          repeats: true,
        },
      });

      // Verify Valentine's notification was scheduled
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Happy Valentine's Day! 💘",
          body: "Keep love alive by saving your Valentine's cards and gifts in Memento!",
        },
        trigger: {
          type: "yearly",
          month: 2,
          day: 14,
          hour: expect.any(Number),
          minute: expect.any(Number),
          repeats: true,
        },
      });
    });
  });

  describe("scheduleAnnualNotification", () => {
    it("should schedule regular notification when date is not today", async () => {
      // Mock the date to be a regular day
      const mockDate = new Date(2025, 5, 15, 10, 30); // June 15, 2025, 10:30 AM
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Test by calling scheduleAllNotifications and checking internal calls
      // Make sure birthday is NOT today
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 20)); // August 20

      // Set Platform to Android
      Platform.OS = "android";

      await scheduleAllNotifications("1990-08-20");

      // First call should be birthday notification (not today)
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
        1,
        {
          content: expect.any(Object),
          trigger: {
            type: "yearly",
            month: 8,
            day: 20,
            hour: 10,
            minute: 31, // current minute + 1
            repeats: true,
          },
        },
      );
    });

    it("should schedule immediate notification when date is today", async () => {
      // Mock the date to be Valentine's day
      const mockDate = new Date(2025, 1, 14, 10, 30); // Feb 14, 2025, 10:30 AM
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Test by calling scheduleAllNotifications
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 20)); // Not Valentine's

      await scheduleAllNotifications("1990-08-20");

      // Get the Valentine's day notification (should be the 3rd call)
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
        3,
        {
          content: {
            title: "Happy Valentine's Day! 💘",
            body: "Keep love alive by saving your Valentine's cards and gifts in Memento!",
          },
          trigger: {
            type: "timeInterval",
            seconds: 15,
          },
        },
      );
    });

    it("should handle minute rollover into next hour correctly", async () => {
      // Mock the date to be 10:59 AM
      const mockDate = new Date(2025, 5, 15, 10, 59); // June 15, 2025, 10:59 AM
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Make sure birthday is NOT today to get a regular notification
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 15)); // July 15, not today
      Platform.OS = "android";

      await scheduleAllNotifications("1990-07-15");

      // Check that the hour rolled over correctly in the birthday notification
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
        1,
        {
          content: expect.any(Object),
          trigger: expect.objectContaining({
            hour: 11, // Hour incremented
            minute: 0, // Minutes rolled over
          }),
        },
      );
    });

    it("should handle hour rollover at midnight correctly", async () => {
      // Mock the date to be 11:59 PM
      const mockDate = new Date(2025, 5, 15, 23, 59); // June 15, 2025, 23:59 PM
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Make sure birthday is NOT today
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 15)); // July 15, not today
      Platform.OS = "android";

      await scheduleAllNotifications("1990-07-15");

      // Check that the hour rolled over correctly in the birthday notification
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
        1,
        {
          content: expect.any(Object),
          trigger: expect.objectContaining({
            hour: 0, // Hour rolled over to midnight
            minute: 0, // Minutes rolled over
          }),
        },
      );
    });

    it("should use yearly trigger type on Android", async () => {
      // Mock platform as Android directly
      Platform.OS = "android";

      // Mock the date
      const mockDate = new Date(2025, 5, 15, 10, 30);
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Make sure birthday is NOT today
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 20)); // August 20

      await scheduleAllNotifications("1990-08-20");

      // Check that Android uses yearly trigger type
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
        1,
        {
          content: expect.any(Object),
          trigger: expect.objectContaining({
            type: "yearly",
          }),
        },
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle leap year birthday (February 29) correctly", async () => {
      // Mock a date that is not Feb 29
      const mockDate = new Date(2025, 1, 28); // Feb 28, 2025 (non-leap year)
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Birthday on Feb 29 (leap day)
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(2024, 1, 29)); // Feb 29, 2024 (leap year)
      Platform.OS = "android";

      await scheduleAllNotifications("2024-02-29");

      // Verify notification scheduled for Feb 29
      expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
        1,
        {
          content: expect.any(Object),
          trigger: expect.objectContaining({
            month: 2, // February
            day: 29,
          }),
        },
      );
    });

    it("should handle current day being Christmas", async () => {
      // Mock the date to be Christmas
      const mockDate = new Date(2025, 11, 25, 10, 30); // December 25, 2025
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Make sure birthday is NOT Christmas
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 20)); // August 20

      await scheduleAllNotifications("1990-08-20");

      // Find the Christmas notification by title in the calls
      const christmasCall = (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mock.calls.find((call) => call[0].content.title.includes("Holidays"));

      // Check that Christmas notification is immediate (15 seconds)
      expect(christmasCall[0]).toEqual({
        content: {
          title: "Happy Holidays! 🎄",
          body: "Capture the magic of your holiday memories in some new mementos!",
        },
        trigger: {
          type: "timeInterval",
          seconds: 15,
        },
      });
    });

    it("should handle all three special days if birthday is on Christmas", async () => {
      // Mock the date to be Christmas Day
      const mockDate = new Date(2025, 11, 25, 10, 30); // December 25, 2025
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

      // Birthday on Christmas
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 11, 25));

      await scheduleAllNotifications("1990-12-25");

      // Both birthday and Christmas should be immediate notifications
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);

      // Check that both birthday and Christmas are immediate
      const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock
        .calls;

      // Find the birthday notification
      const birthdayCall = calls.find((call) =>
        call[0].content.title.includes("Birthday"),
      );

      // Find the Christmas notification
      const christmasCall = calls.find((call) =>
        call[0].content.title.includes("Holidays"),
      );

      expect(birthdayCall[0].trigger.type).toBe("timeInterval");
      expect(christmasCall[0].trigger.type).toBe("timeInterval");
    });
  });
});
```
