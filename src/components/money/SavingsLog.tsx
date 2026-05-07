import { useState, FormEvent } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAddSaving, useDeleteSaving } from "@/hooks/useMoneyData";
import { eurSmall } from "@/lib/finance/calc";
import type { Transaction } from "@/integrations/supabase/types";

const QUICK_AMOUNTS = [25, 50, 100, 250, 500];
const CATEGORIES = ["Einzahlung", "Verzicht", "Einnahme", "Bonus"];

export function SavingsLog({
  savings,
  monthlyTotal,
}: {
  savings: Transaction[];
  monthlyTotal: number;
}) {
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("Einzahlung");
  const add = useAddSaving();
  const remove = useDeleteSaving();
  const pending = add.isPending || remove.isPending;

  function submit(amountToSave: number) {
    if (amountToSave <= 0) return;
    add.mutate(
      { amount: amountToSave, category, note: null },
      {
        onSuccess: () => {
          setAmount("");
          toast.success(`+${eurSmall.format(amountToSave)} gespart`);
        },
      },
    );
  }

  function onFormSubmit(e: FormEvent) {
    e.preventDefault();
    const n = Number(amount.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return;
    submit(n);
  }

  function onDelete(id: string, amt: number) {
    if (
      !confirm("Eintrag wirklich löschen? EK wird entsprechend reduziert.")
    )
      return;
    remove.mutate({ id, amount: amt });
  }

  return (
    <section>
      <header className="mb-4 flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="label-caps">Spar-Logs</p>
          <h2 className="text-xl font-semibold tracking-tight">Heute gespart</h2>
        </div>
        <div className="text-right">
          <p className="label-caps">Diesen Monat</p>
          <p className="stat-number text-lg text-success">
            {eurSmall.format(monthlyTotal)}
          </p>
        </div>
      </header>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <form onSubmit={onFormSubmit} className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((v) => (
                <Button
                  key={v}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => submit(v)}
                >
                  +{v} €
                </Button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <div className="space-y-1">
                <Label htmlFor="custom-amount" className="sr-only">
                  Eigener Betrag
                </Label>
                <Input
                  id="custom-amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="Eigener Betrag"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={pending}
                />
              </div>
              <select
                aria-label="Kategorie"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={pending}
                className="h-11 rounded-lg border border-white/[0.08] bg-input px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={pending || !amount}>
                <Plus className="h-4 w-4" />
                Sparen
              </Button>
            </div>
          </form>

          {savings.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Noch keine Spar-Logs. Trag deine erste Einzahlung ein 💸
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {savings.slice(0, 10).map((s) => (
                <li
                  key={s.id}
                  className="group flex items-center gap-3 py-3 first:pt-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="stat-number text-base text-success">
                        +{eurSmall.format(s.amount)}
                      </span>
                      <Badge variant="secondary">{s.category ?? "—"}</Badge>
                    </div>
                    {s.note && (
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {s.note}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {format(new Date(s.date), "d. MMM", { locale: de })}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDelete(s.id, s.amount)}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    aria-label="Eintrag löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
