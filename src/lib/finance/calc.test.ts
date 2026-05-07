import { describe, it, expect } from "vitest";
import {
  computeClosingCosts,
  computeScenarios,
  annuity,
  computeSavingsPlan,
  computeAllocation,
  monthsUntil,
} from "./calc";
import type { HousePurchasePlan } from "@/integrations/supabase/types";

describe("computeClosingCosts", () => {
  it("calculates Baden-Württemberg with 800k correctly", () => {
    const c = computeClosingCosts(800000, "BW");
    // Grunderwerbsteuer 5% von 800k = 40000
    expect(c.grunderwerbsteuer).toBe(40000);
    // Notar+GB 2% von 800k = 16000
    expect(c.notarGrundbuch).toBe(16000);
    // Makler 3.57%/2 = 1.785% von 800k = 14280
    expect(c.makler).toBeCloseTo(14280, 0);
    // Puffer default 10000
    expect(c.puffer).toBe(10000);
    // Total: 40000 + 16000 + 14280 + 10000 = 80280
    expect(c.total).toBeCloseTo(80280, 0);
    expect(c.totalInvestment).toBeCloseTo(880280, 0);
  });

  it("uses correct rate for Bavaria (3.5%)", () => {
    const c = computeClosingCosts(800000, "BY");
    expect(c.grunderwerbsteuer).toBeCloseTo(28000, 0);
  });

  it("excludes Makler when withMakler=false", () => {
    const c = computeClosingCosts(800000, "BW", { withMakler: false });
    expect(c.makler).toBe(0);
  });
});

describe("computeScenarios", () => {
  const closing = computeClosingCosts(800000, "BW");
  const scenarios = computeScenarios(800000, closing);

  it("returns three scenarios in order: full, ninety, eighty", () => {
    expect(scenarios.map((s) => s.key)).toEqual(["full", "ninety", "eighty"]);
  });

  it("full: equity = closing + 10k risk buffer", () => {
    expect(scenarios[0].equityNeeded).toBeCloseTo(closing.total + 10000, 0);
    expect(scenarios[0].loanAmount).toBe(800000);
  });

  it("ninety: equity = closing + 10% of price", () => {
    expect(scenarios[1].equityNeeded).toBeCloseTo(closing.total + 80000, 0);
    expect(scenarios[1].loanAmount).toBe(720000);
  });

  it("eighty: equity = closing + 20% of price", () => {
    expect(scenarios[2].equityNeeded).toBeCloseTo(closing.total + 160000, 0);
    expect(scenarios[2].loanAmount).toBe(640000);
  });

  it("ninety scenario is recommended", () => {
    expect(scenarios[1].recommended).toBe(true);
    expect(scenarios[0].recommended).toBe(false);
    expect(scenarios[2].recommended).toBe(false);
  });

  it("monthly payment uses (rate + amort) / 12 * loan", () => {
    // ninety: 720000 * (0.037 + 0.03) / 12 = 4020
    expect(scenarios[1].monthlyPayment).toBeCloseTo(4020, 0);
  });
});

describe("annuity", () => {
  it("computes monthly payment correctly", () => {
    expect(annuity(720000, 0.037, 0.03)).toBeCloseTo(4020, 0);
    expect(annuity(640000, 0.034, 0.03)).toBeCloseTo(3413.33, 1);
  });
});

describe("monthsUntil", () => {
  it("returns 48 when no date given", () => {
    expect(monthsUntil(null)).toBe(48);
  });

  it("returns positive months when date is in the future", () => {
    const today = new Date("2026-05-01");
    expect(monthsUntil("2030-05-01", today)).toBe(48);
    expect(monthsUntil("2027-05-01", today)).toBe(12);
  });

  it("clamps to 0 when date is in the past", () => {
    const today = new Date("2026-05-01");
    expect(monthsUntil("2024-05-01", today)).toBe(0);
  });
});

describe("computeSavingsPlan", () => {
  const plan: HousePurchasePlan = {
    user_id: "u",
    target_purchase_price: 800000,
    region_code: "BW",
    target_purchase_date: "2030-05-01",
    monthly_net_income_self: 3800,
    monthly_net_income_partner: 3300,
    monthly_business_profit: 500,
    business_kleinunternehmer: true,
    monthly_fixed_costs: 4000,
    parental_leave_months: 12,
    parental_leave_income: 1800,
    planned_own_use: true,
    existing_equity: 0,
    existing_debts: 0,
    notes: null,
    created_at: "",
    updated_at: "",
  };
  const closing = computeClosingCosts(800000, "BW");
  const scenarios = computeScenarios(800000, closing);
  const today = new Date("2026-05-01");

  it("for ninety scenario in 4 years: monthly required ≈ (closing + 80k) / 48", () => {
    const sp = computeSavingsPlan(plan, scenarios[1], today);
    expect(sp.monthsRemaining).toBe(48);
    // 80280 + 80000 = 160280 / 48 ≈ 3339 €/Monat
    expect(sp.monthlyRequired).toBeCloseTo(3339, 0);
  });

  it("counts business profit at 50% (bank-konservativ)", () => {
    const sp = computeSavingsPlan(plan, scenarios[1], today);
    // 3800 + 3300 + 500*0.5 - 4000 = 3350
    expect(sp.cashflowAvailable).toBe(3350);
  });

  it("ninety scenario in 4 years is borderline-feasible (3339 < 3350)", () => {
    const sp = computeSavingsPlan(plan, scenarios[1], today);
    expect(sp.feasible).toBe(true);
  });

  it("eighty scenario in 4 years is NOT feasible (5006 €/M > 3350)", () => {
    const sp = computeSavingsPlan(plan, scenarios[2], today);
    expect(sp.feasible).toBe(false);
  });
});

describe("computeAllocation", () => {
  it("100% Tagesgeld when ≤12 months", () => {
    const a = computeAllocation(12);
    expect(a).toHaveLength(1);
    expect(a[0].share).toBe(1.0);
  });

  it("3-bucket split for 24–36 months", () => {
    const a = computeAllocation(36);
    expect(a).toHaveLength(3);
    expect(a.reduce((s, b) => s + b.share, 0)).toBeCloseTo(1.0);
  });

  it("3-bucket split for 48 months (4 years)", () => {
    const a = computeAllocation(48);
    expect(a).toHaveLength(3);
    expect(a.reduce((s, b) => s + b.share, 0)).toBeCloseTo(1.0);
  });
});
