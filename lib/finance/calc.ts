// Reine Berechnungs-Funktionen für den Hauskauf-Plan.
// Keine Side-Effects, alles deterministisch — testbar in Vitest.

import type { GermanState, HousePurchasePlan } from "@/lib/types";

// ---------- Grunderwerbsteuer pro Bundesland (Stand 2025) ----------
export const GRUNDERWERBSTEUER_RATES: Record<GermanState, number> = {
  BW: 0.05,    // Baden-Württemberg
  BY: 0.035,   // Bayern
  BE: 0.06,    // Berlin
  BB: 0.065,   // Brandenburg
  HB: 0.05,    // Bremen
  HH: 0.055,   // Hamburg
  HE: 0.06,    // Hessen
  MV: 0.06,    // Mecklenburg-Vorpommern
  NI: 0.05,    // Niedersachsen
  NW: 0.065,   // Nordrhein-Westfalen
  RP: 0.05,    // Rheinland-Pfalz
  SL: 0.065,   // Saarland
  SN: 0.055,   // Sachsen
  ST: 0.05,    // Sachsen-Anhalt
  SH: 0.065,   // Schleswig-Holstein
  TH: 0.05,    // Thüringen
};

export const GERMAN_STATE_NAMES: Record<GermanState, string> = {
  BW: "Baden-Württemberg",
  BY: "Bayern",
  BE: "Berlin",
  BB: "Brandenburg",
  HB: "Bremen",
  HH: "Hamburg",
  HE: "Hessen",
  MV: "Mecklenburg-Vorpommern",
  NI: "Niedersachsen",
  NW: "Nordrhein-Westfalen",
  RP: "Rheinland-Pfalz",
  SL: "Saarland",
  SN: "Sachsen",
  ST: "Sachsen-Anhalt",
  SH: "Schleswig-Holstein",
  TH: "Thüringen",
};

// Standard-Annahmen für die Notar/Grundbuch + Maklerprovision
const NOTAR_GRUNDBUCH_RATE = 0.02;     // ~1,5% Notar + ~0,5% Grundbuch
const MAKLER_RATE_SHARED = 0.0357;     // 3,57% Bestellerprinzip, hälftig geteilt → 1,785% pro Seite
const PUFFER_DEFAULT = 10000;           // Gutachten + Umzug + erste Renovierung

export type ClosingCosts = {
  grunderwerbsteuer: number;
  notarGrundbuch: number;
  makler: number;
  puffer: number;
  total: number;
  totalInvestment: number; // Kaufpreis + Nebenkosten
};

export function computeClosingCosts(
  price: number,
  state: GermanState,
  options?: { withMakler?: boolean; puffer?: number },
): ClosingCosts {
  const withMakler = options?.withMakler ?? true;
  const puffer = options?.puffer ?? PUFFER_DEFAULT;

  const grunderwerbsteuer = price * GRUNDERWERBSTEUER_RATES[state];
  const notarGrundbuch = price * NOTAR_GRUNDBUCH_RATE;
  const makler = withMakler ? price * (MAKLER_RATE_SHARED / 2) : 0;

  const total = grunderwerbsteuer + notarGrundbuch + makler + puffer;
  return {
    grunderwerbsteuer,
    notarGrundbuch,
    makler,
    puffer,
    total,
    totalInvestment: price + total,
  };
}

// ---------- Finanzierungs-Szenarien ----------
// Beleihungsauslauf = Darlehen / Kaufpreis
// 100% BLA = Vollfinanzierung (höchster Zinsaufschlag)
// 90% BLA = 10% EK auf Kaufpreis
// 80% BLA = 20% EK auf Kaufpreis (bestkonditioniert)

export type ScenarioKey = "full" | "ninety" | "eighty";

export type FinancingScenario = {
  key: ScenarioKey;
  label: string;
  beleihungsauslauf: number;     // 1.0, 0.9, 0.8
  loanAmount: number;
  equityNeeded: number;          // Nebenkosten + EK-Anteil + Risikopuffer (nur full)
  interestRate: number;          // angenommene Zins-Spanne als Mittelwert
  amortRate: number;             // Anfangstilgung
  monthlyPayment: number;
  approvalLikelihood: "low" | "medium" | "high";
  recommended: boolean;
};

// Mittlere Zinssätze Stand Mitte 2026 (recherchiere bei Vertragsabschluss)
const RATE_FULL = 0.042;     // 100% BLA
const RATE_NINETY = 0.037;   // 90% BLA
const RATE_EIGHTY = 0.034;   // 80% BLA

export function computeScenarios(
  price: number,
  closing: ClosingCosts,
  options?: { full?: { rate?: number; amort?: number }; ninety?: { rate?: number; amort?: number }; eighty?: { rate?: number; amort?: number } },
): FinancingScenario[] {
  const RISK_BUFFER = 10000; // zusätzlicher Puffer bei 100% BLA für Bonitäts-Sprung

  return [
    {
      key: "full",
      label: "Vollfinanzierung (100 %)",
      beleihungsauslauf: 1.0,
      loanAmount: price,
      equityNeeded: closing.total + RISK_BUFFER,
      interestRate: options?.full?.rate ?? RATE_FULL,
      amortRate: options?.full?.amort ?? 0.02,
      monthlyPayment: annuity(price, options?.full?.rate ?? RATE_FULL, options?.full?.amort ?? 0.02),
      approvalLikelihood: "low",
      recommended: false,
    },
    {
      key: "ninety",
      label: "90 % Beleihungsauslauf",
      beleihungsauslauf: 0.9,
      loanAmount: price * 0.9,
      equityNeeded: closing.total + price * 0.1,
      interestRate: options?.ninety?.rate ?? RATE_NINETY,
      amortRate: options?.ninety?.amort ?? 0.03,
      monthlyPayment: annuity(price * 0.9, options?.ninety?.rate ?? RATE_NINETY, options?.ninety?.amort ?? 0.03),
      approvalLikelihood: "medium",
      recommended: true,
    },
    {
      key: "eighty",
      label: "80 % Beleihungsauslauf",
      beleihungsauslauf: 0.8,
      loanAmount: price * 0.8,
      equityNeeded: closing.total + price * 0.2,
      interestRate: options?.eighty?.rate ?? RATE_EIGHTY,
      amortRate: options?.eighty?.amort ?? 0.03,
      monthlyPayment: annuity(price * 0.8, options?.eighty?.rate ?? RATE_EIGHTY, options?.eighty?.amort ?? 0.03),
      approvalLikelihood: "high",
      recommended: false,
    },
  ];
}

// Annuitätenrate (monatlich) bei gegebenem Zins p.a. + Anfangstilgung p.a.
// Vereinfachte Formel: (Zins + Tilgung) * Darlehen / 12
// Für die exakte Annuität bräuchte man die Annuitätenformel mit Zinseszins,
// für Bank-Vorgespräche reicht diese Näherung (1–2 % zu hoch in Jahr 1).
export function annuity(loan: number, rate: number, amort: number): number {
  return (loan * (rate + amort)) / 12;
}

// Restschuld nach n Jahren (vereinfacht)
export function remainingDebt(
  loan: number,
  rate: number,
  amort: number,
  years: number,
): number {
  // (1 + rate)^years * loan - annuity * (((1+rate)^years - 1) / rate)
  const annuityYearly = loan * (rate + amort);
  const factor = Math.pow(1 + rate, years);
  return loan * factor - (annuityYearly * (factor - 1)) / rate;
}

// ---------- Spar-Plan ----------

export type SavingsPlan = {
  monthsRemaining: number;
  totalNeeded: number;
  alreadySaved: number;
  stillToSave: number;
  monthlyRequired: number;
  feasible: boolean;       // ist das mit dem aktuellen Cashflow überhaupt möglich?
  cashflowAvailable: number;
};

export function computeSavingsPlan(
  plan: HousePurchasePlan,
  scenario: FinancingScenario,
  today: Date = new Date(),
): SavingsPlan {
  const months = monthsUntil(plan.target_purchase_date, today);
  const stillToSave = Math.max(0, scenario.equityNeeded - plan.existing_equity);
  const monthlyRequired = months > 0 ? stillToSave / months : stillToSave;

  // Cashflow: Einkommen - Fixkosten. Selbstständigkeit wird konservativ (50%) gewichtet,
  // weil Banken sie ohne 2–3 Jahre BWA nicht voll anrechnen.
  const cashflow =
    plan.monthly_net_income_self +
    plan.monthly_net_income_partner +
    plan.monthly_business_profit * 0.5 -
    plan.monthly_fixed_costs;

  return {
    monthsRemaining: months,
    totalNeeded: scenario.equityNeeded,
    alreadySaved: plan.existing_equity,
    stillToSave,
    monthlyRequired,
    cashflowAvailable: cashflow,
    feasible: monthlyRequired <= cashflow,
  };
}

export function monthsUntil(date: string | null, today: Date = new Date()): number {
  if (!date) return 48; // Default 4 Jahre
  const target = new Date(date);
  const months =
    (target.getFullYear() - today.getFullYear()) * 12 +
    (target.getMonth() - today.getMonth());
  return Math.max(0, months);
}

// ---------- Anlage-Allokation nach Sparhorizont ----------
// Kürzer als 1 Jahr → 100% Tagesgeld (jederzeit verfügbar)
// 1–2 Jahre → 60/40 Tagesgeld/Festgeld
// 2–3 Jahre → 40/40/20 (Tagesgeld/Festgeld/Geldmarktfonds)
// 3–5 Jahre → 30/30/40
// > 5 Jahre → ETF wird relevant, aber Hauskauf ist meist < 5 J.

export type AllocationBucket = {
  label: string;
  share: number;          // 0..1
  expectedRate: number;   // erwartete jährliche Rendite vor Steuern
  description: string;
};

export function computeAllocation(monthsRemaining: number): AllocationBucket[] {
  if (monthsRemaining <= 12) {
    return [
      { label: "Tagesgeld", share: 1.0, expectedRate: 0.028, description: "100 % verfügbar, EU-Einlagensicherung. ING, DKB, Trade Republic, ...." },
    ];
  }
  if (monthsRemaining <= 24) {
    return [
      { label: "Tagesgeld", share: 0.6, expectedRate: 0.028, description: "Notgroschen + Liquidität für Spontan-Bedarf" },
      { label: "Festgeld 12 M", share: 0.4, expectedRate: 0.031, description: "Höhere Zinsen, aber Geld 12 M gebunden" },
    ];
  }
  if (monthsRemaining <= 36) {
    return [
      { label: "Tagesgeld", share: 0.4, expectedRate: 0.028, description: "Liquide" },
      { label: "Festgeld 24 M", share: 0.4, expectedRate: 0.033, description: "Festgelegt für 2 Jahre" },
      { label: "Geldmarktfonds", share: 0.2, expectedRate: 0.035, description: "z. B. Xtrackers EUR Overnight (XEON) — täglich liquide, Marktrate, leicht volatil" },
    ];
  }
  // 3–5 Jahre
  return [
    { label: "Tagesgeld", share: 0.3, expectedRate: 0.028, description: "Liquide" },
    { label: "Festgeld 24–36 M", share: 0.3, expectedRate: 0.034, description: "Mittelfristig festgelegt" },
    { label: "Geldmarktfonds", share: 0.4, expectedRate: 0.035, description: "Marktrate, kurze Duration, niedriges Zinsänderungsrisiko" },
  ];
}

// ---------- Formatierung ----------
export const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export const eurSmall = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export const pct = (n: number, digits = 1) =>
  `${(n * 100).toFixed(digits).replace(".", ",")} %`;
