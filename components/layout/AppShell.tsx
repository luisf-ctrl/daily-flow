import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <Sidebar />
      <main
        className="flex-1 pb-20 md:pb-0"
        // pb-20 leaves room for the mobile bottom nav (h-16 + safe-area).
      >
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
