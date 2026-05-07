import { useLiveQuery } from "dexie-react-hooks";
import { motion } from "framer-motion";
import { db } from "@/lib/db";
import { isDoneToday } from "@/lib/streak";

export function DailyProgressBar() {
  const habits = useLiveQuery(() => db.habits.where("archived").equals(0).toArray()) ?? [];
  const logs = useLiveQuery(() => db.habit_logs.toArray()) ?? [];

  const total = habits.length;
  const done = habits.filter((h) => isDoneToday(logs.filter((l) => l.habit_id === h.id))).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="surface">
      <div className="flex items-baseline justify-between mb-3">
        <p className="label-caps">Heute</p>
        <div className="font-mono text-sm text-muted-foreground">
          <span className="text-foreground font-bold text-lg">{done}</span> / {total} Habits
        </div>
      </div>
      <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        {pct === 100 ? "🔥 Tag perfekt — gönn dir was." : pct >= 50 ? "Gut unterwegs. Weiter so." : "Noch Luft nach oben."}
      </div>
    </div>
  );
}
