# Daily Flow

Persönlicher, dunkler, mobile-first Habit- & Lebens-Tracker.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/ui · Supabase (Auth + Postgres + RLS) · Recharts · Framer Motion · Vitest.

---

## Status

| Etappe | Inhalt | Status |
|---|---|---|
| **1** | Setup, Auth (Magic Link), App-Shell, Bottom-Nav, Sidebar, Stub-Pages, DB-Schema | ✅ fertig |
| **2a** | Notes-Tab (Reflexion, Quick Notes, Bücher, Ideas) | ✅ fertig |
| **2b-money** | Money-Tab Phase 1 (Hauskauf-Plan, Szenarien, Spar-Logs) | ✅ fertig |
| 2b | Body-Tab (Workouts, Sets, Heatmap, Nutrition, Vitals) | offen |
| 2c | Settings-Tab (Habits-CRUD, Theme, Export) | offen |
| 3 | Home + Habits mit Live-Daten, Streak-Logik, End-Day-Modal | offen |
| 4 | PWA, Push-Notifications, Tastatur-Shortcuts | offen |

---

## Setup (einmalig)

### 1. Supabase-Projekt anlegen

1. Auf [supabase.com](https://supabase.com) ein neues Projekt anlegen (Free Tier reicht).
2. **SQL Editor → New query** → Migrationen der Reihe nach ausführen:
   - [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — Basis-Schema (12 Tabellen)
   - [`supabase/migrations/0002_house_plan.sql`](supabase/migrations/0002_house_plan.sql) — Hauskauf-Plan-Tabelle (Money-Tab)
3. **Authentication → Providers → Email** → "Enable Email provider" aktivieren. Magic-Link funktioniert standardmäßig über Supabase-SMTP (für Production eigene SMTP eintragen).
4. **Authentication → URL Configuration** → unter "Redirect URLs" `http://localhost:3000/auth/callback` eintragen (in Production die Vercel-URL hinzufügen).

### 2. Env-Variablen

```bash
cp .env.local.example .env.local
```

Dann `.env.local` füllen mit den Werten aus **Supabase → Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` *(für Seed-Skripte)*
- `ADMIN_EMAIL` — nur diese E-Mail darf einloggen.

### 3. Lokal starten

```bash
npm install
npm run dev
```

App läuft auf [http://localhost:3000](http://localhost:3000).
Beim ersten Öffnen wirst du auf `/login` umgeleitet → E-Mail eingeben → Magic Link aus dem Postfach klicken.

---

## Architektur

```
app/
  (app)/                # Geschützte Routen (Layout prüft auf User)
    layout.tsx          # AppShell + Auth-Guard
    page.tsx            # Home / Dashboard
    habits/page.tsx
    money/page.tsx
    body/page.tsx
    notes/page.tsx
    settings/page.tsx
  auth/
    callback/route.ts   # Magic-Link → Session-Tausch
    sign-out/route.ts
  login/page.tsx
  layout.tsx            # Root: Fonts, Toaster, dark class
  globals.css

components/
  ui/                   # shadcn-Primitive (Button, Card, Input, Label, ...)
  layout/               # Sidebar, BottomNav, AppShell
  ComingSoon.tsx

lib/
  supabase/
    client.ts           # Browser-Client
    server.ts           # Server-Client (RSC, Route Handler)
    middleware.ts       # Session-Refresh + Single-User-Guard
  utils.ts              # cn() Helper

middleware.ts           # globaler Auth-Guard
supabase/migrations/    # SQL-Migrationen
```

### Auth-Flow

1. User → `/login` → E-Mail eingeben.
2. `signInWithOtp` schickt Magic Link.
3. User klickt Link → Browser landet auf `/auth/callback?code=...`.
4. Callback-Route tauscht Code gegen Session → Cookies werden gesetzt → Redirect auf `/`.
5. `middleware.ts` prüft bei jedem Request:
   - eingeloggt? sonst → `/login`.
   - Email == `ADMIN_EMAIL`? sonst → `/login?error=not_authorized`.

### Row-Level-Security

Alle Tabellen haben RLS aktiviert mit Policy `auth.uid() = user_id`.
Selbst wenn jemand das `anon`-Key kennt, kann er nur seine eigenen Rows sehen.

---

## Deployment (Vercel)

```bash
vercel --prod
```

In Vercel **Project Settings → Environment Variables** dieselben Werte wie in `.env.local` eintragen.
Außerdem in Supabase die Vercel-URL als zusätzliche **Redirect URL** hinterlegen.

---

## Tests

```bash
npm test
```

Vitest läuft über `vitest.config.ts`. Streak-Logik wird in Etappe 3 als Pure-Function isoliert und getestet.
