import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Flame } from "lucide-react";
import { db } from "@/lib/db";
import { computeStreak, isDoneToday } from "@/lib/streak";

export function GreetingHeader() {
  const name = (useLiveQuery(() => db.settings.get("user_name"))?.value as string) ?? "Luis";
  const habits = useLiveQuery(() => db.habits.where("archived").equals(0).toArray()) ?? [];
  const allLogs = useLiveQuery(() => db.habit_logs.toArray()) ?? [];

  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";

  // Best streak across daily habits = "user streak"
  const userStreak = Math.max(
    0,
    ...habits.map((h) => computeStreak(h, allLogs.filter((l) => l.habit_id === h.id)))
  );

  const today = new Date();

  return (
    <header className="mb-8 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="label-caps mb-2">{format(today, "EEEE • d. MMMM • 'KW' w", { locale: de })}</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {greeting}, <span className="text-primary">{name}</span>
          </h1>
        </div>

        {userStreak > 0 && (
          <div className="surface !p-4 flex items-center gap-3">
            <Flame className="h-6 w-6 text-primary" />
            <div>
              <div className="font-mono text-2xl font-bold leading-none">{userStreak}</div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1">
                Tage Streak
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
