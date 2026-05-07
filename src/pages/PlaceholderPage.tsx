import { AppShell } from "@/components/layout/AppShell";

export default function PlaceholderPage({ title, subtitle, emoji }: { title: string; subtitle: string; emoji: string }) {
  return (
    <AppShell>
      <div className="mb-6">
        <p className="label-caps mb-2">Coming next</p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="surface text-center py-16">
        <div className="text-5xl mb-4">{emoji}</div>
        <p className="text-muted-foreground max-w-md mx-auto">{subtitle}</p>
      </div>
    </AppShell>
  );
}
