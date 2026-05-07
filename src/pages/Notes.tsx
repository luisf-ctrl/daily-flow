import { AppShell } from "@/components/layout/AppShell";
import { DailyReflectionForm } from "@/components/notes/DailyReflectionForm";
import { QuickNotes } from "@/components/notes/QuickNotes";
import { BookSection } from "@/components/notes/BookSection";
import { IdeaBoard } from "@/components/notes/IdeaBoard";

export default function Notes() {
  return (
    <AppShell>
      <div className="space-y-10">
        <header className="space-y-1">
          <p className="label-caps">Reflexion &amp; Wissen</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Notes
          </h1>
        </header>

        <DailyReflectionForm />
        <QuickNotes />
        <BookSection />
        <IdeaBoard />
      </div>
    </AppShell>
  );
}
