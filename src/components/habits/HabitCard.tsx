import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "framer-motion";
import { Check, Flame } from "lucide-react";
import { db, uid, type Habit } from "@/lib/db";
import { computeStreak, isDoneToday, todayKey } from "@/lib/streak";
import { cn } from "@/lib/utils";

interface Props {
  habit: Habit;
  compact?: boolean;
}

export function HabitCard({ habit, compact }: Props) {
  const logs = useLiveQuery(() => db.habit_logs.where("habit_id").equals(habit.id).toArray(), [habit.id]) ?? [];
  const streak = computeStreak(habit, logs);
  const todayLog = isDoneToday(logs);
  const done = !!todayLog;

  const toggle = async () => {
    if (navigator.vibrate) navigator.vibrate(10);
    if (todayLog) {
      await db.habit_logs.delete(todayLog.id);
      return;
    }
    await db.habit_logs.add({
      id: uid(),
      habit_id: habit.id,
      log_date: todayKey(),
      done: 1,
      value: habit.target_value,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className={cn("surface flex items-center gap-4", compact && "p-4")}>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={toggle}
        aria-label={`${habit.name} ${done ? "abhaken rückgängig" : "abhaken"}`}
        className={cn(
          "shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center transition-colors",
          done
            ? "bg-success border-success text-success-foreground"
            : "border-white/10 hover:border-white/30 text-muted-foreground"
        )}
      >
        {done ? <Check className="h-5 w-5" strokeWidth={3} /> : <span className="text-xl">{habit.icon}</span>}
      </motion.button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium truncate">{habit.name}</span>
          {streak > 0 && (
            <span className="flex items-center gap-1 text-xs text-primary font-mono">
              <Flame className="h-3.5 w-3.5" />
              {streak}
            </span>
          )}
        </div>
        {habit.target_value && (
          <div className="text-xs text-muted-foreground mt-0.5">
            Ziel: {habit.target_value} {habit.unit}
          </div>
        )}
      </div>

      {!compact && habit.icon && <div className="text-2xl opacity-60">{habit.icon}</div>}
    </div>
  );
}
