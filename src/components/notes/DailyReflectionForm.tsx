import { useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { DailyReflection } from "@/integrations/supabase/types";
import { todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";

const MOOD_LABELS: Record<number, string> = {
  1: "Mies",
  2: "Schwach",
  3: "OK",
  4: "Gut",
  5: "Top",
};

export function DailyReflectionForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const date = todayISO();
  const [mood, setMood] = useState<number | null>(null);

  const { data: reflection } = useQuery({
    queryKey: ["daily-reflection", date],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_reflections")
        .select("*")
        .eq("date", date)
        .maybeSingle();
      if (error) throw error;
      // Initial mood aus DB übernehmen
      if (data && mood === null && data.mood_score) {
        setMood(data.mood_score);
      }
      return data as DailyReflection | null;
    },
  });

  const save = useMutation({
    mutationFn: async (input: {
      what_went_well: string | null;
      what_went_bad: string | null;
      learnings: string | null;
      plan_tomorrow: string | null;
      mood_score: number | null;
    }) => {
      if (!user) throw new Error("Nicht eingeloggt");
      const { error } = await supabase
        .from("daily_reflections")
        .upsert(
          { user_id: user.id, date, ...input },
          { onConflict: "user_id,date" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reflexion gespeichert");
      queryClient.invalidateQueries({ queryKey: ["daily-reflection", date] });
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Speichern fehlgeschlagen");
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    save.mutate({
      what_went_well: (fd.get("what_went_well") as string) || null,
      what_went_bad: (fd.get("what_went_bad") as string) || null,
      learnings: (fd.get("learnings") as string) || null,
      plan_tomorrow: (fd.get("plan_tomorrow") as string) || null,
      mood_score: mood,
    });
  }

  return (
    <Card>
      <CardContent className="pt-6 md:pt-8 space-y-6">
        <header className="space-y-1">
          <p className="label-caps">Tagesreflexion</p>
          <h2 className="text-xl font-semibold tracking-tight">
            {format(new Date(date), "EEEE, d. MMMM", { locale: de })}
          </h2>
        </header>

        <form onSubmit={onSubmit} className="space-y-5" key={reflection?.id ?? "new"}>
          <div className="space-y-2">
            <Label htmlFor="what_went_well">Was lief gut?</Label>
            <Textarea
              id="what_went_well"
              name="what_went_well"
              defaultValue={reflection?.what_went_well ?? ""}
              placeholder="3 Sachen, die heute geklappt haben..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="what_went_bad">Was lief schlecht?</Label>
            <Textarea
              id="what_went_bad"
              name="what_went_bad"
              defaultValue={reflection?.what_went_bad ?? ""}
              placeholder="Was hat genervt oder nicht funktioniert..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learnings">Was lerne ich daraus?</Label>
            <Textarea
              id="learnings"
              name="learnings"
              defaultValue={reflection?.learnings ?? ""}
              placeholder="Insight des Tages..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan_tomorrow">Plan für morgen</Label>
            <Textarea
              id="plan_tomorrow"
              name="plan_tomorrow"
              defaultValue={reflection?.plan_tomorrow ?? ""}
              placeholder="Top-3 für den nächsten Tag..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Mood</Label>
            <div className="flex gap-2" role="radiogroup" aria-label="Mood-Score">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={mood === n}
                  aria-label={`Mood ${n} – ${MOOD_LABELS[n]}`}
                  onClick={() => setMood(n)}
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-sm font-mono font-bold transition",
                    mood === n
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-white/[0.08] text-muted-foreground hover:border-white/20 hover:text-foreground",
                  )}
                >
                  {n}
                </button>
              ))}
              {mood && (
                <span className="ml-2 self-center text-sm text-muted-foreground">
                  {MOOD_LABELS[mood]}
                </span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={save.isPending}
            className="w-full sm:w-auto"
          >
            {save.isPending ? "Speichere..." : "Reflexion speichern"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
