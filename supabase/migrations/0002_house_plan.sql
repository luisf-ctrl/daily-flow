-- Daily Flow — House Purchase Plan (Phase 1)
-- Eine Row pro User mit allen Inputs für die Hauskauf-Berechnung.

create table if not exists public.house_purchase_plan (
  user_id                    uuid primary key references public.profiles(id) on delete cascade,
  target_purchase_price      numeric not null default 800000,
  region_code                text    not null default 'BW',     -- BW, BY, BE, BB, HB, HH, HE, MV, NI, NW, RP, SL, SN, ST, SH, TH
  target_purchase_date       date,                              -- Ziel-Kauftermin
  monthly_net_income_self    numeric default 3800,
  monthly_net_income_partner numeric default 3300,
  monthly_business_profit    numeric default 500,
  business_kleinunternehmer  boolean default true,
  monthly_fixed_costs        numeric default 4000,              -- Miete + Lebenshaltung
  parental_leave_months      int     default 12,
  parental_leave_income      numeric default 1800,
  planned_own_use            boolean default true,
  existing_equity            numeric default 0,
  existing_debts             numeric default 0,
  notes                      text,
  created_at                 timestamptz default now(),
  updated_at                 timestamptz default now()
);

alter table public.house_purchase_plan enable row level security;

create policy "house_purchase_plan_owner" on public.house_purchase_plan
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists house_purchase_plan_touch_updated_at on public.house_purchase_plan;
create trigger house_purchase_plan_touch_updated_at
  before update on public.house_purchase_plan
  for each row execute function public.touch_updated_at();
