import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * Schedules a repeating yearly notification.
 * If the month/day match the current date, notification should appear in 30s.
 */
async function scheduleAnnualNotification(
  title: string,
  body: string,
  month: number,
  day: number,
) {
  const now = new Date();
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      type:
        Platform.OS === "ios"
          ? Notifications.SchedulableTriggerInputTypes.CALENDAR
          : Notifications.SchedulableTriggerInputTypes.YEARLY,
      month,
      day,
      hour: now.getHours(),
      minute: now.getMinutes(),
      seconds: now.getSeconds() + 30,
      repeats: true,
    },
  });
}

export async function scheduleBirthdayNotification(dateString: string) {
  const date = new Date(dateString);
  await scheduleAnnualNotification(
    "Happy Birthday! 🎉",
    "Hope you have an amazing day! 🎂",
    date.getMonth() + 1,
    date.getDate(),
  );
}

export async function scheduleChristmasNotification() {
  await scheduleAnnualNotification(
    "Merry Christmas! 🎄",
    "Hope you're having a wonderful holiday! 🎁",
    12,
    25,
  );
}

export async function scheduleValentinesNotification() {
  await scheduleAnnualNotification(
    "Happy Valentine's Day! 💘",
    "Sending you love and good vibes! ❤️",
    2,
    14,
  );
}
