import { FormEvent } from "react";
import { Apple, Beef, Droplet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpsertNutrition } from "@/hooks/useBodyData";
import { todayISO } from "@/lib/dates";
import type { NutritionLog } from "@/integrations/supabase/types";

const PROTEIN_TARGET = 150;
const WATER_TARGET = 2.5;

export function NutritionQuickLog({ log }: { log: NutritionLog | null }) {
  const upsert = useUpsertNutrition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    upsert.mutate({
      date: todayISO(),
      kcal: fd.get("kcal") ? Number(fd.get("kcal")) : null,
      protein_g: fd.get("protein_g") ? Number(fd.get("protein_g")) : null,
      water_l: fd.get("water_l")
        ? Number(String(fd.get("water_l")).replace(",", "."))
        : null,
    });
  }

  const protein = Number(log?.protein_g ?? 0);
  const water = Number(log?.water_l ?? 0);
  const proteinPct = Math.min(100, (protein / PROTEIN_TARGET) * 100);
  const waterPct = Math.min(100, (water / WATER_TARGET) * 100);

  return (
    <section>
      <header className="mb-4 space-y-1">
        <p className="label-caps">Ernährung heute</p>
        <h2 className="text-xl font-semibold tracking-tight">Quick-Log</h2>
      </header>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-5" key={log?.id ?? "new"}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                icon={<Apple className="h-4 w-4" />}
                label="Kalorien"
                name="kcal"
                unit="kcal"
                defaultValue={log?.kcal ?? ""}
                placeholder="2400"
                step="50"
              />
              <Field
                icon={<Beef className="h-4 w-4" />}
                label="Protein"
                name="protein_g"
                unit="g"
                defaultValue={log?.protein_g ?? ""}
                placeholder="150"
                step="5"
                progress={proteinPct}
              />
              <Field
                icon={<Droplet className="h-4 w-4" />}
                label="Wasser"
                name="water_l"
                unit="L"
                defaultValue={log?.water_l ?? ""}
                placeholder="2.5"
                step="0.1"
                progress={waterPct}
              />
            </div>

            <Button type="submit" disabled={upsert.isPending} size="sm">
              {upsert.isPending ? "Speichere..." : "Speichern"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function Field({
  icon,
  label,
  name,
  unit,
  defaultValue,
  placeholder,
  step,
  progress,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  unit: string;
  defaultValue: string | number;
  placeholder: string;
  step: string;
  progress?: number;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={name}
        className="flex items-center gap-2 text-muted-foreground"
      >
        {icon}
        <span>{label}</span>
        <span className="ml-auto text-[11px] uppercase tracking-wider opacity-70">
          {unit}
        </span>
      </Label>
      <Input
        id={name}
        name={name}
        type="number"
        inputMode="decimal"
        step={step}
        min="0"
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
      {progress !== undefined && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
          <div
            className="h-full bg-success transition-all"
            style={{ width: `${progress}%` }}
            aria-label={`${Math.round(progress)} % vom Tagesziel`}
          />
        </div>
      )}
    </div>
  );
}
