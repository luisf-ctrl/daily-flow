import { differenceInDays } from "date-fns";
import { Flame, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { eur } from "@/lib/finance/calc";
import type {
  FinancingScenario,
  SavingsPlan,
} from "@/lib/finance/calc";
import type { HousePurchasePlan } from "@/integrations/supabase/types";

export function EquityProgressCard({
  plan,
  scenario,
  savingsPlan,
}: {
  plan: HousePurchasePlan;
  scenario: FinancingScenario;
  savingsPlan: SavingsPlan;
}) {
  const target = scenario.equityNeeded;
  const current = plan.existing_equity;
  const progress = target > 0 ? Math.min(1, current / target) : 0;
  const monthsLeft = savingsPlan.monthsRemaining;
  const targetDate = plan.target_purchase_date
    ? new Date(plan.target_purchase_date)
    : null;
  const daysLeft = targetDate ? differenceInDays(targetDate, new Date()) : null;

  return (
    <Card>
      <CardContent className="pt-6 md:pt-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="label-caps">Eigenkapital für Hauskauf</p>
            <p className="text-sm text-muted-foreground">
              Empfohlenes Szenario: {scenario.label}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-card px-3 py-1.5">
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {monthsLeft} {monthsLeft === 1 ? "Monat" : "Monate"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="stat-number text-4xl md:text-5xl text-foreground">
              {eur.format(current)}
            </span>
            <span className="text-base text-muted-foreground">
              / {eur.format(target)}
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {(progress * 100).toFixed(1).replace(".", ",")} % erreicht
          </p>
        </div>

        <div className="grid gap-4 border-t border-white/[0.04] pt-5 sm:grid-cols-3">
          <Stat
            label="Noch zu sparen"
            value={eur.format(savingsPlan.stillToSave)}
          />
          <Stat
            label="Pro Monat nötig"
            value={eur.format(savingsPlan.monthlyRequired)}
          />
          <Stat
            label="Cashflow verfügbar"
            value={eur.format(Math.max(0, savingsPlan.cashflowAvailable))}
            tone={savingsPlan.feasible ? "success" : "danger"}
          />
        </div>

        {!savingsPlan.feasible && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive">
                Sparrate übersteigt aktuellen Cashflow.
              </p>
              <p className="text-muted-foreground mt-1">
                Du müsstest {eur.format(savingsPlan.monthlyRequired)} pro Monat
                sparen, hast aber nur{" "}
                {eur.format(savingsPlan.cashflowAvailable)} übrig. Optionen:
                Zeitraum verlängern, anderes Szenario wählen, oder
                Einkommen/Kosten anpassen.
              </p>
            </div>
          </div>
        )}

        {savingsPlan.feasible && savingsPlan.monthlyRequired > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 p-4">
            <TrendingUp className="h-5 w-5 shrink-0 text-success mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-success">Plan ist machbar.</p>
              <p className="text-muted-foreground mt-1">
                Mit {eur.format(savingsPlan.monthlyRequired)}/Monat erreichst du
                das Ziel in {monthsLeft}{" "}
                {monthsLeft === 1 ? "Monat" : "Monaten"}
                {daysLeft !== null && ` (≈ ${daysLeft} Tage)`}.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div className="space-y-1">
      <p className="label-caps">{label}</p>
      <p className={`stat-number text-xl md:text-2xl ${toneClass}`}>{value}</p>
    </div>
  );
}
