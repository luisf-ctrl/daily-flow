import { format } from "date-fns";
import { de } from "date-fns/locale";
import { AppShell } from "@/components/layout/AppShell";
import { WorkoutTypePicker } from "@/components/body/WorkoutTypePicker";
import { ExerciseSetLogger } from "@/components/body/ExerciseSetLogger";
import { WeekHeatmap } from "@/components/body/WeekHeatmap";
import { NutritionQuickLog } from "@/components/body/NutritionQuickLog";
import { VitalsQuickLog } from "@/components/body/VitalsQuickLog";
import {
  useTodayWorkout,
  useWeekWorkouts,
  useTodaySets,
  useLastSeen,
  useTodayNutrition,
  useTodayVitals,
} from "@/hooks/useBodyData";
import { todayISO } from "@/lib/dates";
import type { WorkoutType } from "@/integrations/supabase/types";

export default function Body() {
  const date = todayISO();
  const { data: todayWorkout } = useTodayWorkout();
  const { data: weekWorkouts = [] } = useWeekWorkouts();
  const { data: todaySets = [] } = useTodaySets(todayWorkout?.id ?? null);
  const { data: lastSeen = {} } = useLastSeen();
  const { data: nutrition } = useTodayNutrition();
  const { data: vitals } = useTodayVitals();

  const recentTypes = weekWorkouts
    .map((w) => w.type)
    .filter((t): t is WorkoutType => Boolean(t));

  return (
    <AppShell>
      <div className="space-y-10">
        <header className="space-y-1">
          <p className="label-caps">
            {format(new Date(date), "EEEE", { locale: de })}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Body
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(date), "d. MMMM yyyy", { locale: de })}
          </p>
        </header>

        <WorkoutTypePicker
          currentType={todayWorkout?.type ?? null}
          recentTypes={recentTypes}
        />

        <ExerciseSetLogger
          workoutId={todayWorkout?.id ?? null}
          sets={todaySets}
          lastSeen={lastSeen}
          totalVolume={Number(todayWorkout?.total_volume_kg ?? 0)}
        />

        <WeekHeatmap workouts={weekWorkouts} />

        <NutritionQuickLog log={nutrition ?? null} />

        <VitalsQuickLog vitals={vitals ?? null} />
      </div>
    </AppShell>
  );
}
