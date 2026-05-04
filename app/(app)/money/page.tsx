import { startOfMonth, endOfMonth, format } from "date-fns";
import { Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import {
  computeClosingCosts,
  computeScenarios,
  computeSavingsPlan,
  computeAllocation,
} from "@/lib/finance/calc";
import { PlanSettingsDialog } from "@/components/money/PlanSettingsDialog";
import { EquityProgressCard } from "@/components/money/EquityProgressCard";
import { ScenarioCards } from "@/components/money/ScenarioCards";
import { ClosingCostBreakdown } from "@/components/money/ClosingCostBreakdown";
import { SavingsAllocation } from "@/components/money/SavingsAllocation";
import { SavingsLog } from "@/components/money/SavingsLog";
import { Disclaimer } from "@/components/money/Disclaimer";
import { Button } from "@/components/ui/button";
import type { HousePurchasePlan, Transaction } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MoneyPage() {
  const supabase = createClient();

  const monthStart = startOfMonth(new Date()).toISOString().slice(0, 10);
  const monthEnd = endOfMonth(new Date()).toISOString().slice(0, 10);

  const [{ data: planRow }, { data: savingsAll }, { data: savingsMonth }] =
    await Promise.all([
      supabase
        .from("house_purchase_plan")
        .select("*")
        .maybeSingle(),
      supabase
        .from("transactions")
        .select("*")
        .eq("type", "saving")
        .order("date", { ascending: false })
        .limit(20),
      supabase
        .from("transactions")
        .select("amount")
        .eq("type", "saving")
        .gte("date", monthStart)
        .lte("date", monthEnd),
    ]);

  const plan = planRow as HousePurchasePlan | null;
  const savings = (savingsAll as Transaction[] | null) ?? [];
  const monthlyTotal = (savingsMonth ?? []).reduce(
    (sum, row) => sum + Number(row.amount ?? 0),
    0,
  );

  // Wenn kein Plan existiert: Setup-CTA
  if (!plan) {
    return (
      <div className="space-y-8">
        <header className="space-y-1">
          <p className="label-caps">Hauskauf-Plan</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Money
          </h1>
        </header>

        <Card>
          <CardContent className="pt-10 pb-12 text-center space-y-6 max-w-lg mx-auto">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Wallet className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Plan einrichten</h2>
              <p className="text-sm text-muted-foreground">
                Trag deine Eckdaten ein — Kaufpreis, Bundesland, Einkommen,
                Zeitraum — dann rechnen wir Nebenkosten, EK-Bedarf und
                monatliche Sparrate für dich.
              </p>
            </div>
            <PlanSettingsDialog
              plan={null}
              trigger={
                <Button size="lg">
                  Plan jetzt erstellen
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Plan existiert → alles berechnen
  const closing = computeClosingCosts(plan.target_purchase_price, plan.region_code);
  const scenarios = computeScenarios(plan.target_purchase_price, closing);
  const recommended = scenarios.find((s) => s.recommended) ?? scenarios[1];
  const savingsPlan = computeSavingsPlan(plan, recommended);
  const allocation = computeAllocation(savingsPlan.monthsRemaining);

  const targetDate = plan.target_purchase_date
    ? format(new Date(plan.target_purchase_date), "MMMM yyyy", { locale: undefined })
    : null;

  return (
    <div className="space-y-10">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <p className="label-caps">Hauskauf-Plan</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Money
          </h1>
          {targetDate && (
            <p className="text-sm text-muted-foreground">
              Ziel-Kauftermin: {targetDate}
            </p>
          )}
        </div>
        <PlanSettingsDialog plan={plan} />
      </header>

      <EquityProgressCard
        plan={plan}
        scenario={recommended}
        savingsPlan={savingsPlan}
      />

      <SavingsLog savings={savings} monthlyTotal={monthlyTotal} />

      <ScenarioCards scenarios={scenarios} />

      <ClosingCostBreakdown
        closing={closing}
        state={plan.region_code}
        price={plan.target_purchase_price}
      />

      <SavingsAllocation
        allocation={allocation}
        monthsRemaining={savingsPlan.monthsRemaining}
        totalToSave={savingsPlan.stillToSave}
      />

      <Disclaimer />
    </div>
  );
}
