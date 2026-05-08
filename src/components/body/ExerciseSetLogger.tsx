import { useState, useRef, useMemo, useEffect, FormEvent } from "react";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  useAddExerciseSet,
  useDeleteExerciseSet,
  type LastSeen,
} from "@/hooks/useBodyData";
import { todayISO } from "@/lib/dates";
import { PREFILL_EVENT } from "./WorkoutOutlineCard";
import type { ExerciseSet } from "@/integrations/supabase/types";

const COMMON_EXERCISES = [
  "Bankdrücken",
  "Schrägbankdrücken",
  "Schulterdrücken",
  "Dips",
  "Klimmzüge",
  "Latzug",
  "Rudern",
  "Kreuzheben",
  "Kniebeuge",
  "Beinpresse",
  "Curls",
  "Tricepsdrücken",
];

export function ExerciseSetLogger({
  workoutId,
  sets,
  lastSeen,
  totalVolume,
}: {
  workoutId: string | null;
  sets: ExerciseSet[];
  lastSeen: LastSeen;
  totalVolume: number;
}) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const add = useAddExerciseSet();
  const remove = useDeleteExerciseSet();

  const grouped = useMemo(() => {
    const map = new Map<string, ExerciseSet[]>();
    for (const s of sets) {
      const arr = map.get(s.exercise_name) ?? [];
      arr.push(s);
      map.set(s.exercise_name, arr);
    }
    return Array.from(map.entries());
  }, [sets]);

  // Hört auf das Prefill-Event aus der WorkoutOutlineCard:
  // beim Klick einer Übung wird ihr Name hier ins Feld geschrieben,
  // Gewicht/Reps zurückgesetzt, und der Cursor in das Gewichtsfeld gesetzt.
  useEffect(() => {
    function onPrefill(e: Event) {
      const detail = (e as CustomEvent<{ name: string }>).detail;
      if (!detail?.name) return;
      setName(detail.name);
      setWeight("");
      setReps("");
      setTimeout(() => weightRef.current?.focus(), 50);
    }
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      nameRef.current?.focus();
      return;
    }
    add.mutate(
      {
        workoutDate: todayISO(),
        exercise_name: name.trim(),
        weight_kg: weight ? Number(weight.replace(",", ".")) : null,
        reps: reps ? Number(reps) : null,
      },
      {
        onSuccess: () => {
          // Name behalten — schnelles Logging weiterer Sätze
          setWeight("");
          setReps("");
          weightRef.current?.focus();
        },
      },
    );
  }

  function onDelete(id: string) {
    if (!workoutId) return;
    remove.mutate({ id, workoutId });
  }

  const lastForName = name ? lastSeen[name.trim()] : null;
  const pending = add.isPending || remove.isPending;

  return (
    <section id="workout-logger">
      <header className="mb-4 flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="label-caps">Workout-Logging</p>
          <h2 className="text-xl font-semibold tracking-tight">Sätze</h2>
        </div>
        {totalVolume > 0 && (
          <div className="text-right">
            <p className="label-caps">Volumen</p>
            <p className="stat-number text-lg">
              {Math.round(totalVolume).toLocaleString("de-DE")} kg
            </p>
          </div>
        )}
      </header>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="exercise-name">Übung</Label>
              <Input
                id="exercise-name"
                ref={nameRef}
                list="common-exercises"
                placeholder="z. B. Bankdrücken"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={pending}
              />
              <datalist id="common-exercises">
                {COMMON_EXERCISES.map((e) => (
                  <option key={e} value={e} />
                ))}
              </datalist>
            </div>

            {lastForName && (
              <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs">
                <TrendingUp className="h-3.5 w-3.5 shrink-0 text-success mt-0.5" />
                <div>
                  <span className="text-success font-medium">Last time:</span>{" "}
                  <span className="font-mono">
                    {lastForName.weight} kg × {lastForName.reps}
                  </span>
                  <span className="text-muted-foreground ml-1.5">
                    ({lastForName.date})
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <div className="space-y-1">
                <Label htmlFor="weight" className="sr-only">
                  Gewicht (kg)
                </Label>
                <Input
                  id="weight"
                  ref={weightRef}
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="0"
                  placeholder="kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  disabled={pending}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reps" className="sr-only">
                  Wiederholungen
                </Label>
                <Input
                  id="reps"
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  placeholder="Reps"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  disabled={pending}
                />
              </div>
              <Button type="submit" disabled={pending || !name.trim()}>
                <Plus className="h-4 w-4" />
                Satz
              </Button>
            </div>
          </form>

          {grouped.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Noch keine Sätze geloggt. Übung eintragen, Gewicht + Reps, +Satz.
            </p>
          ) : (
            <div className="space-y-4">
              {grouped.map(([exerciseName, exerciseSets]) => (
                <div key={exerciseName} className="space-y-2">
                  <h3 className="text-sm font-semibold">{exerciseName}</h3>
                  <ul className="divide-y divide-white/[0.04] rounded-lg bg-white/[0.02]">
                    {exerciseSets.map((s) => (
                      <li
                        key={s.id}
                        className="group flex items-center gap-3 px-3 py-2"
                      >
                        <Badge variant="secondary">#{s.set_number ?? "?"}</Badge>
                        <span className="font-mono text-sm">
                          {s.weight_kg ?? "—"} kg ×{" "}
                          <strong>{s.reps ?? "—"}</strong>
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          ={" "}
                          {s.weight_kg && s.reps
                            ? `${(Number(s.weight_kg) * Number(s.reps)).toLocaleString("de-DE")} kg`
                            : "—"}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDelete(s.id)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                          aria-label="Satz löschen"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
