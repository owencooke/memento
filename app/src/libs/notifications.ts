import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getDateFromISO } from "./date";

export async function scheduleAllNotifications(birthdayString: string) {
  scheduleBirthdayNotification(birthdayString);
  scheduleChristmasNotification();
  scheduleValentinesNotification();
  //   testImmediateNotification();
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

// Use for debugging in-app notifications (fires imemdiately)
async function testImmediateNotification() {
  await Notifications.scheduleNotificationAsync({
    content: { title: "Test Notification", body: "This is a testing message!" },
    trigger: null,
  });
}

/**
 * Schedules a repeating yearly notification.
 * Fires instantly if today matches the event date.
 */
async function scheduleAnnualNotification(
  title: string,
  body: string,
  month: number,
  day: number,
) {
  const now = new Date();
  const isToday = now.getMonth() + 1 === month && now.getDate() === day;

  const trigger = isToday
    ? null
    : {
        type:
          Platform.OS === "ios"
            ? Notifications.SchedulableTriggerInputTypes.CALENDAR
            : Notifications.SchedulableTriggerInputTypes.YEARLY,
        month,
        day,
        hour: now.getHours(),
        minute: now.getMinutes(),
        repeats: true,
      };

  console.log(
    `Scheduling: ${title} for ${isToday ? "NOW (5s)" : `${month}/${day}`}`,
  );

  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger,
  });
}
