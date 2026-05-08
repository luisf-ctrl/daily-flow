import { useEffect, useState } from "react";
import { Apple, Beef, Droplet, Wheat, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  computeMacros,
  GOAL_LABELS,
  loadFitnessSettings,
  saveFitnessSettings,
  type FitnessSettings,
  type Goal,
} from "@/lib/fitness/plan";
import type { NutritionLog, VitalsLog } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

export function MacroTargetsCard({
  vitals,
  nutrition,
}: {
  vitals: VitalsLog | null;
  nutrition: NutritionLog | null;
}) {
  const [settings, setSettings] = useState<FitnessSettings>(() =>
    loadFitnessSettings(),
  );
  // Sync mit localStorage falls Tab-Wechsel (z. B. Settings auf einem
  // anderen Tab geändert)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "daily-flow:fitness-settings") {
        setSettings(loadFitnessSettings());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const weight =
    Number(vitals?.weight_kg) ||
    settings.manualWeightKg ||
    80; // Fallback

  const targets = computeMacros(weight, settings.goal, {
    heightCm: settings.heightCm,
    ageYears: settings.ageYears,
    sex: settings.sex,
  });

  const consumed = {
    kcal: Number(nutrition?.kcal ?? 0),
    protein: Number(nutrition?.protein_g ?? 0),
    water: Number(nutrition?.water_l ?? 0),
  };

  return (
    <section>
      <header className="mb-4 flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="label-caps">Recomp-Targets</p>
          <h2 className="text-xl font-semibold tracking-tight">Tagesziele</h2>
          <p className="text-xs text-muted-foreground">
            {GOAL_LABELS[settings.goal]} · {weight} kg
          </p>
        </div>
        <FitnessSettingsDialog
          settings={settings}
          onSave={(s) => {
            saveFitnessSettings(s);
            setSettings(s);
          }}
        />
      </header>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <Target
              icon={<Apple className="h-4 w-4" />}
              label="Kalorien"
              value={targets.kcal}
              unit="kcal"
              consumed={consumed.kcal}
              showProgress
            />
            <Target
              icon={<Beef className="h-4 w-4" />}
              label="Protein"
              value={targets.protein_g}
              unit="g"
              consumed={consumed.protein}
              tone="success"
              showProgress
            />
            <Target
              icon={<Wheat className="h-4 w-4" />}
              label="Carbs"
              value={targets.carbs_g}
              unit="g"
            />
            <Target
              icon={<Droplet className="h-4 w-4" />}
              label="Wasser"
              value={targets.water_l}
              unit="L"
              consumed={consumed.water}
              tone="primary"
              showProgress
              decimals={1}
            />
          </div>

          <p className="mt-5 pt-5 border-t border-white/[0.04] text-xs text-muted-foreground">
            <strong className="text-foreground">Fett:</strong> {targets.fat_g} g
            (0,8 g/kg) · <strong className="text-foreground">Protein:</strong>{" "}
            2,0 g/kg konstant in allen Modi (Muskel-Schutz im Defizit) ·{" "}
            <strong className="text-foreground">TDEE-Fallback:</strong> ohne
            Größe/Alter werden 24 × kg × 1,55 angenommen — exakter wird's
            wenn du diese im Settings-Dialog einträgst.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

function Target({
  icon,
  label,
  value,
  unit,
  consumed,
  tone = "default",
  showProgress = false,
  decimals = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  consumed?: number;
  tone?: "default" | "primary" | "success";
  showProgress?: boolean;
  decimals?: number;
}) {
  const pct = consumed ? Math.min(100, (consumed / value) * 100) : 0;
  const fmt = (n: number) => n.toFixed(decimals).replace(".", ",");
  const barColor =
    tone === "primary"
      ? "bg-primary"
      : tone === "success"
        ? "bg-success"
        : "bg-warning";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="stat-number text-xl">{fmt(value)}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      {showProgress && consumed !== undefined && (
        <>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className={cn("h-full transition-all", barColor)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {fmt(consumed)} / {fmt(value)} {unit} · {Math.round(pct)} %
          </p>
        </>
      )}
    </div>
  );
}

// =============================================================================
// Settings-Dialog
// =============================================================================

function FitnessSettingsDialog({
  settings,
  onSave,
}: {
  settings: FitnessSettings;
  onSave: (s: FitnessSettings) => void;
}) {
  const [open, setOpen] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      goal: (fd.get("goal") as Goal) ?? "recomp",
      heightCm: fd.get("heightCm") ? Number(fd.get("heightCm")) : undefined,
      ageYears: fd.get("ageYears") ? Number(fd.get("ageYears")) : undefined,
      sex: ((fd.get("sex") as "male" | "female") ?? "male"),
      manualWeightKg: fd.get("manualWeightKg")
        ? Number(fd.get("manualWeightKg"))
        : undefined,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" /> Ziel anpassen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fitness-Ziel & Stats</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Ziel</Label>
            <Select name="goal" defaultValue={settings.goal}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recomp">Recomp (Fett ↓ + Muskel ↑)</SelectItem>
                <SelectItem value="cut">Cut (schneller abnehmen)</SelectItem>
                <SelectItem value="bulk">Bulk (Muskelaufbau)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="height">Größe (cm)</Label>
              <Input
                id="height"
                name="heightCm"
                type="number"
                min="100"
                max="230"
                defaultValue={settings.heightCm ?? ""}
                placeholder="180"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Alter</Label>
              <Input
                id="age"
                name="ageYears"
                type="number"
                min="14"
                max="100"
                defaultValue={settings.ageYears ?? ""}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label>Geschlecht</Label>
              <Select name="sex" defaultValue={settings.sex ?? "male"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Männlich</SelectItem>
                  <SelectItem value="female">Weiblich</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manualWeight">Gewicht (kg, optional)</Label>
              <Input
                id="manualWeight"
                name="manualWeightKg"
                type="number"
                step="0.1"
                min="30"
                max="300"
                defaultValue={settings.manualWeightKg ?? ""}
                placeholder="aus Vitals"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Wird in deinem Browser gespeichert (kein Server-Sync).
          </p>

          <Button type="submit" className="w-full">
            Speichern
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
