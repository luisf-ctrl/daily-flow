import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { todayISO } from "@/lib/dates";
import type {
  ExerciseSet,
  NutritionLog,
  VitalsLog,
  Workout,
  WorkoutType,
} from "@/integrations/supabase/types";

// =============================================================================
// Today's workout
// =============================================================================

export function useTodayWorkout() {
  const { user } = useAuth();
  const date = todayISO();
  return useQuery({
    queryKey: ["workout", date],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("date", date)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Workout | null;
    },
  });
}

export function useWeekWorkouts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["workouts-week"],
    enabled: Boolean(user),
    queryFn: async () => {
      const sevenDaysAgo = format(subDays(new Date(), 6), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .gte("date", sevenDaysAgo)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Workout[];
    },
  });
}

export function useTodaySets(workoutId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["exercise-sets", workoutId],
    enabled: Boolean(user) && Boolean(workoutId),
    queryFn: async () => {
      if (!workoutId) return [];
      const { data, error } = await supabase
        .from("exercise_sets")
        .select("*")
        .eq("workout_id", workoutId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ExerciseSet[];
    },
  });
}

// Last-time-Lookup pro Übung (jüngster Satz aus den letzten 30 Tagen,
// ohne das heutige Workout)
export type LastSeen = Record<
  string,
  { weight: number; reps: number; date: string }
>;

export function useLastSeen() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["last-seen-exercises"],
    enabled: Boolean(user),
    queryFn: async (): Promise<LastSeen> => {
      const today = todayISO();
      const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

      const { data: pastWorkouts } = await supabase
        .from("workouts")
        .select("id, date")
        .gte("date", thirtyDaysAgo)
        .lt("date", today);

      if (!pastWorkouts || pastWorkouts.length === 0) return {};

      const workoutMap = new Map(
        pastWorkouts.map((w) => [w.id as string, w.date as string]),
      );

      const { data: sets } = await supabase
        .from("exercise_sets")
        .select("exercise_name, weight_kg, reps, workout_id, created_at")
        .in(
          "workout_id",
          pastWorkouts.map((w) => w.id),
        )
        .order("created_at", { ascending: false });

      const result: LastSeen = {};
      for (const s of sets ?? []) {
        const w = Number(s.weight_kg);
        const r = Number(s.reps);
        if (!result[s.exercise_name as string] && w && r) {
          result[s.exercise_name as string] = {
            weight: w,
            reps: r,
            date: workoutMap.get(s.workout_id as string) ?? "",
          };
        }
      }
      return result;
    },
  });
}

export function useSetWorkoutType() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { date: string; type: WorkoutType }) => {
      if (!user) throw new Error("Nicht eingeloggt");

      const { data: existing } = await supabase
        .from("workouts")
        .select("id")
        .eq("user_id", user.id)
        .eq("date", input.date)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("workouts")
          .update({ type: input.type })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("workouts")
          .insert({ user_id: user.id, date: input.date, type: input.type });
        if (error) throw error;
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["workout", vars.date] });
      queryClient.invalidateQueries({ queryKey: ["workouts-week"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Fehler");
    },
  });
}

async function recomputeWorkoutVolume(workoutId: string) {
  const { data: sets } = await supabase
    .from("exercise_sets")
    .select("weight_kg, reps")
    .eq("workout_id", workoutId);
  const total = (sets ?? []).reduce((sum, s) => {
    const w = Number(s.weight_kg ?? 0);
    const r = Number(s.reps ?? 0);
    return sum + w * r;
  }, 0);
  await supabase
    .from("workouts")
    .update({ total_volume_kg: total })
    .eq("id", workoutId);
}

export function useAddExerciseSet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      workoutDate: string;
      exercise_name: string;
      weight_kg: number | null;
      reps: number | null;
    }) => {
      if (!user) throw new Error("Nicht eingeloggt");

      // Workout für heute holen oder anlegen
      let { data: workout } = await supabase
        .from("workouts")
        .select("id")
        .eq("user_id", user.id)
        .eq("date", input.workoutDate)
        .maybeSingle();

      if (!workout) {
        const { data: created, error: insErr } = await supabase
          .from("workouts")
          .insert({
            user_id: user.id,
            date: input.workoutDate,
            type: "custom",
          })
          .select("id")
          .single();
        if (insErr) throw insErr;
        workout = created;
      }

      const { count } = await supabase
        .from("exercise_sets")
        .select("id", { count: "exact", head: true })
        .eq("workout_id", workout!.id)
        .eq("exercise_name", input.exercise_name);
      const setNumber = (count ?? 0) + 1;

      const { error } = await supabase.from("exercise_sets").insert({
        workout_id: workout!.id,
        exercise_name: input.exercise_name,
        weight_kg: input.weight_kg,
        reps: input.reps,
        set_number: setNumber,
      });
      if (error) throw error;

      await recomputeWorkoutVolume(workout!.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout"] });
      queryClient.invalidateQueries({ queryKey: ["workouts-week"] });
      queryClient.invalidateQueries({ queryKey: ["exercise-sets"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Fehler");
    },
  });
}

export function useDeleteExerciseSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; workoutId: string }) => {
      const { error } = await supabase
        .from("exercise_sets")
        .delete()
        .eq("id", input.id);
      if (error) throw error;
      await recomputeWorkoutVolume(input.workoutId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout"] });
      queryClient.invalidateQueries({ queryKey: ["workouts-week"] });
      queryClient.invalidateQueries({ queryKey: ["exercise-sets"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Fehler");
    },
  });
}

// =============================================================================
// Nutrition (1 Row pro Tag)
// =============================================================================

export function useTodayNutrition() {
  const { user } = useAuth();
  const date = todayISO();
  return useQuery({
    queryKey: ["nutrition", date],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nutrition_logs")
        .select("*")
        .eq("date", date)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as NutritionLog | null;
    },
  });
}

export function useUpsertNutrition() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      date: string;
      kcal: number | null;
      protein_g: number | null;
      water_l: number | null;
    }) => {
      if (!user) throw new Error("Nicht eingeloggt");
      const { error } = await supabase
        .from("nutrition_logs")
        .upsert(
          { user_id: user.id, ...input },
          { onConflict: "user_id,date" },
        );
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      toast.success("Ernährung aktualisiert");
      queryClient.invalidateQueries({ queryKey: ["nutrition", vars.date] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Fehler");
    },
  });
}

// =============================================================================
// Vitals (1 Row pro Tag)
// =============================================================================

export function useTodayVitals() {
  const { user } = useAuth();
  const date = todayISO();
  return useQuery({
    queryKey: ["vitals", date],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vitals")
        .select("*")
        .eq("date", date)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as VitalsLog | null;
    },
  });
}

export function useUpsertVitals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      date: string;
      sleep_h: number | null;
      rhr: number | null;
      hrv: number | null;
      weight_kg: number | null;
    }) => {
      if (!user) throw new Error("Nicht eingeloggt");
      const { error } = await supabase
        .from("vitals")
        .upsert(
          { user_id: user.id, ...input },
          { onConflict: "user_id,date" },
        );
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      toast.success("Vitals aktualisiert");
      queryClient.invalidateQueries({ queryKey: ["vitals", vars.date] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Fehler");
    },
  });
}
