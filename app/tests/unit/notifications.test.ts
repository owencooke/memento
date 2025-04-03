import { getDateFromISO } from "@/src/libs/date";
import {
  BIRTHDAY_CONTENT,
  scheduleAllNotifications,
  VALENTINES_CONTENT,
  XMAS_CONTENT,
} from "@/src/libs/notifications";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { mockCurrentDate } from "./mocks/date";

// Mock dependencies
jest.mock("@/src/libs/date", () => ({
  getDateFromISO: jest.fn(),
}));

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

    it("should handle multiple edge cases: iOS, time overflow, and special days", async () => {
      Platform.OS = "ios";
      mockCurrentDate(11, 25, 2025, 23, 59); // December 25 (Christmas) at 23:59

      // 3. Test birthday on Christmas (two special days coinciding)
      const christmasBirthday = new Date(1990, 11, 25);
      (getDateFromISO as jest.Mock).mockReturnValue(christmasBirthday);

      await scheduleAllNotifications("1990-12-25");

      // Verify results - both Christmas and Birthday should be immediate
      const birthdayCall = findNotificationByTitle("Birthday");
      const christmasCall = findNotificationByTitle("Holidays");
      const valentinesCall = findNotificationByTitle("Valentine's");

      // Birthday is today (Christmas) - should be immediate
      expect(birthdayCall[0].trigger).toEqual({
        type: "timeInterval",
        seconds: 15,
      });

      // Christmas is today - should be immediate
      expect(christmasCall[0].trigger).toEqual({
        type: "timeInterval",
        seconds: 15,
      });

      // Valentine's is not today - should be scheduled with iOS calendar type
      // and have correct hour/minute with overflow handled
      expect(valentinesCall[0].trigger).toEqual({
        type: "calendar", // iOS uses calendar type
        month: 2,
        day: 14,
        hour: 0, // Should handle overflow from 23+1
        minute: 0, // Should handle overflow from 59+1
        repeats: true,
      });

      // Reset Platform for other tests
      Platform.OS = "android";
    });
  });
});
