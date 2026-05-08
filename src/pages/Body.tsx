import { format } from "date-fns";
import { de } from "date-fns/locale";
import { AppShell } from "@/components/layout/AppShell";
import { TodaysPlanCard } from "@/components/body/TodaysPlanCard";
import { WorkoutOutlineCard } from "@/components/body/WorkoutOutlineCard";
import { WorkoutTypePicker } from "@/components/body/WorkoutTypePicker";
import { ExerciseSetLogger } from "@/components/body/ExerciseSetLogger";
import { WeekHeatmap } from "@/components/body/WeekHeatmap";
import { WeeklyPlanCard } from "@/components/body/WeeklyPlanCard";
import { MacroTargetsCard } from "@/components/body/MacroTargetsCard";
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

        {/* 1) Was steht heute an + Workout starten */}
        <TodaysPlanCard currentType={todayWorkout?.type ?? null} />

        {/* 2) Konkrete Übungen für heute (klickbar → vorfüllen) */}
        <WorkoutOutlineCard />

        {/* 3) Manueller Type-Picker (falls Plan abgeweicht wird) */}
        <WorkoutTypePicker
          currentType={todayWorkout?.type ?? null}
          recentTypes={recentTypes}
        />

        {/* 4) Sätze loggen */}
        <ExerciseSetLogger
          workoutId={todayWorkout?.id ?? null}
          sets={todaySets}
          lastSeen={lastSeen}
          totalVolume={Number(todayWorkout?.total_volume_kg ?? 0)}
        />

        {/* 5) Wochen-History + Plan-Übersicht */}
        <WeekHeatmap workouts={weekWorkouts} />
        <WeeklyPlanCard />

        {/* 6) Ernährung — Targets vor Quicklog */}
        <MacroTargetsCard
          vitals={vitals ?? null}
          nutrition={nutrition ?? null}
        />
        <NutritionQuickLog log={nutrition ?? null} />

        {/* 7) Vitals */}
        <VitalsQuickLog vitals={vitals ?? null} />
      </div>
    </AppShell>
  );
}
