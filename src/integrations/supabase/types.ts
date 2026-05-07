// Shared DB row types — mirror das SQL-Schema in supabase/migrations/.
// Lovable-Konvention: Types neben dem Client.

export type DailyReflection = {
  id: string;
  user_id: string;
  date: string;
  what_went_well: string | null;
  what_went_bad: string | null;
  learnings: string | null;
  plan_tomorrow: string | null;
  mood_score: number | null;
  created_at: string;
};

export type Note = {
  id: string;
  user_id: string;
  type: "quick" | "longform";
  title: string | null;
  body_md: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type BookStatus = "reading" | "finished" | "wishlist";

export type Book = {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  status: BookStatus;
  started_at: string | null;
  finished_at: string | null;
  rating: number | null;
  highlights_md: string | null;
  created_at: string;
};

export type IdeaStatus =
  | "idea"
  | "validating"
  | "building"
  | "shipped"
  | "killed";

export type Idea = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: IdeaStatus;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  type: "income" | "expense" | "saving";
  category: string | null;
  note: string | null;
  created_at: string;
};

export type GermanState =
  | "BW" | "BY" | "BE" | "BB" | "HB" | "HH" | "HE" | "MV"
  | "NI" | "NW" | "RP" | "SL" | "SN" | "ST" | "SH" | "TH";

export type HousePurchasePlan = {
  user_id: string;
  target_purchase_price: number;
  region_code: GermanState;
  target_purchase_date: string | null;
  monthly_net_income_self: number;
  monthly_net_income_partner: number;
  monthly_business_profit: number;
  business_kleinunternehmer: boolean;
  monthly_fixed_costs: number;
  parental_leave_months: number;
  parental_leave_income: number;
  planned_own_use: boolean;
  existing_equity: number;
  existing_debts: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkoutType =
  | "push"
  | "pull"
  | "legs"
  | "cardio"
  | "rest"
  | "custom";

export type Workout = {
  id: string;
  user_id: string;
  date: string;
  type: WorkoutType | null;
  duration_min: number | null;
  total_volume_kg: number | null;
  note: string | null;
  created_at: string;
};

export type ExerciseSet = {
  id: string;
  workout_id: string;
  exercise_name: string;
  weight_kg: number | null;
  reps: number | null;
  set_number: number | null;
  rpe: number | null;
  created_at: string;
};

export type NutritionLog = {
  id: string;
  user_id: string;
  date: string;
  kcal: number | null;
  protein_g: number | null;
  water_l: number | null;
  note: string | null;
  created_at: string;
};

export type VitalsLog = {
  id: string;
  user_id: string;
  date: string;
  sleep_h: number | null;
  rhr: number | null;
  hrv: number | null;
  weight_kg: number | null;
  created_at: string;
};
