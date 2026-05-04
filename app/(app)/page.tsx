import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return "Gute Nacht";
  if (h < 12) return "Guten Morgen";
  if (h < 18) return "Hallo";
  return "Guten Abend";
}

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date();
  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Luis";

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="label-caps">{format(today, "EEEE", { locale: de })} · KW {format(today, "II")}</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {greeting(today)}, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(today, "d. MMMM yyyy", { locale: de })}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-card px-3 py-1.5">
          <Flame className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">0 Tage</span>
        </div>
      </header>

      <Card>
        <CardContent className="pt-8 pb-10 text-center">
          <div className="text-5xl">🚀</div>
          <p className="mt-6 text-base text-muted-foreground">
            Etappe 1 fertig — Auth, Layout, Navigation stehen.
            <br />
            In Etappe 2a kommt der Notes-Tab, dann Body, dann Settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
