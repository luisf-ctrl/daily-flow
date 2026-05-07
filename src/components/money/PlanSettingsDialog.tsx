import { useState, FormEvent } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useUpsertHousePurchasePlan } from "@/hooks/useMoneyData";
import { GERMAN_STATE_NAMES } from "@/lib/finance/calc";
import type {
  GermanState,
  HousePurchasePlan,
} from "@/integrations/supabase/types";

const STATES = Object.keys(GERMAN_STATE_NAMES) as GermanState[];

export function PlanSettingsDialog({
  plan,
  trigger,
}: {
  plan: HousePurchasePlan | null;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const upsert = useUpsertHousePurchasePlan();

  // Default-Ziel-Datum: in 4 Jahren
  const defaultTargetDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 4);
    return d.toISOString().slice(0, 10);
  })();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    upsert.mutate(
      {
        target_purchase_price: Number(fd.get("target_purchase_price") ?? 800000),
        region_code: (fd.get("region_code") as GermanState) ?? "BW",
        target_purchase_date: (fd.get("target_purchase_date") as string) || null,
        monthly_net_income_self: Number(fd.get("monthly_net_income_self") ?? 0),
        monthly_net_income_partner: Number(fd.get("monthly_net_income_partner") ?? 0),
        monthly_business_profit: Number(fd.get("monthly_business_profit") ?? 0),
        business_kleinunternehmer: fd.get("business_kleinunternehmer") === "on",
        monthly_fixed_costs: Number(fd.get("monthly_fixed_costs") ?? 0),
        parental_leave_months: Number(fd.get("parental_leave_months") ?? 12),
        parental_leave_income: Number(fd.get("parental_leave_income") ?? 1800),
        planned_own_use: fd.get("planned_own_use") === "on",
        existing_equity: Number(fd.get("existing_equity") ?? 0),
        existing_debts: Number(fd.get("existing_debts") ?? 0),
        notes: (fd.get("notes") as string) || null,
      },
      {
        onSuccess: () => setOpen(false),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" /> Plan bearbeiten
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hauskauf-Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="label-caps mb-2">Ziel</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Kaufpreis (€)</Label>
                <Input
                  id="price"
                  name="target_purchase_price"
                  type="number"
                  step="1000"
                  min="0"
                  required
                  defaultValue={plan?.target_purchase_price ?? 800000}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Bundesland</Label>
                <Select
                  name="region_code"
                  defaultValue={plan?.region_code ?? "BW"}
                >
                  <SelectTrigger id="region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {GERMAN_STATE_NAMES[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-date">Ziel-Kauftermin</Label>
                <Input
                  id="target-date"
                  name="target_purchase_date"
                  type="date"
                  defaultValue={
                    plan?.target_purchase_date ?? defaultTargetDate
                  }
                />
              </div>
              <div className="flex items-center gap-2 pt-7">
                <input
                  id="own-use"
                  name="planned_own_use"
                  type="checkbox"
                  defaultChecked={plan?.planned_own_use ?? true}
                  className="h-4 w-4 rounded border-white/20"
                />
                <Label htmlFor="own-use" className="text-sm">
                  Eigennutzung
                </Label>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="label-caps mb-2">Einkommen (Netto / Monat)</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="income-self">Du</Label>
                <Input
                  id="income-self"
                  name="monthly_net_income_self"
                  type="number"
                  step="50"
                  min="0"
                  required
                  defaultValue={plan?.monthly_net_income_self ?? 3800}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-partner">Partner/in</Label>
                <Input
                  id="income-partner"
                  name="monthly_net_income_partner"
                  type="number"
                  step="50"
                  min="0"
                  required
                  defaultValue={plan?.monthly_net_income_partner ?? 3300}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-business">
                  Einzelunternehmen (Gewinn vor Steuern)
                </Label>
                <Input
                  id="income-business"
                  name="monthly_business_profit"
                  type="number"
                  step="50"
                  min="0"
                  required
                  defaultValue={plan?.monthly_business_profit ?? 500}
                />
              </div>
              <div className="flex items-center gap-2 pt-7">
                <input
                  id="kleinunternehmer"
                  name="business_kleinunternehmer"
                  type="checkbox"
                  defaultChecked={plan?.business_kleinunternehmer ?? true}
                  className="h-4 w-4 rounded border-white/20"
                />
                <Label htmlFor="kleinunternehmer" className="text-sm">
                  Kleinunternehmer-Regelung
                </Label>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="label-caps mb-2">Kosten &amp; Vermögen</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fixed-costs">Fixkosten / Monat (€)</Label>
                <Input
                  id="fixed-costs"
                  name="monthly_fixed_costs"
                  type="number"
                  step="50"
                  min="0"
                  required
                  defaultValue={plan?.monthly_fixed_costs ?? 4000}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equity">Eigenkapital aktuell (€)</Label>
                <Input
                  id="equity"
                  name="existing_equity"
                  type="number"
                  step="100"
                  min="0"
                  required
                  defaultValue={plan?.existing_equity ?? 0}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="debts">Bestehende Verbindlichkeiten (€)</Label>
                <Input
                  id="debts"
                  name="existing_debts"
                  type="number"
                  step="100"
                  min="0"
                  required
                  defaultValue={plan?.existing_debts ?? 0}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="label-caps mb-2">Elternzeit-Projektion</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="parental-months">Monate</Label>
                <Input
                  id="parental-months"
                  name="parental_leave_months"
                  type="number"
                  step="1"
                  min="0"
                  max="36"
                  required
                  defaultValue={plan?.parental_leave_months ?? 12}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parental-income">Elterngeld / Monat (€)</Label>
                <Input
                  id="parental-income"
                  name="parental_leave_income"
                  type="number"
                  step="50"
                  min="0"
                  required
                  defaultValue={plan?.parental_leave_income ?? 1800}
                />
              </div>
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={plan?.notes ?? ""}
              placeholder="Region-Spezifika, geplante Elternzeit, ..."
            />
          </div>

          <Button type="submit" disabled={upsert.isPending} className="w-full">
            {upsert.isPending
              ? "Speichere..."
              : plan
                ? "Plan aktualisieren"
                : "Plan erstellen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
