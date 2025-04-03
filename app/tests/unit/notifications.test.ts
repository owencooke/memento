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
      const mockDate = new Date(2025, 5, 15); // June 15, 2025
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

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

  // describe("scheduleAnnualNotification", () => {
  //   it("should schedule regular notification when date is not today", async () => {
  //     // Mock the date to be a regular day
  //     const mockDate = new Date(2025, 5, 15, 10, 30); // June 15, 2025, 10:30 AM
  //     jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

  //     // Test by calling scheduleAllNotifications and checking internal calls
  //     // Make sure birthday is NOT today
  //     (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 20)); // August 20

  //     // Set Platform to Android
  //     Platform.OS = "android";

  //     await scheduleAllNotifications("1990-08-20");

  //     // First call should be birthday notification (not today)
  //     expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
  //       1,
  //       {
  //         content: expect.any(Object),
  //         trigger: {
  //           type: "yearly",
  //           month: 8,
  //           day: 20,
  //           hour: 10,
  //           minute: 31, // current minute + 1
  //           repeats: true,
  //         },
  //       },
  //     );
  //   });

  //   it("should schedule immediate notification when date is today", async () => {
  //     // Mock the date to be Valentine's day
  //     const mockDate = new Date(2025, 1, 14, 10, 30); // Feb 14, 2025, 10:30 AM
  //     jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

  //     // Test by calling scheduleAllNotifications
  //     (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 20)); // Not Valentine's

  //     await scheduleAllNotifications("1990-08-20");

  //     // Get the Valentine's day notification (should be the 3rd call)
  //     expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
  //       3,
  //       {
  //         content: {
  //           title: "Happy Valentine's Day! 💘",
  //           body: "Keep love alive by saving your Valentine's cards and gifts in Memento!",
  //         },
  //         trigger: {
  //           type: "timeInterval",
  //           seconds: 15,
  //         },
  //       },
  //     );
  //   });

  //   it("should handle minute rollover into next hour correctly", async () => {
  //     // Mock the date to be 10:59 AM
  //     const mockDate = new Date(2025, 5, 15, 10, 59); // June 15, 2025, 10:59 AM
  //     jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

  //     // Make sure birthday is NOT today to get a regular notification
  //     (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 15)); // July 15, not today
  //     Platform.OS = "android";

  //     await scheduleAllNotifications("1990-07-15");

  //     // Check that the hour rolled over correctly in the birthday notification
  //     expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
  //       1,
  //       {
  //         content: expect.any(Object),
  //         trigger: expect.objectContaining({
  //           hour: 11, // Hour incremented
  //           minute: 0, // Minutes rolled over
  //         }),
  //       },
  //     );
  //   });

  //   it("should handle hour rollover at midnight correctly", async () => {
  //     // Mock the date to be 11:59 PM
  //     const mockDate = new Date(2025, 5, 15, 23, 59); // June 15, 2025, 23:59 PM
  //     jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

  //     // Make sure birthday is NOT today
  //     (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 15)); // July 15, not today
  //     Platform.OS = "android";

  //     await scheduleAllNotifications("1990-07-15");

  //     // Check that the hour rolled over correctly in the birthday notification
  //     expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
  //       1,
  //       {
  //         content: expect.any(Object),
  //         trigger: expect.objectContaining({
  //           hour: 0, // Hour rolled over to midnight
  //           minute: 0, // Minutes rolled over
  //         }),
  //       },
  //     );
  //   });

  //   it("should use yearly trigger type on Android", async () => {
  //     // Mock platform as Android directly
  //     Platform.OS = "android";

  //     // Mock the date
  //     const mockDate = new Date(2025, 5, 15, 10, 30);
  //     jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

  //     // Make sure birthday is NOT today
  //     (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 20)); // August 20

  //     await scheduleAllNotifications("1990-08-20");

  //     // Check that Android uses yearly trigger type
  //     expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
  //       1,
  //       {
  //         content: expect.any(Object),
  //         trigger: expect.objectContaining({
  //           type: "yearly",
  //         }),
  //       },
  //     );
  //   });
  // });

  // describe("Edge cases", () => {
  //   it("should handle leap year birthday (February 29) correctly", async () => {
  //     // Mock a date that is not Feb 29
  //     const mockDate = new Date(2025, 1, 28); // Feb 28, 2025 (non-leap year)
  //     jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

  //     // Birthday on Feb 29 (leap day)
  //     (getDateFromISO as jest.Mock).mockReturnValue(new Date(2024, 1, 29)); // Feb 29, 2024 (leap year)
  //     Platform.OS = "android";

  //     await scheduleAllNotifications("2024-02-29");

  //     // Verify notification scheduled for Feb 29
  //     expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
  //       1,
  //       {
  //         content: expect.any(Object),
  //         trigger: expect.objectContaining({
  //           month: 2, // February
  //           day: 29,
  //         }),
  //       },
  //     );
  //   });

  //   it("should handle current day being Christmas", async () => {
  //     // Mock the date to be Christmas
  //     const mockDate = new Date(2025, 11, 25, 10, 30); // December 25, 2025
  //     jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

  //     // Make sure birthday is NOT Christmas
  //     (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 20)); // August 20

  //     await scheduleAllNotifications("1990-08-20");

  //     // Find the Christmas notification by title in the calls
  //     const christmasCall = (
  //       Notifications.scheduleNotificationAsync as jest.Mock
  //     ).mock.calls.find((call) => call[0].content.title.includes("Holidays"));

  //     // Check that Christmas notification is immediate (15 seconds)
  //     expect(christmasCall[0]).toEqual({
  //       content: {
  //         title: "Happy Holidays! 🎄",
  //         body: "Capture the magic of your holiday memories in some new mementos!",
  //       },
  //       trigger: {
  //         type: "timeInterval",
  //         seconds: 15,
  //       },
  //     });
  //   });

  //   it("should handle all three special days if birthday is on Christmas", async () => {
  //     // Mock the date to be Christmas Day
  //     const mockDate = new Date(2025, 11, 25, 10, 30); // December 25, 2025
  //     jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

  //     // Birthday on Christmas
  //     (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 11, 25));

  //     await scheduleAllNotifications("1990-12-25");

  //     // Both birthday and Christmas should be immediate notifications
  //     expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);

  //     // Check that both birthday and Christmas are immediate
  //     const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock
  //       .calls;

  //     // Find the birthday notification
  //     const birthdayCall = calls.find((call) =>
  //       call[0].content.title.includes("Birthday"),
  //     );

  //     // Find the Christmas notification
  //     const christmasCall = calls.find((call) =>
  //       call[0].content.title.includes("Holidays"),
  //     );

  //     expect(birthdayCall[0].trigger.type).toBe("timeInterval");
  //     expect(christmasCall[0].trigger.type).toBe("timeInterval");
  //   });
  // });
});
