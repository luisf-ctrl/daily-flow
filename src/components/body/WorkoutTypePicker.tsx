import {
  ArrowDownCircle,
  ArrowUpCircle,
  Footprints,
  Heart,
  Bed,
  type LucideIcon,
} from "lucide-react";
import { useSetWorkoutType } from "@/hooks/useBodyData";
import { todayISO } from "@/lib/dates";
import type { WorkoutType } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type TypeMeta = {
  key: WorkoutType;
  label: string;
  icon: LucideIcon;
  hint: string;
};

const TYPES: TypeMeta[] = [
  { key: "push", label: "Push", icon: ArrowUpCircle, hint: "Brust, Schultern, Triceps" },
  { key: "pull", label: "Pull", icon: ArrowDownCircle, hint: "Rücken, Biceps" },
  { key: "legs", label: "Legs", icon: Footprints, hint: "Beine, Glutes" },
  { key: "cardio", label: "Cardio", icon: Heart, hint: "Laufen, Schwimmen, Bike" },
  { key: "rest", label: "Rest", icon: Bed, hint: "Pause / Mobility" },
];

const ROTATION: WorkoutType[] = [
  "push",
  "pull",
  "legs",
  "push",
  "pull",
  "legs",
  "rest",
];

function suggestNext(lastTypes: WorkoutType[]): WorkoutType {
  if (lastTypes.length === 0) return "push";
  const last = lastTypes[0];
  const idx = ROTATION.indexOf(last);
  if (idx === -1) return "push";
  return ROTATION[(idx + 1) % ROTATION.length];
}

export function WorkoutTypePicker({
  currentType,
  recentTypes,
}: {
  currentType: WorkoutType | null;
  recentTypes: WorkoutType[];
}) {
  const date = todayISO();
  const setType = useSetWorkoutType();
  const suggested = suggestNext(recentTypes);

  return (
    <section>
      <header className="mb-4 space-y-1">
        <p className="label-caps">Heutiges Workout</p>
        <h2 className="text-xl font-semibold tracking-tight">
          Was steht heute an?
        </h2>
        {!currentType && (
          <p className="text-sm text-muted-foreground">
            Vorschlag basierend auf den letzten Tagen:{" "}
            <strong className="text-primary">
              {TYPES.find((t) => t.key === suggested)?.label}
            </strong>
          </p>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {TYPES.map((t) => {
          const Icon = t.icon;
          const isActive = currentType === t.key;
          const isSuggested = !currentType && t.key === suggested;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setType.mutate({ date, type: t.key })}
              disabled={setType.isPending}
              aria-pressed={isActive}
              className={cn(
                "group rounded-2xl border p-4 text-left transition-all disabled:opacity-50",
                isActive
                  ? "border-primary bg-primary/10"
                  : isSuggested
                    ? "border-primary/30 bg-card hover:bg-white/[0.04]"
                    : "border-white/[0.06] bg-card hover:bg-white/[0.04]",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 mb-3 transition-colors",
                  isActive
                    ? "text-primary"
                    : isSuggested
                      ? "text-primary/70"
                      : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <p
                className={cn(
                  "font-semibold",
                  isActive ? "text-primary" : "text-foreground",
                )}
              >
                {t.label}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {t.hint}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
