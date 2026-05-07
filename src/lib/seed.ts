import { db, uid, type Habit } from "./db";

const DEFAULTS: Omit<Habit, "id" | "created_at">[] = [
  { name: "Lesen", icon: "📖", target_value: 20, unit: "Seiten", frequency: "daily", archived: 0, sort: 1 },
  { name: "Sport", icon: "🏋️", target_value: 1, unit: "Workout", frequency: "weekly_4", archived: 0, sort: 2 },
  { name: "Kein Zucker", icon: "🥗", frequency: "daily", archived: 0, sort: 3 },
  { name: "2 L Wasser", icon: "💧", target_value: 2, unit: "L", frequency: "daily", archived: 0, sort: 4 },
  { name: "Protein-Ziel", icon: "🍗", target_value: 150, unit: "g", frequency: "daily", archived: 0, sort: 5 },
  { name: "Business — 1h fokussiert", icon: "💼", target_value: 60, unit: "min", frequency: "daily", archived: 0, sort: 6 },
  { name: "Sparen", icon: "💰", target_value: 30, unit: "€", frequency: "daily", archived: 0, sort: 7 },
  { name: "Meditation", icon: "🧘", target_value: 10, unit: "min", frequency: "daily", archived: 0, sort: 8 },
];

export async function seedIfEmpty() {
  const count = await db.habits.count();
  if (count > 0) return;
  await db.habits.bulkAdd(
    DEFAULTS.map((h) => ({ ...h, id: uid(), created_at: new Date().toISOString() }))
  );
  await db.settings.put({ key: "user_name", value: "Luis" });
}
