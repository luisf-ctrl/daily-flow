// Fitness-Plan: Recomp (Fett verlieren + Muskeln aufbauen).
// Basis: Push/Pull/Legs Split, 5x/Woche, mit 1 Cardio-HIIT-Tag + 1 Z2-Steady-Tag.
// Quelle: eigener Notion-Trainingsplan + Konsens-Empfehlungen aus
// Sportwissenschaft (Helms / Schoenfeld zu Volumen & Frequency,
// 2.0 g Protein/kg Körpergewicht für Recomp, moderates Defizit).

import type { WorkoutType } from "@/integrations/supabase/types";

// =============================================================================
// 5 Non-Negotiables (aus dem Notion-Export, kanonisch)
// =============================================================================

export const NON_NEGOTIABLES = [
  "Form vor Gewicht — saubere Technik immer Vorrang",
  "7–9 h Schlaf — wichtigste Recovery-Variable",
  "Genug Protein — 2,0 g pro kg Körpergewicht",
  "Progressive Overload — alle 1–2 Wochen Gewicht oder Reps steigern",
  "Konsistenz schlägt Perfektion — 80 % der Sessions reichen",
] as const;

// =============================================================================
// Wochenplan: 5x Krafttraining + 1 HIIT + 1 Steady-Cardio
// =============================================================================

export type DayKey = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sonntag, 1 = Montag, ...

export type DayPlan = {
  dayKey: DayKey;
  dayLabel: string;        // 'Montag'
  shortLabel: string;      // 'Mo'
  workoutType: WorkoutType;
  title: string;           // 'Push — Brust, Schultern, Triceps'
  description: string;     // motivierender 1-Liner
  durationMin: number;
  intensity: "low" | "medium" | "high";
};

export const WEEKLY_PLAN: DayPlan[] = [
  {
    dayKey: 1,
    dayLabel: "Montag",
    shortLabel: "Mo",
    workoutType: "push",
    title: "Push — Brust, Schultern, Triceps",
    description: "Schwer drücken. Bench, Schrägbank, Schulterdrücken.",
    durationMin: 60,
    intensity: "high",
  },
  {
    dayKey: 2,
    dayLabel: "Dienstag",
    shortLabel: "Di",
    workoutType: "pull",
    title: "Pull — Rücken, Biceps",
    description: "Klimmzüge, Rudern, Curls. Volumen & Symmetrie.",
    durationMin: 60,
    intensity: "high",
  },
  {
    dayKey: 3,
    dayLabel: "Mittwoch",
    shortLabel: "Mi",
    workoutType: "cardio",
    title: "HIIT-Cardio — 25 min",
    description: "8 × (30 s sprint / 90 s easy) — Bike oder Lauf.",
    durationMin: 25,
    intensity: "high",
  },
  {
    dayKey: 4,
    dayLabel: "Donnerstag",
    shortLabel: "Do",
    workoutType: "legs",
    title: "Legs — Beine, Glutes",
    description: "Squat, RDL, Beinpresse. Größte Muskelgruppe = größter Hebel.",
    durationMin: 70,
    intensity: "high",
  },
  {
    dayKey: 5,
    dayLabel: "Freitag",
    shortLabel: "Fr",
    workoutType: "push",
    title: "Push B — Schulter-Fokus",
    description: "Schulterdrücken voraus, Variation zu Mo.",
    durationMin: 55,
    intensity: "medium",
  },
  {
    dayKey: 6,
    dayLabel: "Samstag",
    shortLabel: "Sa",
    workoutType: "pull",
    title: "Pull B — Lats & Arme",
    description: "Latzug-Fokus + Armvolumen. Variation zu Di.",
    durationMin: 55,
    intensity: "medium",
  },
  {
    dayKey: 0,
    dayLabel: "Sonntag",
    shortLabel: "So",
    workoutType: "rest",
    title: "Rest + 45 min Z2-Cardio",
    description: "Lockerer Spaziergang oder Radfahrt — Recovery & Fettverbrennung.",
    durationMin: 45,
    intensity: "low",
  },
];

export function planForDay(date: Date = new Date()): DayPlan {
  const dayKey = date.getDay() as DayKey;
  return WEEKLY_PLAN.find((d) => d.dayKey === dayKey) ?? WEEKLY_PLAN[0];
}

// =============================================================================
// Exercise-Templates pro Workout-Type
// =============================================================================

export type ExerciseTemplate = {
  name: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  rir: number;             // Reps in Reserve — Hypertrophie-Sweet-Spot ist 1–3
  notes?: string;
};

export type WorkoutTemplate = {
  type: WorkoutType;
  variant: "A" | "B" | "default";
  title: string;
  exercises: ExerciseTemplate[];
};

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  // ---------------- PUSH A (Mo) ----------------
  {
    type: "push",
    variant: "A",
    title: "Push A — Brust-Fokus",
    exercises: [
      { name: "Bankdrücken (Langhantel)", sets: 4, repsMin: 6, repsMax: 8, rir: 2, notes: "Hauptlift — schwer" },
      { name: "Schrägbankdrücken (Kurzhantel)", sets: 3, repsMin: 8, repsMax: 12, rir: 2 },
      { name: "Schulterdrücken (Kurzhantel)", sets: 3, repsMin: 8, repsMax: 12, rir: 2 },
      { name: "Seitheben (Kurzhantel)", sets: 3, repsMin: 12, repsMax: 15, rir: 1 },
      { name: "Trizepsdrücken am Kabel", sets: 3, repsMin: 10, repsMax: 15, rir: 1 },
      { name: "Brustfliegen am Kabel", sets: 3, repsMin: 12, repsMax: 15, rir: 1, notes: "Finisher — Pump" },
    ],
  },
  // ---------------- PUSH B (Fr) ----------------
  {
    type: "push",
    variant: "B",
    title: "Push B — Schulter-Fokus",
    exercises: [
      { name: "Schulterdrücken (Langhantel)", sets: 4, repsMin: 6, repsMax: 8, rir: 2, notes: "Hauptlift" },
      { name: "Schrägbankdrücken (Langhantel)", sets: 3, repsMin: 8, repsMax: 10, rir: 2 },
      { name: "Seitheben (Kurzhantel)", sets: 4, repsMin: 12, repsMax: 15, rir: 1 },
      { name: "Reverse Fly", sets: 3, repsMin: 12, repsMax: 15, rir: 1 },
      { name: "Dips", sets: 3, repsMin: 8, repsMax: 12, rir: 1, notes: "ggf. assisted" },
      { name: "Trizeps-Pushdown", sets: 3, repsMin: 12, repsMax: 15, rir: 1 },
    ],
  },
  // ---------------- PULL A (Di) ----------------
  {
    type: "pull",
    variant: "A",
    title: "Pull A — Rücken-Volumen",
    exercises: [
      { name: "Klimmzüge", sets: 4, repsMin: 5, repsMax: 10, rir: 2, notes: "ggf. assisted oder mit Zusatzgewicht" },
      { name: "T-Bar Rudern", sets: 4, repsMin: 8, repsMax: 12, rir: 2 },
      { name: "Latzug (eng)", sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
      { name: "Face Pulls", sets: 3, repsMin: 12, repsMax: 15, rir: 1, notes: "Schultergesundheit" },
      { name: "Bizepscurls (Langhantel)", sets: 3, repsMin: 8, repsMax: 12, rir: 2 },
      { name: "Hammer Curls", sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
    ],
  },
  // ---------------- PULL B (Sa) ----------------
  {
    type: "pull",
    variant: "B",
    title: "Pull B — Lat-Breite + Arme",
    exercises: [
      { name: "Latzug (breit)", sets: 4, repsMin: 8, repsMax: 12, rir: 2, notes: "Hauptlift" },
      { name: "Rudern am Kabel", sets: 4, repsMin: 10, repsMax: 12, rir: 2 },
      { name: "Pullover (Kurzhantel)", sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
      { name: "Scott-Curls", sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
      { name: "Konzentrations-Curls", sets: 3, repsMin: 12, repsMax: 15, rir: 1 },
      { name: "Reverse Curls", sets: 2, repsMin: 12, repsMax: 15, rir: 1, notes: "Unterarme" },
    ],
  },
  // ---------------- LEGS (Do) ----------------
  {
    type: "legs",
    variant: "default",
    title: "Legs — Beine komplett",
    exercises: [
      { name: "Kniebeuge (Back Squat)", sets: 4, repsMin: 6, repsMax: 8, rir: 2, notes: "Hauptlift — schwer" },
      { name: "Rumänisches Kreuzheben", sets: 4, repsMin: 8, repsMax: 10, rir: 2, notes: "Hamstrings + Glutes" },
      { name: "Beinpresse", sets: 3, repsMin: 10, repsMax: 12, rir: 2 },
      { name: "Beinbeuger liegend", sets: 3, repsMin: 10, repsMax: 12, rir: 1 },
      { name: "Beinstrecker", sets: 3, repsMin: 12, repsMax: 15, rir: 1 },
      { name: "Wadenheben stehend", sets: 4, repsMin: 12, repsMax: 15, rir: 1 },
    ],
  },
  // ---------------- CARDIO HIIT ----------------
  {
    type: "cardio",
    variant: "default",
    title: "HIIT — 25 min Intervall",
    exercises: [
      { name: "Warm-up easy", sets: 1, repsMin: 5, repsMax: 5, rir: 0, notes: "5 min locker" },
      { name: "Sprint-Intervall", sets: 8, repsMin: 1, repsMax: 1, rir: 0, notes: "30 s all-out / 90 s easy" },
      { name: "Cool-down", sets: 1, repsMin: 4, repsMax: 4, rir: 0, notes: "4 min auslaufen" },
    ],
  },
  // ---------------- REST ----------------
  {
    type: "rest",
    variant: "default",
    title: "Rest + Z2-Recovery",
    exercises: [
      { name: "Z2-Cardio (Spaziergang/Bike)", sets: 1, repsMin: 45, repsMax: 60, rir: 0, notes: "Plaudertempo, ~65 % HFmax" },
      { name: "Mobility", sets: 1, repsMin: 10, repsMax: 10, rir: 0, notes: "Hüftöffner, Schultern" },
    ],
  },
];

export function templateFor(
  type: WorkoutType,
  variant: "A" | "B" | "default" = "default",
): WorkoutTemplate | undefined {
  return (
    WORKOUT_TEMPLATES.find((t) => t.type === type && t.variant === variant) ??
    WORKOUT_TEMPLATES.find((t) => t.type === type)
  );
}

// =============================================================================
// Makro-Berechnung für Recomp (Fett -, Muskel +)
// =============================================================================

export type Goal = "cut" | "recomp" | "bulk";

export type MacroTargets = {
  kcal: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  water_l: number;
};

// Mifflin-St Jeor: Grundumsatz (BMR)
// Für Männer: 10*kg + 6.25*cm − 5*age + 5
// Für Frauen: 10*kg + 6.25*cm − 5*age − 161
// Bei fehlender Größe / Alter: Default-Faktor 22 × kg
//   (grobe Daumenregel für Erwachsene mittlerer Größe)
export function estimateTDEE(
  weightKg: number,
  options?: {
    heightCm?: number;
    ageYears?: number;
    sex?: "male" | "female";
    activityFactor?: number; // 1.2 sedentary, 1.55 moderate, 1.725 active
  },
): number {
  const sex = options?.sex ?? "male";
  const activity = options?.activityFactor ?? 1.55; // 4–5 Trainings/Woche = moderate-to-active

  let bmr: number;
  if (options?.heightCm && options?.ageYears) {
    bmr =
      10 * weightKg +
      6.25 * options.heightCm -
      5 * options.ageYears +
      (sex === "male" ? 5 : -161);
  } else {
    // Fallback ohne Größe/Alter
    bmr = (sex === "male" ? 24 : 22) * weightKg;
  }
  return Math.round(bmr * activity);
}

// Recomp = leichtes Defizit (~300 kcal), Cut = stärkeres Defizit (~500 kcal),
// Bulk = leichter Surplus (+250 kcal). Protein hoch halten in allen Modi.
export function computeMacros(
  weightKg: number,
  goal: Goal,
  options?: Parameters<typeof estimateTDEE>[1],
): MacroTargets {
  const tdee = estimateTDEE(weightKg, options);
  const deficit = goal === "cut" ? -500 : goal === "recomp" ? -300 : +250;
  const kcal = Math.round(tdee + deficit);

  // Protein 2.0 g/kg in jedem Modus (Aussage: hilft Muskel halten/aufbauen)
  const protein_g = Math.round(weightKg * 2.0);
  // Fett 0.8 g/kg (Untergrenze für Hormonhaushalt)
  const fat_g = Math.round(weightKg * 0.8);
  // Carbs = Rest aus kcal-Budget
  const proteinKcal = protein_g * 4;
  const fatKcal = fat_g * 9;
  const carbsKcal = Math.max(0, kcal - proteinKcal - fatKcal);
  const carbs_g = Math.round(carbsKcal / 4);

  // Wasser-Faustregel: 35 ml/kg (oder min 2.5 L)
  const water_l = Math.max(2.5, Math.round((weightKg * 0.035) * 10) / 10);

  return { kcal, protein_g, fat_g, carbs_g, water_l };
}

export const GOAL_LABELS: Record<Goal, string> = {
  cut: "Cut — schnellere Fett-Reduktion (~500 kcal Defizit)",
  recomp: "Recomp — Fett ↓ + Muskel ↑ (~300 kcal Defizit)",
  bulk: "Bulk — Muskelaufbau (+250 kcal Surplus)",
};

// =============================================================================
// LocalStorage-Settings (kein eigenes DB-Schema — vereinfacht für jetzt)
// =============================================================================

export type FitnessSettings = {
  goal: Goal;
  heightCm?: number;
  ageYears?: number;
  sex?: "male" | "female";
  manualWeightKg?: number; // wenn keine vitals.weight_kg vorhanden
};

const STORAGE_KEY = "daily-flow:fitness-settings";

export function loadFitnessSettings(): FitnessSettings {
  if (typeof window === "undefined") return { goal: "recomp" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { goal: "recomp" };
    const parsed = JSON.parse(raw);
    return { goal: "recomp", ...parsed };
  } catch {
    return { goal: "recomp" };
  }
}

export function saveFitnessSettings(s: FitnessSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}
