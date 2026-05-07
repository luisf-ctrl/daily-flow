import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitHeatmap } from "@/components/habits/HabitHeatmap";
import { NewHabitDialog } from "@/components/habits/NewHabitDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function HabitsPage() {
  const habits = useLiveQuery(() => db.habits.where("archived").equals(0).sortBy("sort")) ?? [];
  const [view, setView] = useState("today");

  return (
    <AppShell>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <p className="label-caps mb-2">Goalmaxxing</p>
          <h1 className="text-3xl font-semibold tracking-tight">Habits & Ziele</h1>
        </div>
        <NewHabitDialog />
      </div>

      <Tabs value={view} onValueChange={setView}>
        <TabsList className="bg-card border border-white/[0.06] mb-6">
          <TabsTrigger value="today">Heute</TabsTrigger>
          <TabsTrigger value="week">Woche</TabsTrigger>
          <TabsTrigger value="all">Alle</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-3">
          {habits.map((h) => <HabitCard key={h.id} habit={h} />)}
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          {habits.map((h) => (
            <div key={h.id} className="surface">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{h.icon}</span>
                  <div>
                    <div className="font-medium">{h.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {h.frequency === "daily" ? "Täglich" : h.frequency.replace("weekly_", "") + "× pro Woche"}
                    </div>
                  </div>
                </div>
              </div>
              <HabitHeatmap habit={h} />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-3">
          {habits.map((h) => <HabitCard key={h.id} habit={h} />)}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
