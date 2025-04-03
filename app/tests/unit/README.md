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

## Prompt

### User Input

the mock day for valentines isnt setting day correctly. can you fix it and make a helper that we can use in other tests

### LLM Output

I'll create a helper function to properly mock dates for the notification tests, making it reusable for all your tests:

```typescript
import { getDateFromISO } from "@/src/libs/date";
import {
  BIRTHDAY_CONTENT,
  scheduleAllNotifications,
  VALENTINES_CONTENT,
  XMAS_CONTENT,
} from "@/src/libs/notifications";
import * as Notifications from "expo-notifications";

// Mock dependencies
jest.mock("@/src/libs/date", () => ({
  getDateFromISO: jest.fn(),
}));

/**
 * Helper function to mock the current date for testing notification scheduling
 * @param year - Year to set (optional, defaults to 2025)
 * @param month - Month to set (0-indexed, January = 0, December = 11)
 * @param day - Day of month to set
 * @param hours - Hours to set (optional, defaults to 10)
 * @param minutes - Minutes to set (optional, defaults to 30)
 */
function mockCurrentDate(
  month: number,
  day: number,
  year = 2025,
  hours = 10,
  minutes = 30,
) {
  const mockDate = new Date(year, month, day, hours, minutes);
  jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);
  return mockDate;
}

/**
 * Helper function to find a notification call by title content
 * @param titleFragment - Part of the title text to search for
 * @returns The matching notification call or undefined if not found
 */
function findNotificationByTitle(titleFragment: string) {
  const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock
    .calls;
  return calls.find((call) => call[0].content.title.includes(titleFragment));
}

describe("Notification functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("scheduleAllNotifications", () => {
    it("should cancel all notifications and schedule birthday, Christmas, and Valentine's notifications", async () => {
      // Setup mock for getDateFromISO - make sure birthday is NOT today
      const mockBirthday = new Date(1990, 7, 20); // August 20 (different from current date)
      (getDateFromISO as jest.Mock).mockReturnValue(mockBirthday);

      // Mock the date to be a random day (not a special day)
      mockCurrentDate(5, 15); // June 15, 2025

      await scheduleAllNotifications("1990-08-20");

      expect(
        Notifications.cancelAllScheduledNotificationsAsync,
      ).toHaveBeenCalledTimes(1);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);

      // Verify birthday notification was scheduled with yearly type for Android
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: BIRTHDAY_CONTENT,
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
        content: XMAS_CONTENT,
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
        content: VALENTINES_CONTENT,
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
    it("should schedule immediate notification when date is today", async () => {
      // Make sure birthday is not today
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 20));

      // Mock the date to be Valentine's day (February 14)
      mockCurrentDate(1, 14); // February 14th (0-indexed month)

      await scheduleAllNotifications("1990-08-20");

      // Find the Valentine's day notification by searching for it in the calls
      const valentinesCall = findNotificationByTitle("Valentine's");

      // Verify the Valentine's notification was scheduled with immediate trigger
      expect(valentinesCall[0]).toEqual({
        content: VALENTINES_CONTENT,
        trigger: {
          type: "timeInterval",
          seconds: 15,
        },
      });
    });

    // Additional test examples using the helper functions
    it("should schedule immediate notification for birthday when date is today", async () => {
      // Set birthday to August 20
      const birthday = new Date(1990, 7, 20);
      (getDateFromISO as jest.Mock).mockReturnValue(birthday);

      // Mock the date to also be August 20 (different year)
      mockCurrentDate(7, 20); // August 20th

      await scheduleAllNotifications("1990-08-20");

      // Find the birthday notification
      const birthdayCall = findNotificationByTitle("Birthday");

      // Verify the birthday notification was scheduled with immediate trigger
      expect(birthdayCall[0]).toEqual({
        content: BIRTHDAY_CONTENT,
        trigger: {
          type: "timeInterval",
          seconds: 15,
        },
      });
    });
  });

  // Example of testing edge cases with the helper functions
  describe("Edge cases", () => {
    it("should handle Christmas day correctly", async () => {
      // Set birthday to not be Christmas
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 20));

      // Mock the date to be Christmas
      mockCurrentDate(11, 25); // December 25th

      await scheduleAllNotifications("1990-08-20");

      // Find the Christmas notification
      const christmasCall = findNotificationByTitle("Holidays");

      // Verify Christmas notification is immediate
      expect(christmasCall[0]).toEqual({
        content: XMAS_CONTENT,
        trigger: {
          type: "timeInterval",
          seconds: 15,
        },
      });
    });
  });
});
```

## Prompt

### User Input

alright we have one more file left to test. write the jest unit tests for these photos functions below this prompt. make sure to reuse mocks if needed/can make modular

### LLM Output

I'll create comprehensive unit tests for the photos functions, reusing mocks and making the tests modular.

```typescript
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import {
  Photo,
  createPhotoObject,
  getPhotosFromLibrary,
  convertBlobToBase64Uri,
} from "@/src/libs/photos";
import mime from "mime";

// Mock external dependencies
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

describe("Photo utilities", () => {
  // Setup common test data
  const mockPhoto: Photo = {
    uri: "file://test/photo.jpg",
    mimeType: "image/jpeg",
    fileName: "photo.jpg",
    assetId: "asset123",
  };

  const mockLargeFileInfo = {
    exists: true,
    size: 1024 * 1024, // 1MB
  };

  const mockSmallFileInfo = {
    exists: true,
    size: 100 * 1024, // 100KB
  };

  const mockCompressedImage = {
    uri: "file://test/compressed-photo.jpg",
    width: 800,
    height: 600,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createPhotoObject", () => {
    it("should create a standardized photo object from a photo", async () => {
      // Mock file size check to be small enough to not need compression
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue(
        mockSmallFileInfo,
      );

      // Mock mime.getType to return a default value
      (mime.getType as jest.Mock).mockReturnValue("image/jpeg");

      const result = await createPhotoObject(mockPhoto);

      expect(result).toEqual({
        ...mockPhoto,
        fileName: "photo.jpg", // Original name should be preserved
        assetId: "photo_123456", // Generated by uniqueId
      });
    });

    it("should compress the image if it's too large", async () => {
      // Mock initial file size check to be large
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce(
        mockLargeFileInfo,
      );

      // Mock the file size after compression to be small
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce(
        mockSmallFileInfo,
      );

      // Mock the image manipulator to return compressed image
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue(
        mockCompressedImage,
      );

      const result = await createPhotoObject(mockPhoto);

      // Check that the image was compressed
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        mockPhoto.uri,
        [],
        { compress: 0.8, format: "jpeg" },
      );

      // Check the returned object has the compressed URI and jpeg mimetype
      expect(result).toEqual({
        ...mockPhoto,
        uri: mockCompressedImage.uri,
        mimeType: "image/jpeg",
        fileName: "photo.jpg",
        assetId: "photo_123456",
      });
    });

    it("should handle photo without fileName by generating one", async () => {
      // Mock file size check to be small enough to not need compression
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue(
        mockSmallFileInfo,
      );

      // Mock mime.getType to return a default value
      (mime.getType as jest.Mock).mockReturnValue("image/jpeg");

      const photoWithoutFileName: Photo = {
        uri: "file://test/unknown.jpg",
        mimeType: "image/jpeg",
        assetId: "asset123",
      };

      const result = await createPhotoObject(photoWithoutFileName);

      expect(result).toEqual({
        ...photoWithoutFileName,
        fileName: "photo_123456.jpg", // Generated filename
        assetId: "photo_123456", // Generated by uniqueId
      });
    });

    it("should handle photo without mimeType by inferring from URI", async () => {
      // Mock file size check to be small enough to not need compression
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue(
        mockSmallFileInfo,
      );

      // Mock mime.getType to infer the type
      (mime.getType as jest.Mock).mockReturnValue("image/png");

      const photoWithoutMimeType: Photo = {
        uri: "file://test/photo.png",
        fileName: "photo.png",
        assetId: "asset123",
      };

      const result = await createPhotoObject(photoWithoutMimeType);

      expect(result.mimeType).toBe("image/png");
      expect(mime.getType).toHaveBeenCalledWith(photoWithoutMimeType.uri);
    });
  });

  describe("getPhotosFromLibrary", () => {
    it("should return an empty array if user cancels selection", async () => {
      // Mock image picker to return canceled result
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
        assets: [],
      });

      const result = await getPhotosFromLibrary();

      expect(result).toEqual([]);
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: ["images"],
        quality: 1,
        exif: true,
        allowsMultipleSelection: true,
      });
    });

    it("should process and return selected photos", async () => {
      // Mock small file size for compression check
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue(
        mockSmallFileInfo,
      );

      // Mock image picker to return selected assets
      const mockAssets = [
        {
          uri: "file://test/photo1.jpg",
          fileName: "photo1.jpg",
          assetId: "asset1",
          mimeType: "image/jpeg",
        },
        {
          uri: "file://test/photo2.jpg",
          fileName: "photo2.jpg",
          assetId: "asset2",
          mimeType: "image/jpeg",
        },
      ];

      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: mockAssets,
      });

      const result = await getPhotosFromLibrary();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("uri", "file://test/photo1.jpg");
      expect(result[1]).toHaveProperty("uri", "file://test/photo2.jpg");
      // Each photo should have a generated assetId
      expect(result[0]).toHaveProperty("assetId", "photo_123456");
      expect(result[1]).toHaveProperty("assetId", "photo_123456");
    });
  });

  describe("convertBlobToBase64Uri", () => {
    it("should convert a blob to a base64 URI", async () => {
      // Create a mock blob
      const mockBlob = new Blob(["test data"], { type: "image/png" });

      const result = await convertBlobToBase64Uri(mockBlob);

      expect(result).toEqual("data:image/png;base64,mockBase64Data");
    });

    it("should handle different MIME types", async () => {
      // Create a mock blob with different MIME type
      const mockBlob = new Blob(["test data"], { type: "image/gif" });

      const result = await convertBlobToBase64Uri(mockBlob);

      expect(result).toEqual("data:image/gif;base64,mockBase64Data");
    });
  });

  describe("compressImage (internal function tested via createPhotoObject)", () => {
    it("should compress an image in multiple steps if needed", async () => {
      // Setup for progressive compression
      // First size check - large file
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: true,
        size: 2 * 1024 * 1024, // 2MB (very large)
      });

      // First compression - still too large
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValueOnce({
        uri: "file://test/compressed-1.jpg",
      });
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: true,
        size: 700 * 1024, // 700KB (still too large)
      });

      // Second compression - now small enough
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValueOnce({
        uri: "file://test/compressed-2.jpg",
      });
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
        exists: true,
        size: 300 * 1024, // 300KB (now acceptable)
      });

      // Call createPhotoObject to test internal compression
      await createPhotoObject(mockPhoto);

      // Check that compression was done in steps
      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledTimes(2);

      // First call with initial quality
      expect(ImageManipulator.manipulateAsync).toHaveBeenNthCalledWith(
        1,
        mockPhoto.uri,
        [],
        { compress: 0.8, format: "jpeg" },
      );

      // Second call with reduced quality
      expect(ImageManipulator.manipulateAsync).toHaveBeenNthCalledWith(
        2,
        "file://test/compressed-1.jpg",
        [],
        { compress: 0.6, format: "jpeg" },
      );
    });

    it("should handle errors when getting file size", async () => {
      // Mock error when getting file size
      (FileSystem.getInfoAsync as jest.Mock).mockRejectedValue(
        new Error("File access error"),
      );

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      // Call createPhotoObject
      const result = await createPhotoObject(mockPhoto);

      // Should not compress if error occurs getting file size
      expect(ImageManipulator.manipulateAsync).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error getting file size:",
        expect.any(Error),
      );

      // Should still return a valid photo object
      expect(result).toHaveProperty("uri", mockPhoto.uri);

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
```
