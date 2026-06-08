import { useMemo, useState } from "react";
import {
  Dumbbell,
  Flame,
  Bed,
  Apple,
  Droplets,
  Footprints,
  Moon,
  Wine,
  Target,
  Sun,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";

/* ---------- Daten ---------- */

const STATS = [
  { label: "Alter", value: "31" },
  { label: "Größe", value: "178 cm" },
  { label: "Aktuell", value: "92 kg" },
  { label: "Ziel", value: "78–84 kg" },
];

const TIMELINE = [
  { phase: "Monat 1–2", text: "Gewohnheiten etablieren · 4–6 kg Fettverlust" },
  { phase: "Monat 3–4", text: "Deutliche Definition sichtbar" },
  { phase: "Monat 5–6", text: "Sixpack-Bereich wird sichtbar" },
];

type DayPlan = {
  key: string;
  day: string;
  short: string;
  focus: string;
  color: string;
  exercises: { name: string; sets: string }[];
};

const WEEK: DayPlan[] = [
  {
    key: "mo",
    day: "Montag",
    short: "Mo",
    focus: "Push",
    color: "text-primary border-primary/30 bg-primary/10",
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
    key: "di",
    day: "Dienstag",
    short: "Di",
    focus: "Pull",
    color: "text-success border-success/30 bg-success/10",
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
    key: "mi",
    day: "Mittwoch",
    short: "Mi",
    focus: "Cardio + Core",
    color: "text-destructive border-destructive/30 bg-destructive/10",
    exercises: [
      { name: "Joggen locker", sets: "30 min" },
      { name: "Plank", sets: "3 × 60 s" },
      { name: "Beinheben", sets: "3 × 15" },
      { name: "Russian Twists", sets: "3 × 20" },
    ],
  },
  {
    key: "do",
    day: "Donnerstag",
    short: "Do",
    focus: "Beine",
    color: "text-warning border-warning/30 bg-warning/10",
    exercises: [
      { name: "Kniebeugen", sets: "4 × 8" },
      { name: "Beinpresse", sets: "4 × 12" },
      { name: "Rumänisches Kreuzheben", sets: "4 × 10" },
      { name: "Ausfallschritte", sets: "3 × 12" },
      { name: "Wadenheben", sets: "4 × 20" },
    ],
  },
  {
    key: "fr",
    day: "Freitag",
    short: "Fr",
    focus: "Oberkörper komplett",
    color: "text-primary border-primary/30 bg-primary/10",
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
    key: "sa",
    day: "Samstag",
    short: "Sa",
    focus: "Aktiver Tag",
    color: "text-muted-foreground border-white/10 bg-white/[0.03]",
    exercises: [
      { name: "Rennrad", sets: "60–120 min" },
      { name: "oder Schritte", sets: "10–15k" },
    ],
  },
  {
    key: "so",
    day: "Sonntag",
    short: "So",
    focus: "Regeneration",
    color: "text-muted-foreground border-white/10 bg-white/[0.03]",
    exercises: [
      { name: "Spaziergang", sets: "—" },
      { name: "Mobility", sets: "—" },
      { name: "Dehnen", sets: "—" },
    ],
  },
];

const ROUTINE = [
  { time: "05:00", title: "Aufstehen", desc: "500 ml Wasser · 5 min Mobility · Kaffee", icon: Sun },
  { time: "05:30", title: "Training", desc: "60 min nach Wochenplan", icon: Dumbbell },
  { time: "06:30", title: "Frühstück", desc: "4 Eier · 80 g Haferflocken · 250 g Skyr · Beeren · ≈700 kcal", icon: Apple },
  { time: "10:30", title: "Snack", desc: "Proteinshake · Banane", icon: Apple },
  { time: "12:30", title: "Mittag", desc: "200 g Hähnchen · 150 g Reis · viel Gemüse", icon: Apple },
  { time: "15:30", title: "Snack", desc: "250 g Magerquark · Handvoll Nüsse", icon: Apple },
  { time: "18:30", title: "Abendessen", desc: "200 g Lachs / Rind · Gemüse · Kartoffeln oder Reis", icon: Apple },
  { time: "21:30", title: "Abendroutine", desc: "Handy weg · Magnesium · Lesen", icon: Moon },
  { time: "22:00", title: "Schlafen", desc: "8 Stunden", icon: Bed },
];

const NUTRITION = [
  { label: "Protein 180–200 g", items: "Hähnchen, Pute, Eier, Skyr, Magerquark, Lachs, Thunfisch, Whey" },
  { label: "Kohlenhydrate", items: "Reis, Kartoffeln, Haferflocken, Vollkorn, Obst" },
  { label: "Fette", items: "Nüsse, Avocado, Olivenöl, Fisch" },
];

const ALCOHOL = [
  { week: "Woche 1–2", rule: "max. 2 Abende" },
  { week: "Woche 3–4", rule: "max. 1 Abend" },
  { week: "Ab Woche 5", rule: "nur besondere Anlässe" },
];

const DAILY_HABITS = [
  { label: "10.000 Schritte", icon: Footprints },
  { label: "3 Liter Wasser", icon: Droplets },
  { label: "180 g Protein", icon: Target },
  { label: "8 Stunden Schlaf", icon: Bed },
  { label: "1 Stunde Training", icon: Dumbbell },
  { label: "Kein Alkohol unter der Woche", icon: Wine },
  { label: "Sonntag Gewicht messen", icon: Flame },
];

/* ---------- Helpers ---------- */

function todayKey(): string {
  // 0 = Sonntag in JS
  const map = ["so", "mo", "di", "mi", "do", "fr", "sa"];
  return map[new Date().getDay()];
}

/* ---------- Page ---------- */

export default function Plan() {
  const today = todayKey();
  const [openDay, setOpenDay] = useState<string>(today);

  const todayPlan = useMemo(() => WEEK.find((d) => d.key === today)!, [today]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6 sm:pt-10">
        {/* Header */}
        <header className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            Dein Plan
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Sixpack in 4–6 Monaten
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Struktur schlägt Training. Alkohol runter, Eiweiß rauf, jeden Tag
            bewegen — der Rest folgt.
          </p>
        </header>

        {/* Stats */}
        <section className="mb-8 grid grid-cols-4 gap-2">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/[0.06] bg-card p-3 text-center"
            >
              <div className="font-mono text-base font-semibold sm:text-lg">
                {s.value}
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </section>

        {/* Heute */}
        <Section title="Heute" caption={todayPlan.day}>
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-primary/80">
                  Training heute
                </p>
                <h2 className="text-xl font-semibold tracking-tight">
                  {todayPlan.focus}
                </h2>
                <ul className="mt-3 space-y-1.5">
                  {todayPlan.exercises.map((ex) => (
                    <li
                      key={ex.name}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span>{ex.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {ex.sets}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* Tages-Routine */}
        <Section title="Tages-Routine" caption="Mo – Fr">
          <ol className="relative space-y-3 border-l border-white/[0.08] pl-5">
            {ROUTINE.map((r) => {
              const Icon = r.icon;
              return (
                <li key={r.time} className="relative">
                  <span className="absolute -left-[27px] top-1 grid h-5 w-5 place-items-center rounded-full border border-white/[0.1] bg-card">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-primary">
                      {r.time}
                    </span>
                    <span className="text-sm font-medium">{r.title}</span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {r.desc}
                  </p>
                </li>
              );
            })}
          </ol>
        </Section>

        {/* Wochenplan */}
        <Section title="Wochenplan" caption="Tippe für Details">
          <div className="space-y-2">
            {WEEK.map((d) => {
              const isOpen = openDay === d.key;
              const isToday = d.key === today;
              return (
                <div
                  key={d.key}
                  className={`overflow-hidden rounded-2xl border bg-card transition-colors ${
                    isToday
                      ? "border-primary/40"
                      : "border-white/[0.06]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenDay(isOpen ? "" : d.key)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border text-xs font-semibold uppercase ${d.color}`}
                    >
                      {d.short}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {d.day}
                        {isToday && (
                          <span className="ml-2 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                            Heute
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{d.focus}</p>
                    </div>
                    <Clock
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <ul className="space-y-1.5 border-t border-white/[0.06] px-4 py-3">
                      {d.exercises.map((ex) => (
                        <li
                          key={ex.name}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span>{ex.name}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {ex.sets}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Ernährung */}
        <Section title="Ernährung" caption="Ohne Kalorien zählen">
          <div className="space-y-2">
            {NUTRITION.map((n) => (
              <div
                key={n.label}
                className="rounded-2xl border border-white/[0.06] bg-card p-4"
              >
                <p className="text-sm font-semibold">{n.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {n.items}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Alkohol */}
        <Section title="Alkohol" caption="Größter Hebel">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.05] p-4">
            <p className="text-sm leading-relaxed">
              Aktuell dein größter Fortschritts-Killer. Allein durch Reduktion
              vermutlich <strong>2–4 kg</strong> weniger.
            </p>
            <div className="mt-3 space-y-2">
              {ALCOHOL.map((a) => (
                <div
                  key={a.week}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-card px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{a.week}</span>
                  <span className="font-medium">{a.rule}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Tägliche Habits */}
        <Section title="Täglich" caption="Nicht verhandelbar">
          <ul className="space-y-1.5">
            {DAILY_HABITS.map((h) => {
              const Icon = h.icon;
              return (
                <li
                  key={h.label}
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-card px-4 py-3"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="flex-1 text-sm">{h.label}</span>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success/40" />
                </li>
              );
            })}
          </ul>
        </Section>

        {/* Timeline */}
        <Section title="Zeitplan" caption="6 Monate">
          <ol className="space-y-2">
            {TIMELINE.map((t, i) => (
              <li
                key={t.phase}
                className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-card p-4"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.phase}</p>
                  <p className="text-xs text-muted-foreground">{t.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <p className="mt-10 text-center text-[11px] text-muted-foreground">
          Konsequenz schlägt Perfektion.
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {caption && (
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {caption}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}
