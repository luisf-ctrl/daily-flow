# Daily Flow

Persönlicher, dunkler, mobile-first Habit- & Lebens-Tracker.

**Stack:** Vite + React 18 + TypeScript + Tailwind + shadcn/ui + lovable-tagger · Supabase (Auth + Postgres + RLS) · TanStack Query · Recharts · Framer Motion · Vitest.

Mit **Lovable** und **Claude Code** parallel editierbar.

---

## Status

| Etappe | Inhalt | Status |
|---|---|---|
| **1** | Vite-Scaffold, Layout (Sidebar/BottomNav), Theme, Habits-Components (Dexie) | ✅ aus dem Lovable-Scaffold |
| **2-Auth** | Supabase-Client, Magic-Link Login, ProtectedRoute, /setup-Page | ✅ fertig |
| **2a** | Notes-Tab (Reflexion, Quick Notes, Bücher, Ideas) — Supabase | ✅ fertig |
| **2b-money** | Money-Tab (Hauskauf-Plan, 3 Szenarien, Spar-Logs) — Supabase | ✅ fertig |
| **2b-body** | Body-Tab (Workouts, Sets, Heatmap, Nutrition, Vitals) — Supabase | ✅ fertig |
| 2c | Settings-Tab (Habits-CRUD, Theme-Toggle, Export) | offen |
| 3 | Home + Habits zu Supabase migrieren (aktuell Dexie) | offen |
| 4 | PWA, Push-Notifications, Tastatur-Shortcuts | offen |

> **Daten-Split**: Notes / Money / Body laufen über Supabase mit Auth.
> Index (Home) / Habits laufen weiter lokal über Dexie/IndexedDB —
> diese Migration zu Supabase ist Etappe 3.

---

## Setup (einmalig)

### 1. Supabase-Projekt anlegen

1. Auf [supabase.com](https://supabase.com) ein neues Projekt anlegen (Free Tier reicht).
2. **SQL Editor → New query** → die Migrationen der Reihe nach ausführen:
   - [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — Basis-Schema (12 Tabellen + RLS + Profile-Trigger)
   - [`supabase/migrations/0002_house_plan.sql`](supabase/migrations/0002_house_plan.sql) — Hauskauf-Plan
3. **Authentication → Providers → Email** → Email-Provider aktivieren.
4. **Authentication → URL Configuration → Redirect URLs** → deine Deploy-URL eintragen, z. B.:
   - `http://localhost:8080/auth/callback` (lokal)
   - `https://deine-app.vercel.app/auth/callback` (production)

### 2. Env-Variablen

```bash
cp .env.local.example .env.local
```

Werte aus **Supabase → Settings → API** eintragen. **Wichtig:** in Vite müssen alle Client-Vars `VITE_*` heißen.

### 3. Lokal starten

```bash
npm install
npm run dev
```

App läuft auf [http://localhost:8080](http://localhost:8080). Falls die Env-Vars fehlen, landest du auf `/setup` mit einer klaren Anleitung.

---

## Architektur

```
src/
  integrations/
    supabase/
      client.ts       # Supabase-Client (oder Stub bei fehlenden Env-Vars)
      types.ts        # Row-Types passend zu den SQL-Migrationen
  hooks/
    useAuth.tsx       # Auth-Provider + useAuth-Hook
    useMoneyData.ts   # React-Query Hooks für Money-Feature
    useBodyData.ts    # React-Query Hooks für Body-Feature
  components/
    auth/             # ProtectedRoute
    layout/           # Sidebar, BottomNav, AppShell
    notes/            # DailyReflectionForm, QuickNotes, BookSection, IdeaBoard
    money/            # PlanSettingsDialog, EquityProgressCard, ScenarioCards, ...
    body/             # WorkoutTypePicker, ExerciseSetLogger, WeekHeatmap, ...
    home/             # GreetingHeader, DailyProgressBar, QuickStats, ... (Dexie)
    habits/           # HabitCard, HabitHeatmap, NewHabitDialog (Dexie)
    ui/               # shadcn-Primitive
  lib/
    finance/calc.ts   # Pure Berechnungen für Hauskauf (testbar)
    db.ts             # Dexie-Schema (Legacy für Index/Habits)
    seed.ts           # Demo-Daten für Dexie
    streak.ts         # Streak-Berechnung
    utils.ts          # cn() helper
    dates.ts          # todayISO()
  pages/
    Index.tsx         # Home (Dexie)
    Habits.tsx        # Habits (Dexie)
    Money.tsx         # Hauskauf-Plan (Supabase)
    Notes.tsx         # Reflexion + Notes + Bücher + Ideen (Supabase)
    Body.tsx          # Workouts + Nutrition + Vitals (Supabase)
    Login.tsx         # Magic Link
    AuthCallback.tsx  # Session-Tausch
    Setup.tsx         # Env-Vars-fehlend-Fallback
  App.tsx             # Router + Provider-Stack
  main.tsx            # Entry

supabase/migrations/  # SQL-Migrationen für Supabase
```

### Auth-Flow

1. User → `/login` → E-Mail eingeben → `signInWithOtp`
2. Supabase schickt Magic Link → User klickt → Browser landet auf `/auth/callback?code=...`
3. `AuthCallback` ruft `supabase.auth.exchangeCodeForSession(code)` → Session in localStorage
4. `ProtectedRoute` prüft bei jedem Render:
   - Supabase konfiguriert? sonst → `/setup`
   - User eingeloggt? sonst → `/login`
   - Email == `VITE_ADMIN_EMAIL`? sonst → Logout + `/login?error=not_authorized`

### Row-Level-Security

Alle Supabase-Tabellen haben RLS aktiviert mit Policy `auth.uid() = user_id`. Selbst mit dem `anon`-Key sieht jeder User nur seine eigenen Rows.

---

## Deployment

### Vercel

1. GitHub-Repo verbinden
2. **Project → Settings → Environment Variables** → die `VITE_*`-Vars setzen (für Production + Preview)
3. **Auto-Deploy**

### Lovable

Dieses Repo ist Lovable-kompatibel (`vite-config.ts` mit `lovable-tagger` ist drin). Im Lovable-Editor:
1. Repo importieren
2. Im Lovable-Settings die Env-Vars setzen
3. Live-Editor öffnet sich

---

## Tests

```bash
npm test          # einmalig
npm run test:watch
```

Aktuell: 21 Tests (Streak-Logik aus dem Original-Scaffold + 20 für die Hauskauf-Berechnungen).

---

## Lovable-spezifische Hinweise

- **Komponenten-Tagger** (`lovable-tagger` in `vite.config.ts`) ist im Dev-Mode aktiv → Lovable kann Components inline anklicken/editieren.
- **shadcn-UI** unter `src/components/ui/` — diese Files NICHT direkt editieren, sondern im Code Variants verwenden.
- **Server-State** läuft komplett über TanStack Query (`useQuery` / `useMutation`) — keine Server Actions, kein SSR.
- **Pages** sind alle Client-Components, die in `src/App.tsx` per React Router gemountet werden.
