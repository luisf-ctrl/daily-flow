import { useLiveQuery } from "dexie-react-hooks";
import { format, addDays, startOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { db, type Habit } from "@/lib/db";
import { cn } from "@/lib/utils";

export function HabitHeatmap({ habit, weeks = 12 }: { habit: Habit; weeks?: number }) {
  const logs = useLiveQuery(() => db.habit_logs.where("habit_id").equals(habit.id).toArray(), [habit.id]) ?? [];
  const doneSet = new Set(logs.filter((l) => l.done).map((l) => l.log_date));

  const today = new Date();
  const start = startOfWeek(addDays(today, -7 * (weeks - 1)), { weekStartsOn: 1 });

  const cols: { date: Date; key: string; done: boolean; future: boolean }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      const key = format(date, "yyyy-MM-dd");
      col.push({ date, key, done: doneSet.has(key), future: date > today });
    }
    cols.push(col);
  }

  return (
    <div className="flex gap-1">
      {cols.map((col, i) => (
        <div key={i} className="flex flex-col gap-1">
          {col.map((cell) => (
            <div
              key={cell.key}
              title={`${format(cell.date, "EEE d. MMM", { locale: de })}${cell.done ? " ✓" : ""}`}
              className={cn(
                "w-3 h-3 rounded-[3px]",
                cell.future
                  ? "bg-white/[0.03]"
                  : cell.done
                    ? "bg-success"
                    : "bg-white/[0.06]"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
