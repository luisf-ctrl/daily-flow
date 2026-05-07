import { AlertTriangle, CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type EnvCheck = {
  name: string;
  required: boolean;
  description: string;
  source: string;
  set: boolean;
};

export default function Setup() {
  const env = import.meta.env as Record<string, string | undefined>;

  const checks: EnvCheck[] = [
    {
      name: "VITE_SUPABASE_URL",
      required: true,
      description: "Project-URL deines Supabase-Projekts",
      source: "Supabase → Settings → API → Project URL",
      set: Boolean(env.VITE_SUPABASE_URL),
    },
    {
      name: "VITE_SUPABASE_ANON_KEY",
      required: true,
      description: "Anonymous (public) API-Key",
      source: "Supabase → Settings → API → Project API keys → anon public",
      set: Boolean(env.VITE_SUPABASE_ANON_KEY),
    },
    {
      name: "VITE_ADMIN_EMAIL",
      required: false,
      description: "Single-User-Lock — nur diese E-Mail darf einloggen",
      source: "deine eigene E-Mail-Adresse",
      set: Boolean(env.VITE_ADMIN_EMAIL),
    },
    {
      name: "VITE_DEFAULT_LOGIN_EMAIL",
      required: false,
      description: "Vorbelegung im Login-Form (Komfort)",
      source: "deine eigene E-Mail",
      set: Boolean(env.VITE_DEFAULT_LOGIN_EMAIL),
    },
  ];

  const missing = checks.filter((v) => v.required && !v.set);
  const allRequiredSet = missing.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16 space-y-8">
        <header className="space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Setup erforderlich</h1>
          <p className="text-muted-foreground">
            Daily Flow läuft, aber{" "}
            {allRequiredSet
              ? "noch nicht voll konfiguriert"
              : "nicht — Supabase-Env-Vars fehlen"}
            . Trag die Werte unten in deinem Hosting-Provider (Vercel / Lovable)
            ein und redeploye.
          </p>
        </header>

        <Card>
          <CardContent className="pt-6">
            <p className="label-caps mb-4">Environment Variables</p>
            <ul className="divide-y divide-white/[0.04]">
              {checks.map((v) => (
                <li
                  key={v.name}
                  className="py-4 first:pt-0 last:pb-0 flex items-start gap-3"
                >
                  {v.set ? (
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  ) : v.required ? (
                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="font-mono text-sm font-semibold break-all">
                        {v.name}
                      </code>
                      {v.required ? (
                        <span className="text-[10px] uppercase tracking-wide text-destructive">
                          required
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          optional
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {v.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="opacity-60">Quelle:</span> {v.source}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="label-caps">Was tun?</p>
            <ol className="list-decimal pl-5 space-y-3 text-sm">
              <li>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary inline-flex items-center gap-1 hover:underline"
                >
                  Supabase-Projekt anlegen
                  <ExternalLink className="h-3 w-3" />
                </a>{" "}
                (Free Tier reicht).
              </li>
              <li>
                SQL Editor → die beiden Migrationen aus{" "}
                <code className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-xs">
                  supabase/migrations/
                </code>{" "}
                der Reihe nach ausführen.
              </li>
              <li>
                <strong>Authentication → Providers → Email</strong>{" "}
                aktivieren.
              </li>
              <li>
                <strong>Authentication → URL Configuration → Redirect URLs</strong>:
                deine Deploy-URL <code className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-xs">/auth/callback</code> eintragen.
              </li>
              <li>
                Im Hosting (Vercel / Lovable) <strong>Environment Variables</strong>{" "}
                setzen.
              </li>
              <li>
                <strong>Redeploy</strong> auslösen — diese Seite verschwindet.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
