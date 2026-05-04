"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht eingeloggt");
  return { supabase, userId: user.id };
}

// =============================================================================
// House Purchase Plan
// =============================================================================

const STATE_CODES = [
  "BW","BY","BE","BB","HB","HH","HE","MV","NI","NW","RP","SL","SN","ST","SH","TH",
] as const;

const planSchema = z.object({
  target_purchase_price: z.coerce.number().positive(),
  region_code: z.enum(STATE_CODES),
  target_purchase_date: z.string().nullable().optional(),
  monthly_net_income_self: z.coerce.number().min(0),
  monthly_net_income_partner: z.coerce.number().min(0),
  monthly_business_profit: z.coerce.number().min(0),
  business_kleinunternehmer: z.coerce.boolean().optional(),
  monthly_fixed_costs: z.coerce.number().min(0),
  parental_leave_months: z.coerce.number().int().min(0).max(36),
  parental_leave_income: z.coerce.number().min(0),
  planned_own_use: z.coerce.boolean().optional(),
  existing_equity: z.coerce.number().min(0),
  existing_debts: z.coerce.number().min(0),
  notes: z.string().nullable().optional(),
});

export async function upsertHousePurchasePlan(formData: FormData) {
  const { supabase, userId } = await requireUser();

  const raw = Object.fromEntries(formData.entries());
  // Checkboxen: "on" → true, fehlend → false
  const parsed = planSchema.parse({
    ...raw,
    business_kleinunternehmer: raw.business_kleinunternehmer === "on",
    planned_own_use: raw.planned_own_use === "on",
    target_purchase_date: raw.target_purchase_date || null,
    notes: raw.notes || null,
  });

  const { error } = await supabase
    .from("house_purchase_plan")
    .upsert(
      { user_id: userId, ...parsed },
      { onConflict: "user_id" },
    );

  if (error) throw error;
  revalidatePath("/money");
}

// =============================================================================
// Savings Logs (transactions of type 'saving')
// =============================================================================

const savingSchema = z.object({
  amount: z.coerce.number().positive(),
  category: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  date: z.string().optional(),
});

export async function addSaving(formData: FormData) {
  const { supabase, userId } = await requireUser();

  const today = new Date().toISOString().slice(0, 10);
  const parsed = savingSchema.parse({
    amount: formData.get("amount"),
    category: formData.get("category") || "Allgemein",
    note: formData.get("note") || null,
    date: formData.get("date") || today,
  });

  // Insert as saving transaction
  const { error: txError } = await supabase.from("transactions").insert({
    user_id: userId,
    date: parsed.date ?? today,
    amount: parsed.amount,
    type: "saving",
    category: parsed.category,
    note: parsed.note,
  });
  if (txError) throw txError;

  // Update existing_equity in plan (atomic increment via RPC would be cleaner,
  // aber für Single-User reicht Lese-Modify-Schreib).
  const { data: plan } = await supabase
    .from("house_purchase_plan")
    .select("existing_equity")
    .eq("user_id", userId)
    .maybeSingle();

  if (plan) {
    const newEquity = Number(plan.existing_equity ?? 0) + parsed.amount;
    await supabase
      .from("house_purchase_plan")
      .update({ existing_equity: newEquity })
      .eq("user_id", userId);
  }

  revalidatePath("/money");
}

export async function deleteSaving(id: string, amount: number) {
  const { supabase, userId } = await requireUser();

  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;

  // EK reduzieren
  const { data: plan } = await supabase
    .from("house_purchase_plan")
    .select("existing_equity")
    .eq("user_id", userId)
    .maybeSingle();
  if (plan) {
    const newEquity = Math.max(0, Number(plan.existing_equity ?? 0) - amount);
    await supabase
      .from("house_purchase_plan")
      .update({ existing_equity: newEquity })
      .eq("user_id", userId);
  }

  revalidatePath("/money");
}
