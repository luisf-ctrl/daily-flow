import { Card, CardContent } from "@/components/ui/card";
import { WEEKLY_PLAN } from "@/lib/fitness/plan";
import { cn } from "@/lib/utils";
import type { WorkoutType } from "@/integrations/supabase/types";

const TYPE_COLOR: Record<WorkoutType, string> = {
  push: "border-primary/30 bg-primary/10 text-primary",
  pull: "border-success/30 bg-success/10 text-success",
  legs: "border-warning/30 bg-warning/10 text-warning",
  cardio: "border-destructive/30 bg-destructive/10 text-destructive",
  rest: "border-white/[0.08] bg-white/[0.02] text-muted-foreground",
  custom: "border-white/[0.08] bg-white/[0.02] text-foreground",
};

const TYPE_LABEL: Record<WorkoutType, string> = {
  push: "Push",
  pull: "Pull",
  legs: "Legs",
  cardio: "Cardio",
  rest: "Rest",
  custom: "Custom",
};

export function WeeklyPlanCard() {
  const today = new Date().getDay();

  // Reihenfolge Mo-So statt So-Sa
  const ordered = [...WEEKLY_PLAN].sort((a, b) => {
    const ka = a.dayKey === 0 ? 7 : a.dayKey;
    const kb = b.dayKey === 0 ? 7 : b.dayKey;
    return ka - kb;
  });

  return (
    <section>
      <header className="mb-4 space-y-1">
        <p className="label-caps">5 + 1 + 1 Split</p>
        <h2 className="text-xl font-semibold tracking-tight">Wochenplan</h2>
        <p className="text-sm text-muted-foreground">
          5× Krafttraining (Push/Pull/Legs) + 1× HIIT + 1× Z2-Cardio.
          Maximaler Hebel für Recomp bei 6–8 h Training/Woche.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {ordered.map((d) => {
          const isToday = d.dayKey === today;
          return (
            <Card
              key={d.dayKey}
              className={cn(
                "transition-colors",
                isToday && "border-primary/40 bg-primary/[0.03]",
              )}
            >
              <CardContent className="pt-4 pb-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "text-[11px] uppercase tracking-wider",
                      isToday ? "text-primary font-semibold" : "text-muted-foreground",
                    )}
                  >
                    {d.shortLabel} {isToday && "· Heute"}
                  </p>
                  <span
                    className={cn(
                      "rounded-md border px-1.5 py-0.5 text-[10px] uppercase tracking-wider",
                      TYPE_COLOR[d.workoutType],
                    )}
                  >
                    {TYPE_LABEL[d.workoutType]}
                  </span>
                </div>
                <p className="text-sm font-medium leading-tight">{d.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {d.durationMin} min
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
