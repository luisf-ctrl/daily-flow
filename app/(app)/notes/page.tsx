import { createClient } from "@/lib/supabase/server";
import { DailyReflectionForm } from "@/components/notes/DailyReflectionForm";
import { QuickNotes } from "@/components/notes/QuickNotes";
import { BookSection } from "@/components/notes/BookSection";
import { IdeaBoard } from "@/components/notes/IdeaBoard";
import type {
  Book,
  DailyReflection,
  Idea,
  Note,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function todayISO() {
  // Lokales Datum (kein UTC-Drift) als YYYY-MM-DD
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export default async function NotesPage() {
  const supabase = createClient();
  const date = todayISO();

  const [
    { data: reflectionRow },
    { data: notes },
    { data: books },
    { data: ideas },
  ] = await Promise.all([
    supabase
      .from("daily_reflections")
      .select("*")
      .eq("date", date)
      .maybeSingle(),
    supabase
      .from("notes")
      .select("*")
      .eq("type", "quick")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("ideas").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <p className="label-caps">Reflexion & Wissen</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Notes
        </h1>
      </header>

      <DailyReflectionForm
        reflection={(reflectionRow as DailyReflection | null) ?? null}
        date={date}
      />

      <QuickNotes notes={(notes as Note[] | null) ?? []} />

      <BookSection books={(books as Book[] | null) ?? []} />

      <IdeaBoard ideas={(ideas as Idea[] | null) ?? []} />
    </div>
  );
}
