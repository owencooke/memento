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

  describe("scheduleAnnualNotification", () => {
    it("should schedule immediate notification when date is today", async () => {
      (getDateFromISO as jest.Mock).mockReturnValue(new Date(1990, 7, 20));

      // Mock the date to be Valentine's day
      const valentinesDay = new Date();
      valentinesDay.setMonth(1); // February (0-indexed)
      valentinesDay.setDate(14); // 14th day

      // Mock current date to be Valentine's day
      jest.spyOn(global, "Date").mockImplementation(() => {
        return valentinesDay;
      });

      await scheduleAllNotifications("1990-08-20");

      // Find the Valentine's day notification by searching for it in the calls

      const valentinesCall = (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mock.calls.find((call) =>
        call[0].content.title.includes("Valentine's"),
      );

      // Verify the Valentine's notification was scheduled with immediate trigger
      expect(valentinesCall[0]).toEqual({
        content: VALENTINES_CONTENT,
        trigger: {
          type: "timeInterval",
          seconds: 15,
        },
      });
    });
  });
});
