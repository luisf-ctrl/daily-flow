import { format, subDays, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Workout, WorkoutType } from "@/integrations/supabase/types";

const TYPE_LABEL: Record<WorkoutType, string> = {
  push: "Push",
  pull: "Pull",
  legs: "Legs",
  cardio: "Cardio",
  rest: "Rest",
  custom: "Custom",
};

const TYPE_COLOR: Record<WorkoutType, string> = {
  push: "bg-primary/80 text-primary-foreground",
  pull: "bg-success/80 text-foreground",
  legs: "bg-warning/80 text-background",
  cardio: "bg-destructive/80 text-foreground",
  rest: "bg-white/[0.06] text-muted-foreground",
  custom: "bg-white/[0.12] text-foreground",
};

export function WeekHeatmap({ workouts }: { workouts: Workout[] }) {
  const today = new Date();
  const days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));

  const maxVolume = Math.max(
    1,
    ...workouts.map((w) => Number(w.total_volume_kg ?? 0)),
  );

  return (
    <section>
      <header className="mb-4 space-y-1">
        <p className="label-caps">7 Tage</p>
        <h2 className="text-xl font-semibold tracking-tight">
          Wochenübersicht
        </h2>
      </header>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => {
              const w = workouts.find((x) => isSameDay(new Date(x.date), d));
              const isToday = isSameDay(d, today);
              const volume = Number(w?.total_volume_kg ?? 0);
              const intensity = volume / maxVolume;

              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    "rounded-lg border p-2 text-center transition",
                    isToday ? "border-primary/40" : "border-white/[0.04]",
                    w ? TYPE_COLOR[w.type ?? "custom"] : "bg-card",
                  )}
                  style={
                    w && volume > 0
                      ? { opacity: 0.55 + 0.45 * intensity }
                      : undefined
                  }
                >
                  <p className="text-[10px] uppercase tracking-wider opacity-80">
                    {format(d, "EE", { locale: de })}
                  </p>
                  <p className="font-mono text-base font-bold">
                    {format(d, "d")}
                  </p>
                  {w ? (
                    <>
                      <p className="text-[10px] mt-1 truncate">
                        {TYPE_LABEL[w.type ?? "custom"]}
                      </p>
                      {volume > 0 && (
                        <p className="text-[10px] font-mono opacity-90">
                          {Math.round(volume / 1000)}k
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-[10px] mt-1 opacity-50">—</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
            {(["push", "pull", "legs", "cardio", "rest"] as const).map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-block h-2 w-2 rounded-sm",
                    TYPE_COLOR[t].split(" ")[0],
                  )}
                />
                <span className="text-muted-foreground">{TYPE_LABEL[t]}</span>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
