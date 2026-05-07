import { ReactNode, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { seedIfEmpty } from "@/lib/seed";

export function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    seedIfEmpty();
  }, []);

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-24 lg:pb-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
