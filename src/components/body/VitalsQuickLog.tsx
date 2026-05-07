import { FormEvent } from "react";
import { Moon, Heart, Activity, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpsertVitals } from "@/hooks/useBodyData";
import { todayISO } from "@/lib/dates";
import type { VitalsLog } from "@/integrations/supabase/types";

export function VitalsQuickLog({ vitals }: { vitals: VitalsLog | null }) {
  const upsert = useUpsertVitals();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    upsert.mutate({
      date: todayISO(),
      sleep_h: fd.get("sleep_h")
        ? Number(String(fd.get("sleep_h")).replace(",", "."))
        : null,
      rhr: fd.get("rhr") ? Number(fd.get("rhr")) : null,
      hrv: fd.get("hrv") ? Number(fd.get("hrv")) : null,
      weight_kg: fd.get("weight_kg")
        ? Number(String(fd.get("weight_kg")).replace(",", "."))
        : null,
    });
  }

  return (
    <section>
      <header className="mb-4 space-y-1">
        <p className="label-caps">Vitals heute (optional)</p>
        <h2 className="text-xl font-semibold tracking-tight">
          Schlaf, Puls, Gewicht
        </h2>
      </header>

      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={onSubmit}
            className="space-y-4"
            key={vitals?.id ?? "new"}
          >
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
              <Field
                icon={<Moon className="h-4 w-4" />}
                label="Schlaf"
                name="sleep_h"
                unit="h"
                defaultValue={vitals?.sleep_h ?? ""}
                placeholder="7.5"
                step="0.25"
                min="0"
                max="24"
              />
              <Field
                icon={<Heart className="h-4 w-4" />}
                label="Ruhepuls"
                name="rhr"
                unit="bpm"
                defaultValue={vitals?.rhr ?? ""}
                placeholder="58"
                step="1"
                min="20"
                max="220"
              />
              <Field
                icon={<Activity className="h-4 w-4" />}
                label="HRV"
                name="hrv"
                unit="ms"
                defaultValue={vitals?.hrv ?? ""}
                placeholder="65"
                step="1"
                min="0"
                max="300"
              />
              <Field
                icon={<Scale className="h-4 w-4" />}
                label="Gewicht"
                name="weight_kg"
                unit="kg"
                defaultValue={vitals?.weight_kg ?? ""}
                placeholder="78.5"
                step="0.1"
                min="0"
                max="500"
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
  min,
  max,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  unit: string;
  defaultValue: string | number;
  placeholder: string;
  step: string;
  min: string;
  max: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={name}
        className="flex items-center gap-2 text-muted-foreground text-xs"
      >
        {icon}
        <span>{label}</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider opacity-70">
          {unit}
        </span>
      </Label>
      <Input
        id={name}
        name={name}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </div>
  );
}
