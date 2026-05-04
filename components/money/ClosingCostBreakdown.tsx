import { Card, CardContent } from "@/components/ui/card";
import {
  GERMAN_STATE_NAMES,
  GRUNDERWERBSTEUER_RATES,
  eur,
  pct,
} from "@/lib/finance/calc";
import type { ClosingCosts } from "@/lib/finance/calc";
import type { GermanState } from "@/lib/types";

export function ClosingCostBreakdown({
  closing,
  state,
  price,
}: {
  closing: ClosingCosts;
  state: GermanState;
  price: number;
}) {
  const rows: { label: string; value: number; sub: string }[] = [
    {
      label: "Grunderwerbsteuer",
      value: closing.grunderwerbsteuer,
      sub: `${pct(GRUNDERWERBSTEUER_RATES[state], 1)} (${GERMAN_STATE_NAMES[state]})`,
    },
    {
      label: "Notar & Grundbuch",
      value: closing.notarGrundbuch,
      sub: "≈ 1,5 % Notar + 0,5 % Grundbuch",
    },
    {
      label: "Maklerprovision",
      value: closing.makler,
      sub: "3,57 % Bestellerprinzip, hälftig geteilt",
    },
    {
      label: "Puffer (Gutachten, Umzug, Renovierung)",
      value: closing.puffer,
      sub: "Pauschal-Annahme",
    },
  ];

  return (
    <section>
      <header className="mb-4 space-y-1">
        <p className="label-caps">Nebenkosten</p>
        <h2 className="text-xl font-semibold tracking-tight">
          Kaufnebenkosten-Aufstellung
        </h2>
      </header>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {rows.map((r) => (
              <div
                key={r.label}
                className="flex items-start justify-between gap-4 border-b border-white/[0.04] pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.sub}</p>
                </div>
                <p className="font-mono text-sm font-semibold tabular-nums">
                  {eur.format(r.value)}
                </p>
              </div>
            ))}

            <div className="flex items-baseline justify-between gap-4 border-t border-white/[0.08] pt-4 mt-4">
              <p className="text-sm font-semibold">Summe Nebenkosten</p>
              <p className="font-mono text-base font-bold tabular-nums">
                {eur.format(closing.total)}
              </p>
            </div>

            <div className="flex items-baseline justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                Gesamt-Investition (Kaufpreis + Nebenkosten)
              </p>
              <p className="font-mono text-sm font-semibold tabular-nums text-muted-foreground">
                {eur.format(closing.totalInvestment)}
              </p>
            </div>

            <p className="text-[11px] text-muted-foreground pt-2">
              Annahme Kaufpreis {eur.format(price)} · Werte gerundet ·
              tatsächliche Notar-Gebühren variieren nach GNotKG-Tabelle.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
