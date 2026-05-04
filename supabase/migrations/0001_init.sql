-- Daily Flow — initial schema
-- Single-User-App. RLS so eingestellt, dass jeder User nur seine eigenen Rows sieht.

create extension if not exists "pgcrypto";

-- =============================================================================
-- profiles — 1:1 mit auth.users
-- =============================================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  display_name text,
  timezone     text default 'Europe/Berlin',
  theme        text default 'dark',
  created_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id);

-- Auto-Anlage bei neuem Auth-User
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name',
                           split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- habits & logs
-- =============================================================================
create table if not exists public.habits (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  name           text not null,
  icon           text,
  target_value   numeric,
  unit           text,
  frequency      text default 'daily',         -- 'daily' | 'weekly_3' | 'weekly_5' ...
  streak_current int  default 0,
  streak_best    int  default 0,
  archived       boolean default false,
  sort_order     int  default 0,
  created_at     timestamptz default now()
);

create table if not exists public.habit_logs (
  id         uuid primary key default gen_random_uuid(),
  habit_id   uuid not null references public.habits(id) on delete cascade,
  log_date   date not null,
  value      numeric,
  done       boolean default true,
  note       text,
  created_at timestamptz default now(),
  unique (habit_id, log_date)
);

create index if not exists idx_habit_logs_date on public.habit_logs(log_date);

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

create policy "habits_owner" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "habit_logs_owner" on public.habit_logs
  for all using (
    exists (select 1 from public.habits h
            where h.id = habit_logs.habit_id and h.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.habits h
            where h.id = habit_logs.habit_id and h.user_id = auth.uid())
  );

-- =============================================================================
-- daily reflections
-- =============================================================================
create table if not exists public.daily_reflections (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  date            date not null,
  what_went_well  text,
  what_went_bad   text,
  learnings       text,
  plan_tomorrow   text,
  mood_score      int,
  created_at      timestamptz default now(),
  unique (user_id, date)
);

alter table public.daily_reflections enable row level security;
create policy "daily_reflections_owner" on public.daily_reflections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =============================================================================
-- finance
-- =============================================================================
create table if not exists public.transactions (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references public.profiles(id) on delete cascade,
  date     date not null,
  amount   numeric not null,
  type     text not null,              -- 'income' | 'expense' | 'saving'
  category text,
  note     text,
  created_at timestamptz default now()
);

create index if not exists idx_transactions_date on public.transactions(date);

create table if not exists public.financial_goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  name           text,
  target_amount  numeric,
  current_amount numeric default 0,
  deadline       date,
  created_at     timestamptz default now()
);

alter table public.transactions enable row level security;
alter table public.financial_goals enable row level security;
create policy "transactions_owner" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "financial_goals_owner" on public.financial_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =============================================================================
-- body — workouts, sets, nutrition, vitals
-- =============================================================================
create table if not exists public.workouts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  date            date not null,
  type            text,                          -- 'push' | 'pull' | 'legs' | 'cardio' | 'rest' | 'custom'
  duration_min    int,
  total_volume_kg numeric,
  note            text,
  created_at      timestamptz default now()
);

create table if not exists public.exercise_sets (
  id            uuid primary key default gen_random_uuid(),
  workout_id    uuid not null references public.workouts(id) on delete cascade,
  exercise_name text not null,
  weight_kg     numeric,
  reps          int,
  set_number    int,
  rpe           numeric,
  created_at    timestamptz default now()
);

create table if not exists public.nutrition_logs (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles(id) on delete cascade,
  date      date not null,
  kcal      int,
  protein_g int,
  water_l   numeric,
  note      text,
  created_at timestamptz default now(),
  unique (user_id, date)
);

create table if not exists public.vitals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  date       date not null,
  sleep_h    numeric,
  rhr        int,
  hrv        int,
  weight_kg  numeric,
  created_at timestamptz default now(),
  unique (user_id, date)
);

alter table public.workouts enable row level security;
alter table public.exercise_sets enable row level security;
alter table public.nutrition_logs enable row level security;
alter table public.vitals enable row level security;

create policy "workouts_owner" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exercise_sets_owner" on public.exercise_sets
  for all using (
    exists (select 1 from public.workouts w
            where w.id = exercise_sets.workout_id and w.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.workouts w
            where w.id = exercise_sets.workout_id and w.user_id = auth.uid())
  );
create policy "nutrition_logs_owner" on public.nutrition_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "vitals_owner" on public.vitals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =============================================================================
-- notes / books / ideas
-- =============================================================================
create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text default 'quick',                -- 'quick' | 'longform'
  title      text,
  body_md    text,
  tags       text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.books (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  title          text not null,
  author         text,
  status         text default 'reading',           -- 'reading' | 'finished' | 'wishlist'
  started_at     date,
  finished_at    date,
  rating         int,
  highlights_md  text,
  created_at     timestamptz default now()
);

create table if not exists public.ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  description text,
  status      text default 'idea',                  -- 'idea' | 'validating' | 'building' | 'shipped' | 'killed'
  created_at  timestamptz default now()
);

alter table public.notes  enable row level security;
alter table public.books  enable row level security;
alter table public.ideas  enable row level security;

create policy "notes_owner" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "books_owner" on public.books
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ideas_owner" on public.ideas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- updated_at-Trigger für notes
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_touch_updated_at on public.notes;
create trigger notes_touch_updated_at
  before update on public.notes
  for each row execute function public.touch_updated_at();
