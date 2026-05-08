import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { templateFor, planForDay } from "@/lib/fitness/plan";

// Custom-Event-Name, auf das der ExerciseSetLogger lauscht.
// Bei Klick auf eine Übung in der Outline wird dieser Name in den Logger
// vorgefüllt — kein Props-Drilling, kein Store nötig.
export const PREFILL_EVENT = "daily-flow:prefill-exercise" as const;

export function WorkoutOutlineCard() {
  const todayPlan = planForDay();
  const variantA =
    todayPlan.dayKey === 1 || todayPlan.dayKey === 2
      ? "A"
      : todayPlan.dayKey === 5 || todayPlan.dayKey === 6
        ? "B"
        : "default";
  const template = templateFor(todayPlan.workoutType, variantA);

  if (!template || template.exercises.length === 0) return null;

  function loadIntoLogger(name: string) {
    const event = new CustomEvent(PREFILL_EVENT, { detail: { name } });
    window.dispatchEvent(event);
    setTimeout(() => {
      document
        .getElementById("workout-logger")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return (
    <section>
      <header className="mb-4 space-y-1">
        <p className="label-caps">Heutige Übungen</p>
        <h2 className="text-xl font-semibold tracking-tight">{template.title}</h2>
        <p className="text-sm text-muted-foreground">
          Tippe eine Übung an → wird im Logger unten vorgefüllt. Last 1–2 Sätze
          mit RIR 1–2 für Hypertrophie-Sweet-Spot.
        </p>
      </header>

      <Card>
        <CardContent className="pt-6 pb-4">
          <ul className="divide-y divide-white/[0.04]">
            {template.exercises.map((ex, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => loadIntoLogger(ex.name)}
                  className="group w-full flex items-center gap-3 py-3 text-left hover:bg-white/[0.02] -mx-2 px-2 rounded-md transition-colors"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/[0.08] text-xs font-mono text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">
                      {ex.name}
                    </p>
                    {ex.notes && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {ex.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="secondary" className="font-mono">
                      {ex.sets} × {ex.repsMin}
                      {ex.repsMin !== ex.repsMax ? `–${ex.repsMax}` : ""}
                    </Badge>
                    {ex.rir > 0 && (
                      <Badge variant="outline" className="font-mono">
                        RIR {ex.rir}
                      </Badge>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
