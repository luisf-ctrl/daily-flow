import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { GreetingHeader } from "@/components/home/GreetingHeader";
import { DailyProgressBar } from "@/components/home/DailyProgressBar";
import { QuickStats } from "@/components/home/QuickStats";
import { DailyReflectionInput } from "@/components/home/DailyReflectionInput";
import { HabitCard } from "@/components/habits/HabitCard";

const Index = () => {
  const habits = useLiveQuery(() => db.habits.where("archived").equals(0).sortBy("sort")) ?? [];

  return (
    <AppShell>
      <GreetingHeader />

      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <DailyProgressBar />

          <section>
            <p className="label-caps mb-3 px-1">Heutige Habits</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {habits.length === 0 ? (
                <div className="surface text-sm text-muted-foreground sm:col-span-2">
                  Noch keine Habits — leg deinen ersten an 🚀
                </div>
              ) : (
                habits.map((h) => <HabitCard key={h.id} habit={h} compact />)
              )}
            </div>
          </section>
        </div>

        <div className="space-y-4 lg:space-y-6">
          <QuickStats />
          <DailyReflectionInput />
        </div>
      </div>
    </AppShell>
  );
};

export default Index;
