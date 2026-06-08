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
  ShoppingBasket,
  Camera,
  Ruler,
  Scale,
  CheckCircle2,
  Circle,
  Info,
  Check,
} from "lucide-react";
import { SwipeRow } from "@/components/plan/SwipeRow";
import { useDailyChecks } from "@/hooks/useDailyChecks";

/* ============================================================
   STAMMDATEN
============================================================ */

// Startdatum des 12-Wochen-Plans → setze auf den Montag deiner Woche 1
const PLAN_START = new Date("2026-06-08T00:00:00");
const TOTAL_WEEKS = 12;

const STATS = [
  { label: "Alter", value: "31" },
  { label: "Größe", value: "178" },
  { label: "Aktuell", value: "92", accent: true, suffix: "kg" },
  { label: "Ziel", value: "82", suffix: "kg" },
];

/* ============================================================
   PHASEN
============================================================ */

type Phase = {
  n: 1 | 2 | 3;
  range: string;
  weeks: [number, number];
  title: string;
  desc: string;
  kcal: number;
  deficit: number;
  proteinG: [number, number];
  fatG: [number, number];
  carbG: number | string;
  stepsTarget: number;
  alcohol: string;
  cardio: string;
  weightTarget: string;
};

const PHASES: Phase[] = [
  {
    n: 1,
    range: "Woche 1–4",
    weeks: [1, 4],
    title: "Fundament",
    desc: "Struktur etablieren · Alkohol unter der Woche raus",
    kcal: 2700,
    deficit: 400,
    proteinG: [180, 200],
    fatG: [70, 80],
    carbG: 300,
    stepsTarget: 10000,
    alcohol: "Unter der Woche 0",
    cardio: "Nur Mittwoch (30 min Joggen)",
    weightTarget: "≈ 90 kg",
  },
  {
    n: 2,
    range: "Woche 5–8",
    weeks: [5, 8],
    title: "Beschleunigen",
    desc: "Defizit etwas größer · zusätzliches Cardio",
    kcal: 2550,
    deficit: 550,
    proteinG: [180, 200],
    fatG: [65, 75],
    carbG: 250,
    stepsTarget: 12000,
    alcohol: "Max. 1 × pro Woche",
    cardio: "+ 15 min nach Krafttraining",
    weightTarget: "88 – 85 kg",
  },
  {
    n: 3,
    range: "Woche 9–12",
    weeks: [9, 12],
    title: "Definition",
    desc: "Carbs abends runter · 2 × Cardio extra",
    kcal: 2450,
    deficit: 650,
    proteinG: [190, 210],
    fatG: [60, 70],
    carbG: "≈ 190 (abends ↓)",
    stepsTarget: 12000,
    alcohol: "Nur besondere Anlässe",
    cardio: "+ 2 × pro Woche extra",
    weightTarget: "84 – 82 kg",
  },
];

function currentWeekIndex(now = new Date()): number {
  const ms = now.getTime() - PLAN_START.getTime();
  const week = Math.floor(ms / (7 * 24 * 3600 * 1000)) + 1;
  return Math.min(TOTAL_WEEKS, Math.max(1, week));
}

function phaseForWeek(week: number): Phase {
  return PHASES.find((p) => week >= p.weeks[0] && week <= p.weeks[1]) ?? PHASES[0];
}

/* ============================================================
   TRAINING
============================================================ */

type WorkoutKey = "push" | "pull" | "cardio" | "legs" | "upper" | "active" | "rest";

type Day = {
  key: WorkoutKey;
  dow: number; // 1=Mo..7=So
  short: string;
  day: string;
  focus: string;
  durationMin: number;
  exercises: { name: string; sets: string }[];
  Icon: typeof Dumbbell;
};

const WEEK: Day[] = [
  {
    key: "push", dow: 1, short: "Mo", day: "Montag", focus: "Push",
    durationMin: 60, Icon: Dumbbell,
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
    key: "pull", dow: 2, short: "Di", day: "Dienstag", focus: "Pull",
    durationMin: 60, Icon: Dumbbell,
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
    key: "cardio", dow: 3, short: "Mi", day: "Mittwoch", focus: "Cardio + Core",
    durationMin: 45, Icon: Heart,
    exercises: [
      { name: "Joggen locker", sets: "30 min" },
      { name: "Plank", sets: "3 × 60 s" },
      { name: "Beinheben", sets: "3 × 15" },
      { name: "Russian Twists", sets: "3 × 20" },
    ],
  },
  {
    key: "legs", dow: 4, short: "Do", day: "Donnerstag", focus: "Beine",
    durationMin: 60, Icon: Dumbbell,
    exercises: [
      { name: "Kniebeugen", sets: "4 × 8" },
      { name: "Beinpresse", sets: "4 × 12" },
      { name: "Rum. Kreuzheben", sets: "4 × 10" },
      { name: "Ausfallschritte", sets: "3 × 12" },
      { name: "Wadenheben", sets: "4 × 20" },
    ],
  },
  {
    key: "upper", dow: 5, short: "Fr", day: "Freitag", focus: "Oberkörper",
    durationMin: 60, Icon: Dumbbell,
    exercises: [
      { name: "Bankdrücken", sets: "3 × 10" },
      { name: "Klimmzüge", sets: "3 × Max" },
      { name: "Rudern", sets: "3 × 10" },
      { name: "Schulterdrücken", sets: "3 × 10" },
      { name: "Bizepscurls", sets: "3 × 12" },
      { name: "Trizepsdrücken", sets: "3 × 12" },
    ],
  },
  {
    key: "active", dow: 6, short: "Sa", day: "Samstag", focus: "Aktiver Tag",
    durationMin: 90, Icon: Footprints,
    exercises: [
      { name: "Rennrad", sets: "60–120 min" },
      { name: "oder Schritte", sets: "12–15k" },
    ],
  },
  {
    key: "rest", dow: 7, short: "So", day: "Sonntag", focus: "Aktive Erholung",
    durationMin: 30, Icon: Bed,
    exercises: [
      { name: "Spaziergang", sets: "—" },
      { name: "Mobility", sets: "—" },
      { name: "Dehnen", sets: "—" },
    ],
  },
];

/* ============================================================
   TAGESROUTINE
============================================================ */

const ROUTINE: {
  time: string;
  title: string;
  desc: string;
  Icon: typeof Sunrise;
}[] = [
  { time: "05:00", title: "Aufstehen", desc: "Licht an · kurz mobilisieren", Icon: Sunrise },
  { time: "05:15", title: "Wasser + Kaffee", desc: "500 ml Wasser · schwarzer Kaffee", Icon: Coffee },
  { time: "05:30", title: "Training", desc: "5–8 min Warm-up · 60 min nach Wochenplan", Icon: Dumbbell },
  { time: "06:45", title: "Frühstück", desc: "4 Eier · 80 g Haferflocken · 250 g Skyr · Beeren", Icon: Apple },
  { time: "12:30", title: "Mittag", desc: "200 g Hähnchen · 150 g Reis · Gemüse", Icon: Apple },
  { time: "15:30", title: "Snack", desc: "250 g Magerquark · 30 g Nüsse", Icon: Coffee },
  { time: "18:30", title: "Abendessen", desc: "200 g Lachs / Rind · Gemüse · Kartoffeln", Icon: Apple },
  { time: "21:00", title: "Abendroutine", desc: "Bildschirme aus · Magnesium · Lesen", Icon: Moon },
  { time: "22:00", title: "Schlafen", desc: "8 Stunden — bei 05:00-Start: 21:00 Lichtaus ist realistischer", Icon: Bed },
];

/* ============================================================
   ERNÄHRUNG
============================================================ */

const MEAL_DAY = [
  {
    label: "Frühstück", time: "06:45",
    items: ["4 Eier", "80 g Haferflocken", "250 g Skyr", "Beeren"],
  },
  {
    label: "Snack", time: "10:30",
    items: ["Whey Shake", "Banane"],
  },
  {
    label: "Mittag", time: "12:30",
    items: ["200 g Hähnchen", "150 g Reis", "Gemüse"],
  },
  {
    label: "Snack", time: "15:30",
    items: ["250 g Magerquark", "30 g Nüsse"],
  },
  {
    label: "Abendessen", time: "18:30",
    items: ["200 g Lachs oder Rind", "Gemüse", "Kartoffeln"],
  },
];

const SHOPPING = [
  { group: "Protein", items: ["Eier", "Hähnchen", "Putenbrust", "Magerquark", "Skyr", "Lachs", "Thunfisch", "Whey"] },
  { group: "Kohlenhydrate", items: ["Reis", "Kartoffeln", "Haferflocken", "Vollkornbrot", "Bananen", "Beeren"] },
  { group: "Gemüse", items: ["Brokkoli", "Paprika", "Gurke", "Karotten", "Blattsalat", "Tomaten"] },
  { group: "Fette", items: ["Nüsse", "Avocados", "Olivenöl"] },
  { group: "Getränke", items: ["Wasser", "Kaffee", "Ungesüßter Tee"] },
];

/* ============================================================
   DAILY CHECKLIST + SUNDAY
============================================================ */

const DAILY_CHECKLIST = [
  { label: "10.000 Schritte", Icon: Footprints },
  { label: "3 Liter Wasser", Icon: Droplets },
  { label: "Training erledigt", Icon: Dumbbell },
  { label: "180 g Protein", Icon: Target },
  { label: "Kein Alkohol", Icon: Wine },
  { label: "8 Stunden Schlaf", Icon: Bed },
  { label: "Ernährung eingehalten", Icon: Apple },
];

const SUNDAY_RITUAL = [
  { label: "Gewicht (morgens, nüchtern)", Icon: Scale },
  { label: "Bauchumfang messen", Icon: Ruler },
  { label: "Frontbild", Icon: Camera },
  { label: "Seitenbild", Icon: Camera },
];

/* ============================================================
   HELPERS
============================================================ */

function dowMondayFirst(d = new Date()): number {
  const js = d.getDay();
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
  weekday: "long", day: "numeric", month: "long",
}).format(new Date());

/* ============================================================
   PAGE
============================================================ */

type Scope = "tag" | "woche" | "monat";

export default function Plan() {
  const [scope, setScope] = useState<Scope>("tag");
  const todayDow = dowMondayFirst();
  const today = useMemo(() => WEEK.find((d) => d.dow === todayDow)!, [todayDow]);
  const week = currentWeekIndex();
  const phase = phaseForWeek(week);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10),transparent_60%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[440px] px-5 pb-24 pt-8">
        {/* Header */}
        <header className="mb-6">
          <p className="label-caps">12-Wochen-Plan · Woche {week}/{TOTAL_WEEKS}</p>
          <h1 className="mt-1 text-[42px] leading-[0.95] tracking-tight">
            Sixpack in
            <br />
            <span className="text-primary gold-text-glow">12 Wochen</span>
          </h1>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {TODAY_LABEL}
          </p>
        </header>

        {/* Phase Banner */}
        <PhaseBanner phase={phase} week={week} />

        {/* Scope-Switch */}
        <nav className="my-6">
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

        {/* Stats */}
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
              <p className={`font-display text-xl leading-none ${s.accent ? "text-primary" : "text-foreground"}`}>
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

        <AnimatePresence mode="wait">
          {scope === "tag" && (
            <motion.div
              key="tag"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-7"
            >
              <TodayHero today={today} phase={phase} />
              <DailyTimeline />
              <DailyChecklist phase={phase} />
              {todayDow === 7 && <SundayRitual />}
            </motion.div>
          )}

          {scope === "woche" && (
            <motion.div
              key="woche"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-7"
            >
              <WeekStrip todayDow={todayDow} />
              <WeekList todayDow={todayDow} />
              <MealDayCard phase={phase} />
              <ShoppingList />
            </motion.div>
          )}

          {scope === "monat" && (
            <motion.div
              key="monat"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-7"
            >
              <PhaseOverview currentWeek={week} />
              <WeeklyTracker currentWeek={week} />
              <ClosingNote />
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-12 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Konstanz schlägt Perfektion
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   PHASE BANNER
============================================================ */

function PhaseBanner({ phase, week }: { phase: Phase; week: number }) {
  const weekInPhase = week - phase.weeks[0] + 1;
  const phaseLen = phase.weeks[1] - phase.weeks[0] + 1;
  const pct = Math.min(1, weekInPhase / phaseLen);
  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] to-transparent p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary">
            Phase {phase.n} · {phase.range}
          </p>
          <p className="mt-0.5 font-display text-xl leading-none">{phase.title}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{phase.desc}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-2xl leading-none text-primary">{phase.kcal}</p>
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">kcal · −{phase.deficit}</p>
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>Woche {weekInPhase} / {phaseLen} in dieser Phase</span>
        <span className="text-primary/80">Ziel {phase.weightTarget}</span>
      </div>
    </div>
  );
}

/* ============================================================
   TAG
============================================================ */

function TodayHero({ today, phase }: { today: Day; phase: Phase }) {
  const m = minutesSinceMidnight();
  const dayPct = Math.min(1, Math.max(0, (m - 5 * 60) / (22 * 60 - 5 * 60)));
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
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Training</p>
              <p className="font-display text-2xl leading-tight">{today.focus}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
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

        {/* Aufwärm-Hinweis */}
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="text-foreground/80">Warm-up:</span> 5–8 min leichtes Cardio + 2 Aufwärmsätze mit 50–60 % bei der ersten Übung. Schultern, Knie, unterer Rücken danken.
          </p>
        </div>

        <div className="mt-4 space-y-0 divide-y divide-white/[0.04]">
          {today.exercises.map((ex) => (
            <div key={ex.name} className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-sm text-foreground/90">{ex.name}</span>
              <span className="font-mono text-xs text-primary">{ex.sets}</span>
            </div>
          ))}
        </div>

        {/* Makro-Footer */}
        <div className="mt-4 grid grid-cols-4 gap-1.5 rounded-xl border border-white/[0.05] bg-black/40 p-2">
          <MiniMacro label="kcal" value={String(phase.kcal)} highlight />
          <MiniMacro label="Protein" value={`${phase.proteinG[0]}–${phase.proteinG[1]} g`} />
          <MiniMacro label="Carbs" value={String(phase.carbG).replace(/\(.*\)/, "").trim() + " g"} />
          <MiniMacro label="Fett" value={`${phase.fatG[0]}–${phase.fatG[1]} g`} />
        </div>
      </div>
    </section>
  );
}

function MiniMacro({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`font-mono text-[11px] leading-tight ${highlight ? "text-primary" : "text-foreground/90"}`}>
        {value}
      </p>
    </div>
  );
}

function DualRing({ dayPct, weekPct }: { dayPct: number; weekPct: number }) {
  const R1 = 40, R2 = 30;
  const C1 = 2 * Math.PI * R1;
  const C2 = 2 * Math.PI * R2;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
        <circle cx="48" cy="48" r={R1} stroke="hsl(var(--primary) / 0.08)" strokeWidth="8" fill="transparent" />
        <motion.circle
          cx="48" cy="48" r={R1}
          stroke="hsl(var(--primary))" strokeWidth="8" fill="transparent" strokeLinecap="round"
          strokeDasharray={C1}
          initial={{ strokeDashoffset: C1 }}
          animate={{ strokeDashoffset: C1 * (1 - dayPct) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.45))" }}
        />
        <circle cx="48" cy="48" r={R2} stroke="hsl(var(--primary) / 0.06)" strokeWidth="8" fill="transparent" />
        <motion.circle
          cx="48" cy="48" r={R2}
          stroke="hsl(var(--primary-glow))" strokeWidth="8" fill="transparent" strokeLinecap="round"
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
              <div className="flex flex-col items-center pt-3">
                <div className={`h-2 w-2 rounded-full ${
                  isActive ? "bg-primary ring-4 ring-primary/20 pulse-gold"
                    : isPast ? "bg-primary/40" : "bg-white/20"
                }`} />
                {!isLast && (
                  <div className={`mt-1 w-px flex-1 ${
                    isPast ? "bg-gradient-to-b from-primary/30 to-white/[0.05]" : "bg-white/[0.05]"
                  }`} />
                )}
              </div>
              <div className={`flex-1 rounded-2xl border p-4 transition-all ${
                isActive ? "border-primary/30 bg-white/[0.06] shadow-[0_4px_24px_rgba(201,168,76,0.08)]"
                  : isPast ? "border-white/[0.04] bg-white/[0.02] opacity-60"
                    : "border-white/[0.05] bg-white/[0.03]"
              }`}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className={`font-mono text-xs font-bold ${
                      isActive ? "text-primary" : isPast ? "text-muted-foreground" : "text-foreground/70"
                    }`}>
                      {r.time}
                    </p>
                    <Icon className={`h-3 w-3 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <p className={`text-[10px] uppercase tracking-[0.18em] ${
                    isActive ? "font-bold text-primary" : "text-muted-foreground"
                  }`}>
                    {isActive ? "Jetzt" : r.title}
                  </p>
                </div>
                <p className="text-sm font-medium leading-snug">
                  {isActive ? r.title : r.desc}
                </p>
                {isActive && (
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{r.desc}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DailyChecklist({ phase }: { phase: Phase }) {
  // Read-only Anzeige; Schritte/Alkohol passen sich der Phase an
  const items = [
    { label: `${phase.stepsTarget.toLocaleString("de-DE")} Schritte`, Icon: Footprints },
    { label: "3 Liter Wasser", Icon: Droplets },
    { label: "Training erledigt", Icon: Dumbbell },
    { label: `${phase.proteinG[0]} g Protein`, Icon: Target },
    { label: phase.alcohol, Icon: Wine },
    { label: "8 Stunden Schlaf", Icon: Bed },
    { label: "Ernährung eingehalten", Icon: Apple },
  ];
  return (
    <section>
      <SectionHead title="Checkliste" caption="Heute" />
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-2">
        {items.map((h, i) => {
          const Icon = h.Icon;
          return (
            <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/[0.02]">
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="flex-1 text-sm">{h.label}</span>
              <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SundayRitual() {
  return (
    <section>
      <SectionHead title="Sonntags-Ritual" caption="Wochen-Check" />
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
        <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
          Nicht täglich wiegen. Schwankungen von ±1–2 kg sind normal — beurteile den Wochendurchschnitt.
        </p>
        <div className="space-y-1.5">
          {SUNDAY_RITUAL.map((s) => {
            const Icon = s.Icon;
            return (
              <div key={s.label} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="flex-1 text-sm">{s.label}</span>
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   WOCHE
============================================================ */

function WeekStrip({ todayDow }: { todayDow: number }) {
  return (
    <section>
      <SectionHead title="Wochenplan" caption="5 + 1 + 1 Split" />
      <div className="grid grid-cols-7 gap-1.5">
        {WEEK.map((d) => {
          const isToday = d.dow === todayDow;
          return (
            <div key={d.dow} className={`flex flex-col items-center gap-1 rounded-xl border py-2 ${
              isToday ? "border-primary/40 bg-primary/10" : "border-white/[0.05] bg-white/[0.02]"
            }`}>
              <span className={`text-[9px] uppercase tracking-wider ${
                isToday ? "text-primary" : "text-muted-foreground"
              }`}>{d.short}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${
                d.key === "rest" ? "bg-white/15"
                  : isToday ? "bg-primary pulse-gold" : "bg-primary/40"
              }`} />
            </div>
          );
        })}
      </div>
    </section>
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
          <div key={d.dow} className={`overflow-hidden rounded-2xl border transition-colors ${
            isToday ? "border-primary/30 bg-white/[0.04]" : "border-white/[0.05] bg-white/[0.02]"
          }`}>
            <button type="button" onClick={() => setOpen(isOpen ? 0 : d.dow)}
              className="flex w-full items-center gap-3 p-4 text-left">
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
                isToday ? "border-primary/40 bg-primary/15 text-primary"
                  : "border-white/[0.06] bg-white/[0.03] text-muted-foreground"
              }`}>
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
                <p className="mt-1 text-xs text-muted-foreground">{d.focus} · {d.durationMin} min</p>
              </div>
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                isOpen ? "rotate-180" : ""
              }`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                >
                  <div className="space-y-0 divide-y divide-white/[0.04] border-t border-white/[0.05] px-4 pb-3">
                    {d.exercises.map((ex) => (
                      <div key={ex.name} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                        <span>{ex.name}</span>
                        <span className="font-mono text-xs text-primary">{ex.sets}</span>
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

function MealDayCard({ phase }: { phase: Phase }) {
  return (
    <section>
      <SectionHead title="Ernährungstag" caption="≈ Phase 1 Standard" />
      <div className="space-y-2">
        {MEAL_DAY.map((m) => (
          <div key={m.label} className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="font-display text-base">{m.label}</p>
              <p className="font-mono text-[10px] text-primary">{m.time}</p>
            </div>
            <ul className="space-y-1">
              {m.items.map((it) => (
                <li key={it} className="flex items-start gap-2 text-xs text-foreground/80">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="flex items-start gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Phase {phase.n}: <span className="text-primary">{phase.kcal} kcal</span> · {phase.proteinG[0]}–{phase.proteinG[1]} g Protein.
            Reduziert wird primär über Reis, Kartoffeln und Nüsse — nicht über Protein.
          </p>
        </div>
      </div>
    </section>
  );
}

function ShoppingList() {
  return (
    <section>
      <SectionHead title="Einkaufsliste" caption="Wochenbasis" />
      <div className="space-y-2">
        {SHOPPING.map((s) => (
          <div key={s.group} className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShoppingBasket className="h-3.5 w-3.5 text-primary" />
              <p className="font-display text-sm uppercase tracking-wider">{s.group}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {s.items.map((it) => (
                <span key={it} className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] text-foreground/80">
                  {it}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   MONAT
============================================================ */

function PhaseOverview({ currentWeek }: { currentWeek: number }) {
  return (
    <section>
      <SectionHead title="3 Phasen" caption="12 Wochen" />
      <div className="space-y-3">
        {PHASES.map((p) => {
          const isCurrent = currentWeek >= p.weeks[0] && currentWeek <= p.weeks[1];
          const isDone = currentWeek > p.weeks[1];
          const pct = isDone ? 1 : isCurrent ? (currentWeek - p.weeks[0] + 1) / (p.weeks[1] - p.weeks[0] + 1) : 0;
          return (
            <div key={p.n} className={`rounded-2xl border p-4 ${
              isCurrent ? "border-primary/30 bg-white/[0.05] shadow-[0_4px_24px_rgba(201,168,76,0.05)]"
                : "border-white/[0.05] bg-white/[0.02]"
            }`}>
              <div className="flex items-center gap-4">
                <PhaseRing pct={pct} active={isCurrent} done={isDone} n={p.n} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-[10px] uppercase tracking-[0.2em] ${
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    }`}>{p.range}</p>
                    {isCurrent && (
                      <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                        Jetzt
                      </span>
                    )}
                  </div>
                  <p className="font-display text-lg leading-tight">{p.title}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{p.desc}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-1.5 rounded-xl border border-white/[0.05] bg-black/30 p-2">
                <MiniMacro label="kcal" value={String(p.kcal)} highlight={isCurrent} />
                <MiniMacro label="Protein" value={`${p.proteinG[0]}–${p.proteinG[1]} g`} />
                <MiniMacro label="Carbs" value={typeof p.carbG === "number" ? `${p.carbG} g` : p.carbG} />
                <MiniMacro label="Fett" value={`${p.fatG[0]}–${p.fatG[1]} g`} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
                <Pill label="Schritte" value={`${p.stepsTarget.toLocaleString("de-DE")}/Tag`} />
                <Pill label="Alkohol" value={p.alcohol} />
                <Pill label="Cardio" value={p.cardio} />
                <Pill label="Ziel" value={p.weightTarget} highlight />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Pill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border px-2.5 py-1.5 ${
      highlight ? "border-primary/20 bg-primary/[0.06]" : "border-white/[0.05] bg-white/[0.02]"
    }`}>
      <p className="text-[8px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-[11px] leading-tight ${highlight ? "text-primary" : "text-foreground/90"}`}>
        {value}
      </p>
    </div>
  );
}

function PhaseRing({ pct, active, done, n }: { pct: number; active: boolean; done: boolean; n: number }) {
  const R = 24;
  const C = 2 * Math.PI * R;
  const color = done ? "hsl(var(--primary) / 0.6)" : active ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.25)";
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
        <circle cx="28" cy="28" r={R} stroke="hsl(var(--primary) / 0.1)" strokeWidth="4" fill="transparent" />
        <motion.circle
          cx="28" cy="28" r={R}
          stroke={color} strokeWidth="4" fill="transparent" strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - pct) }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={active ? { filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.5))" } : undefined}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-primary/70" />
        ) : (
          <span className={`font-display text-lg ${active ? "text-primary" : "text-muted-foreground"}`}>
            {n}
          </span>
        )}
      </div>
    </div>
  );
}

function WeeklyTracker({ currentWeek }: { currentWeek: number }) {
  return (
    <section>
      <SectionHead title="12-Wochen-Tracker" caption={`Woche ${currentWeek} von ${TOTAL_WEEKS}`} />
      <div className="overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02]">
        {/* Header */}
        <div className="grid grid-cols-12 gap-px border-b border-white/[0.05] bg-black/30 px-3 py-2 text-[9px] uppercase tracking-wider text-muted-foreground">
          <span className="col-span-2">Wo</span>
          <span className="col-span-3">Gewicht</span>
          <span className="col-span-2">Bauch</span>
          <span className="col-span-2 text-center">Train</span>
          <span className="col-span-2 text-center">Schritte</span>
          <span className="col-span-1 text-center">Foto</span>
        </div>
        {Array.from({ length: TOTAL_WEEKS }).map((_, i) => {
          const w = i + 1;
          const phase = phaseForWeek(w);
          const isNow = w === currentWeek;
          const isPast = w < currentWeek;
          return (
            <div key={w} className={`grid grid-cols-12 items-center gap-px px-3 py-2.5 text-[11px] ${
              isNow ? "bg-primary/[0.08] border-l-2 border-primary"
                : isPast ? "opacity-50" : ""
            } ${w < TOTAL_WEEKS ? "border-b border-white/[0.03]" : ""}`}>
              <div className="col-span-2 flex items-center gap-1.5">
                <span className={`font-mono ${isNow ? "text-primary font-bold" : "text-foreground/80"}`}>
                  {String(w).padStart(2, "0")}
                </span>
                <span className="rounded bg-white/[0.05] px-1 py-0.5 text-[8px] text-muted-foreground">P{phase.n}</span>
              </div>
              <span className="col-span-3 font-mono text-muted-foreground">—</span>
              <span className="col-span-2 font-mono text-muted-foreground">—</span>
              <span className="col-span-2 text-center font-mono text-muted-foreground">0/5</span>
              <span className="col-span-2 text-center font-mono text-muted-foreground">
                {(phase.stepsTarget / 1000)}k
              </span>
              <span className="col-span-1 text-center">
                <Circle className="mx-auto h-3 w-3 text-muted-foreground/40" />
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
        Sonntags ausfüllen · nicht täglich wiegen
      </p>
    </section>
  );
}

function ClosingNote() {
  return (
    <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.05] to-transparent p-5">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="font-display text-lg leading-none">80 %-Regel</p>
      </div>
      <p className="text-[12px] leading-relaxed text-muted-foreground">
        Wenn du 80 % dieser Punkte über 12 Wochen einhältst, wirst du deutlich schlanker und näher an einem sichtbaren Sixpack sein. Ein verpasster Tag ist kein gescheiterter Plan.
      </p>
    </div>
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
