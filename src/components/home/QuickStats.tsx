import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { todayKey } from "@/lib/streak";

interface Stat {
  label: string;
  value: string;
  unit?: string;
}

export function QuickStats() {
  const today = todayKey();
  const logs = useLiveQuery(() => db.habit_logs.where("log_date").equals(today).toArray()) ?? [];
  const habits = useLiveQuery(() => db.habits.toArray()) ?? [];

  const sum = (habitName: string) => {
    const habit = habits.find((h) => h.name.toLowerCase().includes(habitName.toLowerCase()));
    if (!habit) return 0;
    return logs.filter((l) => l.habit_id === habit.id).reduce((acc, l) => acc + (l.value ?? 0), 0);
  };

  const stats: Stat[] = [
    { label: "Seiten", value: String(sum("Lesen") || 0) },
    { label: "Wasser", value: String(sum("Wasser") || 0), unit: "L" },
    { label: "Protein", value: String(sum("Protein") || 0), unit: "g" },
    { label: "Gespart", value: String(sum("Sparen") || 0), unit: "€" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="surface !p-4">
          <p className="label-caps mb-2">{s.label}</p>
          <div className="flex items-baseline gap-1">
            <span className="stat-number">{s.value}</span>
            {s.unit && <span className="text-xs text-muted-foreground">{s.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
