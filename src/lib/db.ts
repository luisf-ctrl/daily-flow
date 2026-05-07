// Local-first DB via Dexie (IndexedDB). All data stays on this device.
import Dexie, { type Table } from "dexie";

export type HabitFrequency = "daily" | "weekly_3" | "weekly_4" | "weekly_5";

export interface Habit {
  id: string;
  name: string;
  icon: string; // emoji
  target_value?: number;
  unit?: string;
  frequency: HabitFrequency;
  reminder_time?: string; // "HH:mm"
  archived: 0 | 1; // Dexie indexes booleans as 0/1
  created_at: string; // ISO
  sort: number;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string; // YYYY-MM-DD
  value?: number;
  done: 0 | 1;
  note?: string;
  created_at: string;
}

export interface DailyReflection {
  id: string;
  date: string; // YYYY-MM-DD (unique)
  what_went_well?: string;
  what_went_bad?: string;
  learnings?: string;
  plan_tomorrow?: string;
  best_of_day?: string;
  mood_score?: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: "income" | "expense" | "saving";
  category?: string;
  note?: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  created_at: string;
}

export interface Workout {
  id: string;
  date: string;
  type: string; // Push / Pull / Legs / Cardio / Rest
  duration_min?: number;
  total_volume_kg?: number;
  note?: string;
}

export interface ExerciseSet {
  id: string;
  workout_id: string;
  exercise_name: string;
  weight_kg: number;
  reps: number;
  set_number: number;
}

export interface NutritionLog {
  id: string;
  date: string;
  kcal?: number;
  protein_g?: number;
  water_l?: number;
}

export interface Vitals {
  id: string;
  date: string;
  sleep_h?: number;
  rhr?: number;
  hrv?: number;
  weight_kg?: number;
}

export interface Note {
  id: string;
  type: "quick" | "longform";
  title?: string;
  body_md: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  author?: string;
  status: "wishlist" | "reading" | "finished";
  started_at?: string;
  finished_at?: string;
  rating?: number;
  highlights_md?: string;
}

export interface Idea {
  id: string;
  title: string;
  description?: string;
  status: "idea" | "validating" | "building" | "shipped" | "killed";
  created_at: string;
}

export interface Settings {
  key: string;
  value: unknown;
}

class TrackerDB extends Dexie {
  habits!: Table<Habit, string>;
  habit_logs!: Table<HabitLog, string>;
  reflections!: Table<DailyReflection, string>;
  transactions!: Table<Transaction, string>;
  financial_goals!: Table<FinancialGoal, string>;
  workouts!: Table<Workout, string>;
  exercise_sets!: Table<ExerciseSet, string>;
  nutrition_logs!: Table<NutritionLog, string>;
  vitals!: Table<Vitals, string>;
  notes!: Table<Note, string>;
  books!: Table<Book, string>;
  ideas!: Table<Idea, string>;
  settings!: Table<Settings, string>;

  constructor() {
    super("daily-tracker");
    this.version(1).stores({
      habits: "id, archived, sort, created_at",
      habit_logs: "id, habit_id, log_date, [habit_id+log_date]",
      reflections: "id, &date",
      transactions: "id, date, type",
      workouts: "id, date",
      notes: "id, type, created_at",
      settings: "&key",
    });
    this.version(2).stores({
      financial_goals: "id, deadline",
      exercise_sets: "id, workout_id, exercise_name",
      nutrition_logs: "id, &date",
      vitals: "id, &date",
      books: "id, status, title",
      ideas: "id, status, created_at",
    });
  }
}

export const db = new TrackerDB();

export const uid = () =>
  (crypto as Crypto & { randomUUID?: () => string }).randomUUID?.() ??
  Math.random().toString(36).slice(2) + Date.now().toString(36);
