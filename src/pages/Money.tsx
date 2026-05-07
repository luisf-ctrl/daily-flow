import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  computeAllocation,
  computeClosingCosts,
  computeSavingsPlan,
  computeScenarios,
} from "@/lib/finance/calc";
import {
  useHousePurchasePlan,
  useMonthlySavingsTotal,
  useSavings,
} from "@/hooks/useMoneyData";
import { PlanSettingsDialog } from "@/components/money/PlanSettingsDialog";
import { EquityProgressCard } from "@/components/money/EquityProgressCard";
import { ScenarioCards } from "@/components/money/ScenarioCards";
import { ClosingCostBreakdown } from "@/components/money/ClosingCostBreakdown";
import { SavingsAllocation } from "@/components/money/SavingsAllocation";
import { SavingsLog } from "@/components/money/SavingsLog";
import { Disclaimer } from "@/components/money/Disclaimer";
import type {
  HousePurchasePlan,
  Transaction,
} from "@/integrations/supabase/types";

export default function Money() {
  const { data: plan, isLoading } = useHousePurchasePlan();
  const { data: savings = [] } = useSavings();
  const { data: monthlyTotal = 0 } = useMonthlySavingsTotal();

  return (
    <AppShell>
      {isLoading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          Lade Plan...
        </div>
      ) : !plan ? (
        <EmptyState />
      ) : (
        <RealMoneyPage
          plan={plan}
          savings={savings}
          monthlyTotal={monthlyTotal}
        />
      )}
    </AppShell>
  );
}

function EmptyState() {
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
              Zeitraum — dann rechnen wir Nebenkosten, EK-Bedarf und monatliche
              Sparrate für dich.
            </p>
          </div>
          <PlanSettingsDialog
            plan={null}
            trigger={<Button size="lg">Plan jetzt erstellen</Button>}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function RealMoneyPage({
  plan,
  savings,
  monthlyTotal,
}: {
  plan: HousePurchasePlan;
  savings: Transaction[];
  monthlyTotal: number;
}) {
  const closing = computeClosingCosts(
    plan.target_purchase_price,
    plan.region_code,
  );
  const scenarios = computeScenarios(plan.target_purchase_price, closing);
  const recommended = scenarios.find((s) => s.recommended) ?? scenarios[1];
  const savingsPlan = computeSavingsPlan(plan, recommended);
  const allocation = computeAllocation(savingsPlan.monthsRemaining);

  const targetDate = plan.target_purchase_date
    ? format(new Date(plan.target_purchase_date), "MMMM yyyy", { locale: de })
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
