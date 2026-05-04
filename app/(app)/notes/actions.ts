"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { BookStatus, IdeaStatus } from "@/lib/types";

// Tags aus "#word" im Body parsen — kommt nur von Quick Notes.
// Bewusst ohne Unicode-Property-Escapes, damit TS-Target=es5 weiter klappt.
function parseTags(text: string): string[] {
  const matches = text.match(/#[\wäöüÄÖÜß-]+/g) ?? [];
  return Array.from(new Set(matches.map((t) => t.slice(1).toLowerCase())));
}

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht eingeloggt");
  return { supabase, userId: user.id };
}

// =============================================================================
// Daily Reflection
// =============================================================================

const reflectionSchema = z.object({
  date: z.string(),
  what_went_well: z.string().optional().nullable(),
  what_went_bad: z.string().optional().nullable(),
  learnings: z.string().optional().nullable(),
  plan_tomorrow: z.string().optional().nullable(),
  mood_score: z.coerce.number().int().min(1).max(5).optional().nullable(),
});

export async function saveReflection(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const parsed = reflectionSchema.parse({
    date: formData.get("date"),
    what_went_well: formData.get("what_went_well") || null,
    what_went_bad: formData.get("what_went_bad") || null,
    learnings: formData.get("learnings") || null,
    plan_tomorrow: formData.get("plan_tomorrow") || null,
    mood_score: formData.get("mood_score") || null,
  });

  // Upsert auf (user_id, date) — die SQL-Migration hat ein UNIQUE constraint darauf.
  const { error } = await supabase
    .from("daily_reflections")
    .upsert(
      { user_id: userId, ...parsed },
      { onConflict: "user_id,date" },
    );

  if (error) throw error;
  revalidatePath("/notes");
  revalidatePath("/");
}

// =============================================================================
// Quick Notes
// =============================================================================

export async function addQuickNote(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;

  const tags = parseTags(text);

  const { error } = await supabase.from("notes").insert({
    user_id: userId,
    type: "quick",
    title: null,
    body_md: text,
    tags,
  });
  if (error) throw error;
  revalidatePath("/notes");
}

export async function deleteQuickNote(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/notes");
}

// =============================================================================
// Books
// =============================================================================

const bookSchema = z.object({
  title: z.string().min(1, "Titel fehlt"),
  author: z.string().optional().nullable(),
  status: z.enum(["reading", "finished", "wishlist"]),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  highlights_md: z.string().optional().nullable(),
});

export async function addBook(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const parsed = bookSchema.parse({
    title: formData.get("title"),
    author: formData.get("author") || null,
    status: formData.get("status") || "reading",
    rating: formData.get("rating") || null,
    highlights_md: formData.get("highlights_md") || null,
  });

  const today = new Date().toISOString().slice(0, 10);
  const startedAt = parsed.status === "wishlist" ? null : today;
  const finishedAt = parsed.status === "finished" ? today : null;

  const { error } = await supabase.from("books").insert({
    user_id: userId,
    ...parsed,
    started_at: startedAt,
    finished_at: finishedAt,
  });
  if (error) throw error;
  revalidatePath("/notes");
}

export async function updateBookStatus(id: string, status: BookStatus) {
  const { supabase } = await requireUser();
  const today = new Date().toISOString().slice(0, 10);
  const patch: Record<string, unknown> = { status };
  if (status === "finished") patch.finished_at = today;
  if (status === "reading") patch.finished_at = null;

  const { error } = await supabase.from("books").update(patch).eq("id", id);
  if (error) throw error;
  revalidatePath("/notes");
}

export async function deleteBook(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/notes");
}

// =============================================================================
// Ideas
// =============================================================================

const ideaSchema = z.object({
  title: z.string().min(1, "Titel fehlt"),
  description: z.string().optional().nullable(),
  status: z.enum(["idea", "validating", "building", "shipped", "killed"]),
});

export async function addIdea(formData: FormData) {
  const { supabase, userId } = await requireUser();
  const parsed = ideaSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || null,
    status: formData.get("status") || "idea",
  });

  const { error } = await supabase.from("ideas").insert({
    user_id: userId,
    ...parsed,
  });
  if (error) throw error;
  revalidatePath("/notes");
}

export async function updateIdeaStatus(id: string, status: IdeaStatus) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("ideas")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/notes");
}

export async function deleteIdea(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("ideas").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/notes");
}
