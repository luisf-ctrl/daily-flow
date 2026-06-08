import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Heart,
  Bed,
  Coffee,
  Apple,
  Moon,
  Sparkles,
  Wine,
  Footprints,
  Droplets,
  Target,
  Flame,
  ChevronDown,
  Sunrise,
} from "lucide-react";

/* ============================================================
   DATEN
============================================================ */

const STATS = [
  { label: "Alter", value: "31" },
  { label: "Größe", value: "178" },
  { label: "Aktuell", value: "92", accent: true, suffix: "kg" },
  { label: "Ziel", value: "82", suffix: "kg" },
];

type WorkoutType = "push" | "pull" | "cardio" | "legs" | "upper" | "active" | "rest";

const WEEK: {
  key: WorkoutType;
  dow: number; // 1=Mo..7=So
  short: string;
  day: string;
  focus: string;
  durationMin: number;
  exercises: { name: string; sets: string }[];
  Icon: typeof Dumbbell;
}[] = [
  {
    key: "push",
    dow: 1,
    short: "Mo",
    day: "Montag",
    focus: "Push",
    durationMin: 60,
    Icon: Dumbbell,
    exercises: [
      { name: "Bankdrücken", sets: "4 × 8" },
      { name: "Schrägbankdrücken", sets: "3 × 10" },
      { name: "Schulterdrücken", sets: "4 × 10" },
      { name: "Seitheben", sets: "3 × 15" },
      { name: "Trizepsdrücken", sets: "3 × 12" },
      { name: "Dips", sets: "3 × Max" },
    ],
  },
  {
    key: "pull",
    dow: 2,
    short: "Di",
    day: "Dienstag",
    focus: "Pull",
    durationMin: 60,
    Icon: Dumbbell,
    exercises: [
      { name: "Klimmzüge", sets: "4 × Max" },
      { name: "Latziehen", sets: "4 × 10" },
      { name: "Rudern", sets: "4 × 10" },
      { name: "Face Pulls", sets: "3 × 15" },
      { name: "Bizepscurls", sets: "3 × 12" },
      { name: "Hammer Curls", sets: "3 × 12" },
    ],
  },
  {
    key: "cardio",
    dow: 3,
    short: "Mi",
    day: "Mittwoch",
    focus: "Cardio + Core",
    durationMin: 45,
    Icon: Heart,
    exercises: [
      { name: "Joggen locker", sets: "30 min" },
      { name: "Plank", sets: "3 × 60 s" },
      { name: "Beinheben", sets: "3 × 15" },
      { name: "Russian Twists", sets: "3 × 20" },
    ],
  },
  {
    key: "legs",
    dow: 4,
    short: "Do",
    day: "Donnerstag",
    focus: "Beine",
    durationMin: 60,
    Icon: Dumbbell,
    exercises: [
      { name: "Kniebeugen", sets: "4 × 8" },
      { name: "Beinpresse", sets: "4 × 12" },
      { name: "Rum. Kreuzheben", sets: "4 × 10" },
      { name: "Ausfallschritte", sets: "3 × 12" },
      { name: "Wadenheben", sets: "4 × 20" },
    ],
  },
  {
    key: "upper",
    dow: 5,
    short: "Fr",
    day: "Freitag",
    focus: "Oberkörper",
    durationMin: 60,
    Icon: Dumbbell,
    exercises: [
      { name: "Bankdrücken", sets: "3 × 10" },
      { name: "Klimmzüge", sets: "3 × Max" },
      { name: "Schulterdrücken", sets: "3 × 10" },
      { name: "Rudern", sets: "3 × 10" },
      { name: "Bizeps", sets: "3 × 12" },
      { name: "Trizeps", sets: "3 × 12" },
    ],
  },
  {
    key: "active",
    dow: 6,
    short: "Sa",
    day: "Samstag",
    focus: "Aktiver Tag",
    durationMin: 90,
    Icon: Footprints,
    exercises: [
      { name: "Rennrad", sets: "60–120 min" },
      { name: "oder Schritte", sets: "10–15k" },
    ],
  },
  {
    key: "rest",
    dow: 7,
    short: "So",
    day: "Sonntag",
    focus: "Regeneration",
    durationMin: 30,
    Icon: Bed,
    exercises: [
      { name: "Spaziergang", sets: "—" },
      { name: "Mobility", sets: "—" },
      { name: "Dehnen", sets: "—" },
    ],
  },
];

const ROUTINE: {
  time: string;
  title: string;
  desc: string;
  Icon: typeof Sunrise;
  isTraining?: boolean;
}[] = [
  { time: "05:00", title: "Aufstehen", desc: "500 ml Wasser · 5 min Mobility · Kaffee", Icon: Sunrise },
  { time: "05:30", title: "Training", desc: "60 min nach Wochenplan", Icon: Dumbbell, isTraining: true },
  { time: "06:30", title: "Frühstück", desc: "4 Eier · 80 g Haferflocken · 250 g Skyr · Beeren · ≈700 kcal", Icon: Apple },
  { time: "10:30", title: "Snack", desc: "Proteinshake · Banane", Icon: Coffee },
  { time: "12:30", title: "Mittag", desc: "200 g Hähnchen · 150 g Reis · viel Gemüse", Icon: Apple },
  { time: "15:30", title: "Snack", desc: "250 g Magerquark · Handvoll Nüsse", Icon: Coffee },
  { time: "18:30", title: "Abendessen", desc: "200 g Lachs / Rind · Gemüse · Kartoffeln oder Reis", Icon: Apple },
  { time: "21:30", title: "Abendroutine", desc: "Handy weg · Magnesium · Lesen", Icon: Moon },
  { time: "22:00", title: "Schlafen", desc: "8 Stunden", Icon: Bed },
];

const PHASES = [
  { n: 1, range: "Monat 1–2", title: "Gewohnheiten", desc: "Routine zementieren · 4–6 kg Fettverlust", target: 30 },
  { n: 2, range: "Monat 3–4", title: "Definition", desc: "Sichtbare Veränderung · Kraft hoch halten", target: 60 },
  { n: 3, range: "Monat 5–6", title: "Sixpack", desc: "Cut-Phase · 10–13 % KFA", target: 100 },
];

const NUTRITION = [
  { label: "Protein", target: "180–200 g", items: "Hähnchen, Pute, Eier, Skyr, Magerquark, Lachs, Thunfisch, Whey" },
  { label: "Kohlenhydrate", target: "moderat", items: "Reis, Kartoffeln, Haferflocken, Vollkorn, Obst" },
  { label: "Fette", target: "qualitativ", items: "Nüsse, Avocado, Olivenöl, Fisch" },
];

const ALCOHOL = [
  { week: "Woche 1–2", rule: "max. 2 Abende" },
  { week: "Woche 3–4", rule: "max. 1 Abend" },
  { week: "Ab Woche 5", rule: "nur besondere Anlässe" },
];

const DAILY = [
  { label: "10.000 Schritte", Icon: Footprints },
  { label: "3 Liter Wasser", Icon: Droplets },
  { label: "180 g Protein", Icon: Target },
  { label: "8 Stunden Schlaf", Icon: Bed },
  { label: "1 Stunde Training", Icon: Dumbbell },
  { label: "Kein Alkohol unter der Woche", Icon: Wine },
  { label: "Sonntag Gewicht messen", Icon: Flame },
];

/* ============================================================
   HELPERS
============================================================ */

function dowMondayFirst(d = new Date()): number {
  // 1=Mo .. 7=So
  const js = d.getDay(); // 0=So..6=Sa
  return js === 0 ? 7 : js;
}

function minutesSinceMidnight(d = new Date()): number {
  return d.getHours() * 60 + d.getMinutes();
}

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function currentRoutineIndex(now = new Date()): number {
  const m = minutesSinceMidnight(now);
  let idx = 0;
  for (let i = 0; i < ROUTINE.length; i++) {
    if (m >= timeToMinutes(ROUTINE[i].time)) idx = i;
  }
  return idx;
}

const TODAY_LABEL = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

/* ============================================================
   PAGE
============================================================ */

type Scope = "tag" | "woche" | "monat";

export default function Plan() {
  const [scope, setScope] = useState<Scope>("tag");
  const todayDow = dowMondayFirst();
  const today = useMemo(() => WEEK.find((d) => d.dow === todayDow)!, [todayDow]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ambient gold glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10),transparent_60%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[440px] px-5 pb-24 pt-8">
        {/* Header */}
        <header className="mb-6">
          <p className="label-caps">Dein Plan</p>
          <h1 className="mt-1 text-[42px] leading-[0.95] tracking-tight">
            Sixpack in
            <br />
            <span className="text-primary gold-text-glow">4–6 Monaten</span>
          </h1>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {TODAY_LABEL}
          </p>
        </header>

        {/* Scope-Switch */}
        <nav className="mb-6">
          <div className="relative grid grid-cols-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1">
            {(["tag", "woche", "monat"] as Scope[]).map((s) => {
              const active = scope === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  className="relative z-10 rounded-xl py-2.5 text-xs font-bold uppercase tracking-[0.18em] transition-colors"
                >
                  {active && (
                    <motion.span
                      layoutId="scope-pill"
                      className="absolute inset-0 -z-10 rounded-xl bg-primary gold-glow"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className={active ? "text-primary-foreground" : "text-muted-foreground"}>
                    {s}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Stats Strip */}
        <section className="mb-7 grid grid-cols-4 gap-2">
          {STATS.map((s) => (
            <div
              key={s.label}
              className={`rounded-xl border bg-white/[0.03] p-3 text-center ${
                s.accent ? "border-primary/30 ring-1 ring-primary/20" : "border-white/[0.06]"
              }`}
            >
              <p className="mb-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </p>
              <p
                className={`font-display text-xl leading-none ${
                  s.accent ? "text-primary" : "text-foreground"
                }`}
              >
                {s.value}
                {s.suffix && (
                  <span className="ml-0.5 text-[10px] font-sans font-medium text-muted-foreground">
                    {s.suffix}
                  </span>
                )}
              </p>
            </div>
          ))}
        </section>

        {/* Scope Content */}
        <AnimatePresence mode="wait">
          {scope === "tag" && (
            <motion.div
              key="tag"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-7"
            >
              <TodayHero today={today} />
              <DailyTimeline />
            </motion.div>
          )}

          {scope === "woche" && (
            <motion.div
              key="woche"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <SectionHead title="Wochenplan" caption="5 + 1 + 1 Split" />
              <WeekStrip todayDow={todayDow} />
              <WeekList todayDow={todayDow} />
            </motion.div>
          )}

          {scope === "monat" && (
            <motion.div
              key="monat"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-7"
            >
              <PhaseHero />
              <NutritionBlock />
              <AlcoholBlock />
              <DailyHabits />
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-12 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Konsequenz schlägt Perfektion
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   TAG
============================================================ */

function TodayHero({ today }: { today: (typeof WEEK)[number] }) {
  // Ring 1: Tagesfortschritt (Uhrzeit), Ring 2: Wochenfortschritt
  const m = minutesSinceMidnight();
  const dayPct = Math.min(1, Math.max(0, (m - 5 * 60) / (22 * 60 - 5 * 60))); // 05:00 → 22:00
  const weekPct = (dowMondayFirst() - 1) / 7;

  const Icon = today.Icon;

  return (
    <section>
      <SectionHead title="Heute" caption={today.day} />
      <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-5">
          <DualRing dayPct={dayPct} weekPct={weekPct} />
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Training
              </p>
              <p className="font-display text-2xl leading-tight">{today.focus}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                <Icon className="mr-1 inline h-3 w-3" />
                {today.durationMin} min
              </span>
              <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {today.exercises.length} Übungen
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-0 divide-y divide-white/[0.04]">
          {today.exercises.map((ex) => (
            <div
              key={ex.name}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <span className="text-sm text-foreground/90">{ex.name}</span>
              <span className="font-mono text-xs text-primary">{ex.sets}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DualRing({ dayPct, weekPct }: { dayPct: number; weekPct: number }) {
  const R1 = 40;
  const R2 = 30;
  const C1 = 2 * Math.PI * R1;
  const C2 = 2 * Math.PI * R2;

  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
        <circle cx="48" cy="48" r={R1} stroke="hsl(var(--primary) / 0.08)" strokeWidth="8" fill="transparent" />
        <motion.circle
          cx="48"
          cy="48"
          r={R1}
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={C1}
          initial={{ strokeDashoffset: C1 }}
          animate={{ strokeDashoffset: C1 * (1 - dayPct) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.45))" }}
        />
        <circle cx="48" cy="48" r={R2} stroke="hsl(var(--primary) / 0.06)" strokeWidth="8" fill="transparent" />
        <motion.circle
          cx="48"
          cy="48"
          r={R2}
          stroke="hsl(var(--primary-glow))"
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={C2}
          initial={{ strokeDashoffset: C2 }}
          animate={{ strokeDashoffset: C2 * (1 - weekPct) }}
          transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
          style={{ opacity: 0.55 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-1.5 w-1.5 rounded-full bg-primary pulse-gold" />
      </div>
    </div>
  );
}

function DailyTimeline() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  const activeIdx = currentRoutineIndex(now);

  return (
    <section>
      <SectionHead title="Tages-Routine" caption="Mo – Fr" />
      <div className="space-y-3">
        {ROUTINE.map((r, i) => {
          const isActive = i === activeIdx;
          const isPast = i < activeIdx;
          const Icon = r.Icon;
          const isLast = i === ROUTINE.length - 1;
          return (
            <div key={r.time} className="group flex items-stretch gap-4">
              {/* Rail */}
              <div className="flex flex-col items-center pt-3">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isActive
                      ? "bg-primary ring-4 ring-primary/20 pulse-gold"
                      : isPast
                        ? "bg-primary/40"
                        : "bg-white/20"
                  }`}
                />
                {!isLast && (
                  <div
                    className={`mt-1 w-px flex-1 ${
                      isPast
                        ? "bg-gradient-to-b from-primary/30 to-white/[0.05]"
                        : "bg-white/[0.05]"
                    }`}
                  />
                )}
              </div>

              {/* Card */}
              <div
                className={`flex-1 rounded-2xl border p-4 transition-all ${
                  isActive
                    ? "border-primary/30 bg-white/[0.06] shadow-[0_4px_24px_rgba(201,168,76,0.08)]"
                    : isPast
                      ? "border-white/[0.04] bg-white/[0.02] opacity-60"
                      : "border-white/[0.05] bg-white/[0.03]"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-mono text-xs font-bold ${
                        isActive ? "text-primary" : isPast ? "text-muted-foreground" : "text-foreground/70"
                      }`}
                    >
                      {r.time}
                    </p>
                    <Icon
                      className={`h-3 w-3 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <p
                    className={`text-[10px] uppercase tracking-[0.18em] ${
                      isActive ? "font-bold text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {isActive ? "Jetzt" : r.title}
                  </p>
                </div>
                <p className="text-sm font-medium leading-snug">
                  {isActive ? r.title : r.desc}
                </p>
                {isActive && (
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                    {r.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   WOCHE
============================================================ */

function WeekStrip({ todayDow }: { todayDow: number }) {
  return (
    <div className="mb-2 grid grid-cols-7 gap-1.5">
      {WEEK.map((d) => {
        const isToday = d.dow === todayDow;
        return (
          <div
            key={d.dow}
            className={`flex flex-col items-center gap-1 rounded-xl border py-2 ${
              isToday
                ? "border-primary/40 bg-primary/10"
                : "border-white/[0.05] bg-white/[0.02]"
            }`}
          >
            <span
              className={`text-[9px] uppercase tracking-wider ${
                isToday ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {d.short}
            </span>
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                d.key === "rest"
                  ? "bg-white/15"
                  : isToday
                    ? "bg-primary pulse-gold"
                    : "bg-primary/40"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

function WeekList({ todayDow }: { todayDow: number }) {
  const [open, setOpen] = useState<number>(todayDow);
  return (
    <div className="space-y-2">
      {WEEK.map((d) => {
        const isOpen = open === d.dow;
        const isToday = d.dow === todayDow;
        const Icon = d.Icon;
        return (
          <div
            key={d.dow}
            className={`overflow-hidden rounded-2xl border transition-colors ${
              isToday
                ? "border-primary/30 bg-white/[0.04]"
                : "border-white/[0.05] bg-white/[0.02]"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? 0 : d.dow)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
                  isToday
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-white/[0.06] bg-white/[0.03] text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-base leading-none">{d.day}</p>
                  {isToday && (
                    <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                      Heute
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {d.focus} · {d.durationMin} min
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-0 divide-y divide-white/[0.04] border-t border-white/[0.05] px-4 pb-3">
                    {d.exercises.map((ex) => (
                      <div
                        key={ex.name}
                        className="flex items-center justify-between gap-3 py-2.5 text-sm"
                      >
                        <span>{ex.name}</span>
                        <span className="font-mono text-xs text-primary">
                          {ex.sets}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   MONAT
============================================================ */

function PhaseHero() {
  // Aktuell = Phase 1 (Startpunkt)
  const currentPhase = 1;
  return (
    <section>
      <SectionHead title="6-Monats-Plan" caption="3 Phasen" />
      <div className="space-y-3">
        {PHASES.map((p) => {
          const isCurrent = p.n === currentPhase;
          return (
            <div
              key={p.n}
              className={`flex items-center gap-4 rounded-2xl border p-4 ${
                isCurrent
                  ? "border-primary/30 bg-white/[0.05] shadow-[0_4px_24px_rgba(201,168,76,0.05)]"
                  : "border-white/[0.05] bg-white/[0.02]"
              }`}
            >
              <PhaseRing pct={isCurrent ? 0.18 : 0} active={isCurrent} n={p.n} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-[10px] uppercase tracking-[0.2em] ${
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {p.range}
                  </p>
                  {isCurrent && (
                    <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                      Jetzt
                    </span>
                  )}
                </div>
                <p className="font-display text-lg leading-tight">{p.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {p.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PhaseRing({ pct, active, n }: { pct: number; active: boolean; n: number }) {
  const R = 24;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
        <circle cx="28" cy="28" r={R} stroke="hsl(var(--primary) / 0.1)" strokeWidth="4" fill="transparent" />
        <motion.circle
          cx="28"
          cy="28"
          r={R}
          stroke={active ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)"}
          strokeWidth="4"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - pct) }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={active ? { filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.5))" } : undefined}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className={`font-display text-lg ${active ? "text-primary" : "text-muted-foreground"}`}>
          {n}
        </span>
      </div>
    </div>
  );
}

function NutritionBlock() {
  return (
    <section>
      <SectionHead title="Ernährung" caption="Ohne Kalorien zählen" />
      <div className="space-y-2">
        {NUTRITION.map((n) => (
          <div
            key={n.label}
            className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4"
          >
            <div className="mb-1 flex items-baseline justify-between">
              <p className="font-display text-base">{n.label}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary">
                {n.target}
              </p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{n.items}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AlcoholBlock() {
  return (
    <section>
      <SectionHead title="Alkohol" caption="Größter Hebel" />
      <div className="rounded-2xl border border-destructive/15 bg-destructive/[0.04] p-4">
        <div className="mb-3 flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed">
            Aktuell dein größter Fortschritts-Killer. Allein durch Reduktion
            vermutlich <strong className="text-primary">2–4 kg</strong> weniger.
          </p>
        </div>
        <div className="space-y-1.5">
          {ALCOHOL.map((a) => (
            <div
              key={a.week}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 text-sm"
            >
              <span className="text-muted-foreground">{a.week}</span>
              <span className="font-medium">{a.rule}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DailyHabits() {
  return (
    <section>
      <SectionHead title="Täglich" caption="Nicht verhandelbar" />
      <div className="space-y-1.5">
        {DAILY.map((h) => {
          const Icon = h.Icon;
          return (
            <div
              key={h.label}
              className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3"
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="flex-1 text-sm">{h.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   SHARED
============================================================ */

function SectionHead({ title, caption }: { title: string; caption?: string }) {
  return (
    <header className="mb-3 flex items-end justify-between">
      <h2 className="font-display text-2xl leading-none tracking-wide">{title}</h2>
      {caption && (
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {caption}
        </span>
      )}
    </header>
  );
}
