import { describe, it, expect } from "vitest";
import {
  computeMacros,
  estimateTDEE,
  planForDay,
  templateFor,
  WEEKLY_PLAN,
  WORKOUT_TEMPLATES,
} from "./plan";

describe("estimateTDEE", () => {
  it("uses Mifflin-St Jeor when height + age provided (male)", () => {
    // 30y, 80kg, 180cm, male, activity 1.55
    // BMR = 10*80 + 6.25*180 − 5*30 + 5 = 800 + 1125 − 150 + 5 = 1780
    // TDEE = 1780 * 1.55 = 2759
    const tdee = estimateTDEE(80, {
      heightCm: 180,
      ageYears: 30,
      sex: "male",
    });
    expect(tdee).toBeCloseTo(2759, -1);
  });

  it("falls back to 24*kg*activity without height/age (male)", () => {
    // 80 * 24 * 1.55 ≈ 2976
    const tdee = estimateTDEE(80);
    expect(tdee).toBe(Math.round(80 * 24 * 1.55));
  });

  it("uses 22*kg*activity for female fallback", () => {
    const tdee = estimateTDEE(60, { sex: "female" });
    expect(tdee).toBe(Math.round(60 * 22 * 1.55));
  });
});

describe("computeMacros", () => {
  it("recomp: ~300 kcal deficit, 2.0g/kg protein, 0.8g/kg fat", () => {
    const m = computeMacros(80, "recomp", {
      heightCm: 180,
      ageYears: 30,
      sex: "male",
    });
    // TDEE 2759, recomp -300 → 2459
    expect(m.kcal).toBeCloseTo(2459, -1);
    expect(m.protein_g).toBe(160); // 80 * 2.0
    expect(m.fat_g).toBe(64); // 80 * 0.8
    // Carbs = (2459 - 160*4 - 64*9) / 4 = (2459 - 640 - 576) / 4 = 1243 / 4 ≈ 311
    expect(m.carbs_g).toBeCloseTo(311, 0);
  });

  it("cut: 500 kcal deficit, protein same as recomp", () => {
    const m = computeMacros(80, "cut", {
      heightCm: 180,
      ageYears: 30,
      sex: "male",
    });
    expect(m.kcal).toBeCloseTo(2259, -1);
    expect(m.protein_g).toBe(160);
  });

  it("bulk: 250 kcal surplus", () => {
    const m = computeMacros(80, "bulk", {
      heightCm: 180,
      ageYears: 30,
      sex: "male",
    });
    expect(m.kcal).toBeCloseTo(3009, -1);
  });

  it("water target ≥ 2.5 L for small bodyweight", () => {
    const m = computeMacros(50, "recomp");
    expect(m.water_l).toBeGreaterThanOrEqual(2.5);
  });

  it("water target scales with weight (35 ml/kg) for larger bodyweight", () => {
    const m = computeMacros(100, "recomp");
    expect(m.water_l).toBeCloseTo(3.5, 1);
  });
});

describe("WEEKLY_PLAN", () => {
  it("has 7 days exactly", () => {
    expect(WEEKLY_PLAN).toHaveLength(7);
  });

  it("covers all dayKeys 0–6", () => {
    const keys = WEEKLY_PLAN.map((d) => d.dayKey).sort();
    expect(keys).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("contains 5 strength days (push/pull/legs)", () => {
    const strength = WEEKLY_PLAN.filter((d) =>
      ["push", "pull", "legs"].includes(d.workoutType),
    );
    expect(strength).toHaveLength(5);
  });
});

describe("planForDay", () => {
  it("returns Monday plan for a Monday", () => {
    // 2026-05-04 is a Monday
    const monday = new Date("2026-05-04T10:00:00");
    const plan = planForDay(monday);
    expect(plan.dayLabel).toBe("Montag");
    expect(plan.workoutType).toBe("push");
  });

  it("returns Sunday plan for a Sunday", () => {
    const sunday = new Date("2026-05-10T10:00:00");
    const plan = planForDay(sunday);
    expect(plan.dayLabel).toBe("Sonntag");
    expect(plan.workoutType).toBe("rest");
  });
});

describe("WORKOUT_TEMPLATES", () => {
  it("has at least one template per workout type", () => {
    const types = ["push", "pull", "legs", "cardio", "rest"] as const;
    for (const t of types) {
      expect(WORKOUT_TEMPLATES.some((tpl) => tpl.type === t)).toBe(true);
    }
  });

  it("Push A has 6 exercises starting with Bankdrücken", () => {
    const tpl = templateFor("push", "A")!;
    expect(tpl.exercises).toHaveLength(6);
    expect(tpl.exercises[0].name).toMatch(/Bankdrücken/);
  });

  it("Legs default has Squat + RDL + Calf", () => {
    const tpl = templateFor("legs")!;
    const names = tpl.exercises.map((e) => e.name).join(" ");
    expect(names).toMatch(/Kniebeuge/);
    expect(names).toMatch(/Kreuzheben/);
    expect(names).toMatch(/Wadenheben/);
  });
});
