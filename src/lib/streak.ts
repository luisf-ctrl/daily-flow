// Streak-Berechnung: läuft, solange jeden Tag (daily) oder N×/Woche (weekly_N) erfüllt.
// Bei einer Lücke (außerhalb Grace) wird der aktuelle Streak auf 0 gesetzt.
import { differenceInCalendarDays, format, startOfWeek, addDays } from "date-fns";
import type { Habit, HabitLog } from "./db";

export const todayKey = (d = new Date()) => format(d, "yyyy-MM-dd");

export function frequencyTarget(freq: Habit["frequency"]): { perWeek: number; daily: boolean } {
  switch (freq) {
    case "weekly_3": return { perWeek: 3, daily: false };
    case "weekly_4": return { perWeek: 4, daily: false };
    case "weekly_5": return { perWeek: 5, daily: false };
    default: return { perWeek: 7, daily: true };
  }
}

// Compute current streak in "weeks" for weekly habits, or in "days" for daily habits.
export function computeStreak(habit: Habit, logs: HabitLog[]): number {
  const done = logs.filter((l) => l.done).map((l) => l.log_date).sort();
  if (done.length === 0) return 0;

  const { daily, perWeek } = frequencyTarget(habit.frequency);
  const today = new Date();

  if (daily) {
    let streak = 0;
    const set = new Set(done);
    for (let i = 0; i < 365; i++) {
      const d = format(addDays(today, -i), "yyyy-MM-dd");
      if (set.has(d)) streak++;
      else if (i === 0) continue; // heute darf noch offen sein
      else break;
    }
    return streak;
  }

  // weekly: zähle aufeinanderfolgende Wochen, in denen perWeek erreicht wurde
  let streak = 0;
  for (let w = 0; w < 52; w++) {
    const wkStart = startOfWeek(addDays(today, -7 * w), { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => format(addDays(wkStart, i), "yyyy-MM-dd"));
    const hits = days.filter((d) => done.includes(d)).length;
    if (hits >= perWeek) streak++;
    else if (w === 0) continue; // diese Woche darf noch laufen
    else break;
  }
  return streak;
}

export function isDoneToday(logs: HabitLog[], date = todayKey()): HabitLog | undefined {
  return logs.find((l) => l.log_date === date && l.done === 1);
}

export function daysAgo(iso: string) {
  return differenceInCalendarDays(new Date(), new Date(iso));
}
