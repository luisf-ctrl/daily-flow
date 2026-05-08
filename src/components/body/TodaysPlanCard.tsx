import { Flame, ArrowRight, Dumbbell, Heart, Bed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSetWorkoutType } from "@/hooks/useBodyData";
import { todayISO } from "@/lib/dates";
import { planForDay } from "@/lib/fitness/plan";
import type { WorkoutType } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

const TYPE_ICON = {
  push: Dumbbell,
  pull: Dumbbell,
  legs: Dumbbell,
  cardio: Heart,
  rest: Bed,
  custom: Dumbbell,
} satisfies Record<WorkoutType, React.ComponentType<{ className?: string }>>;

const INTENSITY_LABEL = {
  low: "leicht",
  medium: "moderat",
  high: "intensiv",
};

export function TodaysPlanCard({
  currentType,
}: {
  currentType: WorkoutType | null;
}) {
  const todayPlan = planForDay();
  const setType = useSetWorkoutType();
  const Icon = TYPE_ICON[todayPlan.workoutType];

  const isStarted = currentType === todayPlan.workoutType;

  function startWorkout() {
    setType.mutate({ date: todayISO(), type: todayPlan.workoutType });
    // Scroll zum Logger nach kurzer Verzögerung
    setTimeout(() => {
      document
        .getElementById("workout-logger")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="pt-6 md:pt-8 space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="label-caps">Plan für {todayPlan.dayLabel}</p>
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                {todayPlan.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {todayPlan.description}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0">
            <Flame className="mr-1 h-3 w-3" />
            {todayPlan.durationMin} min · {INTENSITY_LABEL[todayPlan.intensity]}
          </Badge>
        </div>

        <Button
          onClick={startWorkout}
          disabled={setType.isPending}
          size="lg"
          className={cn("w-full sm:w-auto", isStarted && "bg-success hover:bg-success/90")}
        >
          {isStarted ? "Workout läuft" : "Workout starten"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
