import { Check, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { eur, pct } from "@/lib/finance/calc";
import type { FinancingScenario } from "@/lib/finance/calc";

const APPROVAL_LABEL: Record<FinancingScenario["approvalLikelihood"], string> = {
  low: "Schwer (BWA + 2J Selbstständigkeit + perfekte Bonität)",
  medium: "Realistisch bei zwei festen Einkommen",
  high: "Sehr wahrscheinlich",
};

const APPROVAL_TONE: Record<FinancingScenario["approvalLikelihood"], "danger" | "warning" | "success"> = {
  low: "danger",
  medium: "warning",
  high: "success",
};

export function ScenarioCards({ scenarios }: { scenarios: FinancingScenario[] }) {
  return (
    <section>
      <header className="mb-4 space-y-1">
        <p className="label-caps">Finanzierungs-Szenarien</p>
        <h2 className="text-xl font-semibold tracking-tight">
          3 Wege zum Hauskauf
        </h2>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {scenarios.map((s) => (
          <Card
            key={s.key}
            className={s.recommended ? "border-primary/40" : undefined}
          >
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{s.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Beleihungsauslauf {pct(s.beleihungsauslauf, 0)}
                  </p>
                </div>
                {s.recommended && (
                  <Badge variant="primary">
                    <Check className="mr-1 h-3 w-3" />
                    Empfohlen
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                <p className="label-caps">Eigenkapital nötig</p>
                <p className="stat-number text-2xl">{eur.format(s.equityNeeded)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/[0.04] pt-4">
                <Cell label="Darlehen" value={eur.format(s.loanAmount)} />
                <Cell label="Zins (∅)" value={pct(s.interestRate, 2)} />
                <Cell label="Tilgung" value={pct(s.amortRate, 0)} />
                <Cell label="Rate / M" value={eur.format(s.monthlyPayment)} />
              </div>

              <div
                className={`flex items-start gap-2 rounded-md border px-3 py-2 text-xs ${
                  APPROVAL_TONE[s.approvalLikelihood] === "danger"
                    ? "border-danger/30 bg-danger/10 text-danger"
                    : APPROVAL_TONE[s.approvalLikelihood] === "warning"
                      ? "border-warning/30 bg-warning/10 text-warning"
                      : "border-success/30 bg-success/10 text-success"
                }`}
              >
                {s.approvalLikelihood === "low" ? (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                ) : (
                  <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                )}
                <span>{APPROVAL_LABEL[s.approvalLikelihood]}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}
