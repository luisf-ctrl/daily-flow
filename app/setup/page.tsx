import { AlertTriangle, CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Diese Seite rendert NUR wenn die Middleware sie freigegeben hat —
// also dann, wenn mindestens eine Supabase-Env-Var fehlt.
export const dynamic = "force-dynamic";

type EnvCheck = {
  name: string;
  required: boolean;
  description: string;
  source: string;
};

const ENV_VARS: EnvCheck[] = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    description: "Project-URL deines Supabase-Projekts",
    source: "Supabase → Settings → API → Project URL",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: true,
    description: "Anonymous (public) API-Key",
    source: "Supabase → Settings → API → Project API keys → anon public",
  },
  {
    name: "ADMIN_EMAIL",
    required: false,
    description: "Single-User-Lock — nur diese E-Mail darf einloggen",
    source: "deine eigene E-Mail-Adresse",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    required: false,
    description: "Service-Role-Key (für Seed-Skripte, optional)",
    source: "Supabase → Settings → API → service_role secret",
  },
];

export default function SetupPage() {
  const status = ENV_VARS.map((v) => ({
    ...v,
    set: Boolean(process.env[v.name]),
  }));

  const missing = status.filter((v) => v.required && !v.set);
  const allRequiredSet = missing.length === 0;

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16 space-y-8">
        <header className="space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Setup erforderlich</h1>
          <p className="text-muted-foreground">
            Daily Flow läuft, aber {allRequiredSet ? "noch nicht voll konfiguriert" : "nicht — Supabase-Env-Vars fehlen"}.
            Trag die Werte unten in deinem Hosting-Provider (z. B. Vercel) ein, dann redeploye.
          </p>
        </header>

        <Card>
          <CardContent className="pt-6">
            <h2 className="label-caps mb-4">Environment Variables</h2>
            <ul className="divide-y divide-white/[0.04]">
              {status.map((v) => (
                <li key={v.name} className="py-4 first:pt-0 last:pb-0 flex items-start gap-3">
                  {v.set ? (
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  ) : v.required ? (
                    <XCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="font-mono text-sm font-semibold break-all">
                        {v.name}
                      </code>
                      {v.required ? (
                        <span className="text-[10px] uppercase tracking-wide text-danger">
                          required
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          optional
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{v.description}</p>
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
            <h2 className="label-caps">Was tun?</h2>
            <ol className="list-decimal pl-5 space-y-3 text-sm">
              <li>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary inline-flex items-center gap-1 hover:underline"
                >
                  Supabase-Projekt anlegen <ExternalLink className="h-3 w-3" />
                </a>{" "}
                (Free Tier reicht).
              </li>
              <li>
                Im SQL Editor die Migration aus{" "}
                <code className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-xs">
                  supabase/migrations/0001_init.sql
                </code>{" "}
                ausführen.
              </li>
              <li>
                In <strong>Authentication → Providers → Email</strong> den Email-Provider
                aktivieren.
              </li>
              <li>
                In <strong>Authentication → URL Configuration → Redirect URLs</strong>{" "}
                deine Deploy-URL eintragen, z. B.{" "}
                <code className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-xs break-all">
                  https://daily-flow-zeta.vercel.app/auth/callback
                </code>
                .
              </li>
              <li>
                In Vercel <strong>(Project → Settings → Environment Variables)</strong>{" "}
                die obigen Variablen für Production + Preview + Development setzen.
              </li>
              <li>
                <strong>Redeploy</strong> auslösen — dann verschwindet diese Seite.
              </li>
            </ol>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Komplette README unter{" "}
          <a
            href="https://github.com/luisf-ctrl/daily-flow"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            github.com/luisf-ctrl/daily-flow
          </a>
        </p>
      </div>
    </div>
  );
}
