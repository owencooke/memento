/**
 * @description Defines the messages and dates for "special days" to send notifications on.
 * @requirements FR-56
 */

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getDateFromISO } from "./date";

export async function scheduleAllNotifications(birthdayString: string) {
  scheduleBirthdayNotification(birthdayString);
  scheduleChristmasNotification();
  scheduleValentinesNotification();

  // Uncomment to debug
  //   testImmediateNotification();
  //   clearAllScheduledNotifications();
  //   logScheduledNotifications();
}

async function scheduleBirthdayNotification(birthdayString: string) {
  const date = getDateFromISO(birthdayString);
  await scheduleAnnualNotification(
    "Happy Birthday! 🎉",
    "Hope you have an amazing day! 🎂",
    date.getMonth() + 1,
    date.getDate(),
  );
}

async function scheduleChristmasNotification() {
  await scheduleAnnualNotification(
    "Merry Christmas! 🎄",
    "Hope you're having a wonderful holiday! 🎁",
    12,
    25,
  );
}

async function scheduleValentinesNotification() {
  await scheduleAnnualNotification(
    "Happy Valentine's Day! 💘",
    "Sending you love and good vibes! ❤️",
    2,
    14,
  );
}

/**
 * Schedules a repeating yearly notification for a given month/day.
 * If current day matches, (ex: birthday) notification should appear in 15 seconds.
 */
async function scheduleAnnualNotification(
  title: string,
  body: string,
  month: number,
  day: number,
) {
  const now = new Date();
  const isToday = now.getMonth() + 1 === month && now.getDate() === day;
  console.log(`Scheduling: ${title} for: ${month}/${day}`);

  const trigger: Notifications.NotificationTriggerInput = {
    type:
      Platform.OS === "ios"
        ? Notifications.SchedulableTriggerInputTypes.CALENDAR
        : Notifications.SchedulableTriggerInputTypes.YEARLY,
    month,
    day,
    hour: now.getHours(),
    minute: now.getMinutes() + 1,
    repeats: true,
  };

  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: !isToday
      ? trigger
      : {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 15,
        },
  });
}

// Helper functions for testing/debuggng notifications

async function testImmediateNotification() {
  await Notifications.scheduleNotificationAsync({
    content: { title: "Test Notification", body: "This is a testing message!" },
    trigger: null,
  });
}

async function logScheduledNotifications() {
  const scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();
  console.log(JSON.stringify(scheduledNotifications, undefined, 2));
}

async function clearAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log("✅ All scheduled notifications have been cleared.");
}
