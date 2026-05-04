import { PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { eur, pct } from "@/lib/finance/calc";
import type { AllocationBucket } from "@/lib/finance/calc";

export function SavingsAllocation({
  allocation,
  monthsRemaining,
  totalToSave,
}: {
  allocation: AllocationBucket[];
  monthsRemaining: number;
  totalToSave: number;
}) {
  return (
    <section>
      <header className="mb-4 space-y-1">
        <p className="label-caps">Anlage-Allokation</p>
        <h2 className="text-xl font-semibold tracking-tight">
          Wo das Eigenkapital parken?
        </h2>
        <p className="text-sm text-muted-foreground">
          Empfehlung für {monthsRemaining}{" "}
          {monthsRemaining === 1 ? "Monat" : "Monate"} Sparhorizont — kurz genug
          für ETF-Volatilität ungeeignet, lang genug für Festgeld-Bonus.
        </p>
      </header>

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/[0.04]">
            {allocation.map((b, i) => (
              <div
                key={b.label}
                className={
                  i === 0
                    ? "bg-primary"
                    : i === 1
                      ? "bg-success"
                      : "bg-warning"
                }
                style={{ width: `${b.share * 100}%` }}
                aria-label={`${b.label}: ${pct(b.share, 0)}`}
              />
            ))}
          </div>

          <ul className="space-y-3">
            {allocation.map((b, i) => (
              <li
                key={b.label}
                className="flex items-start gap-3 border-b border-white/[0.04] pb-3 last:border-0 last:pb-0"
              >
                <span
                  className={`mt-1 inline-block h-3 w-3 shrink-0 rounded-full ${
                    i === 0
                      ? "bg-primary"
                      : i === 1
                        ? "bg-success"
                        : "bg-warning"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="font-medium">{b.label}</p>
                    <p className="font-mono text-sm text-muted-foreground">
                      {pct(b.share, 0)} · ≈ {eur.format(b.share * totalToSave)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.description} ·{" "}
                    <span className="text-success">
                      {pct(b.expectedRate, 1)} p.a.
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <PiggyBank className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Faustregel:</strong> Bei{" "}
              {monthsRemaining < 60
                ? "weniger als 5 Jahren Horizont keine ETF-Anteile — ein Crash kurz vor Auszahlung kann den Plan kippen."
                : "längeren Sparhorizonten kann ein ETF-Anteil sinnvoll sein."}{" "}
              Achte auf EU-Einlagensicherung (deutsche Direktbanken: ING, DKB,
              Trade Republic, Comdirect, Consorsbank).
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
