-- KAI — PostgreSQL schema (mirrors code/types.ts)
-- Money is stored as BIGINT paise. Every user-owned row has user_id; enable row-level security per user.

create extension if not exists "pgcrypto";

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text unique,
  email text unique,
  currency text not null default 'INR',
  language text not null default 'en',
  persona text[] default '{}',
  safety_buffer bigint not null default 4000000,          -- ₹40,000
  plan text not null default 'free' check (plan in ('free','pro')),
  pro_renews_at timestamptz,
  created_at timestamptz not null default now()
);

create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  space text not null default 'personal',
  name text not null,
  kind text not null check (kind in ('savings','current','cash','wallet','other')),
  institution text, last4 text, currency text not null default 'INR',
  opening_balance bigint not null default 0,
  balance bigint not null default 0,
  is_primary boolean not null default false,
  archived boolean not null default false,
  sort_order int not null default 0,
  source text not null default 'manual',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  space text not null default 'personal',
  name text not null, issuer text not null, last4 text not null,
  credit_limit bigint not null, outstanding bigint not null default 0,
  statement_day int not null check (statement_day between 1 and 31),
  due_day int not null check (due_day between 1 and 31),
  last_statement_date date, last_statement_total bigint, last_statement_minimum bigint, last_statement_paid bigint default 0,
  autopay boolean not null default false, archived boolean not null default false,
  source text not null default 'manual',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  space text not null default 'personal',
  kind text not null, lender text not null,
  principal bigint not null, annual_rate_pct numeric(5,2) not null, tenure_months int not null,
  emi bigint not null, emi_day int not null, start_date date not null,
  outstanding bigint not null, paid_count int not null default 0,
  pay_from_account_id uuid references accounts(id),
  status text not null default 'active', source text not null default 'manual',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table emis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  space text not null default 'personal',
  title text not null, monthly bigint not null, count int not null, paid_count int not null default 0,
  due_day int not null, interest bigint not null default 0,
  charged_to_type text not null check (charged_to_type in ('card','account')), charged_to_id uuid not null,
  start_date date not null, status text not null default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  space text not null default 'personal',
  kind text not null, name text not null,
  invested bigint not null default 0, current_value bigint not null default 0, units numeric(18,4),
  value_updated_at timestamptz, value_source text not null default 'manual',
  maturity_date date, rate_pct numeric(5,2),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table sips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  space text not null default 'personal',
  investment_id uuid not null references investments(id) on delete cascade,
  amount bigint not null, frequency text not null default 'monthly', day int not null,
  from_account_id uuid not null references accounts(id), start_date date not null,
  status text not null default 'active' check (status in ('active','paused','stopped')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table insurance_policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  space text not null default 'personal',
  kind text not null, provider text not null, policy_name text not null, policy_number text,
  cover bigint not null, premium bigint not null, premium_frequency text not null default 'yearly',
  renewal_date date not null, insured text[] default '{}', nominee text,
  remind_days_before int not null default 30,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  space text not null default 'personal',
  kind text not null, name text not null, usual_amount bigint not null, variable boolean not null default false,
  due_day int not null, frequency text not null default 'monthly',
  pay_from_account_id uuid references accounts(id), remind_days_before int not null default 2,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  space text not null default 'personal',
  name text not null, category text not null default 'other', amount bigint not null,
  cycle text not null default 'monthly', next_billing_date date not null,
  payment_type text not null, payment_id uuid not null,
  status text not null default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  space text not null default 'personal',
  name text not null, icon text not null default 'goals',
  target bigint not null, saved bigint not null default 0, deadline date, monthly_target bigint,
  linked_account_id uuid references accounts(id),
  status text not null default 'active', completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references goals(id) on delete cascade,
  amount bigint not null, note text, happened_at timestamptz not null, created_at timestamptz not null default now()
);

create table people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null, phone text
);

create table debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  direction text not null check (direction in ('owed_to_me','i_owe')),
  amount bigint not null, settled bigint not null default 0, reason text, date date not null,
  status text not null default 'open', remind_on date, source text not null default 'manual',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table other_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  space text not null default 'personal',
  name text not null, kind text not null, value bigint not null, value_updated_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null, category text not null, mime_type text not null, size_bytes bigint not null,
  storage_key text not null,                         -- encrypted object storage key
  linked_type text, linked_id uuid, valid_until date,
  created_at timestamptz not null default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  space text not null default 'personal',
  type text not null check (type in ('expense','income','transfer','card_payment','investment','emi_payment','loan_payment','insurance_premium','subscription_payment','bill_payment','debt_settlement')),
  amount bigint not null check (amount > 0), currency text not null default 'INR',
  category text, description text, merchant text,
  happened_at timestamptz not null,                  -- when the money moved
  recorded_at timestamptz not null default now(),    -- when the entry was made (never merged with happened_at)
  from_type text, from_id uuid,                      -- account / credit_card
  to_type text, to_id uuid,                          -- account / credit_card / investment
  tags text[] not null default '{}', notes text,
  source text not null default 'manual', voice_transcript text,
  linked_type text, linked_id uuid, recurrence_id uuid, undo_until timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create index on transactions (user_id, happened_at desc) where deleted_at is null;
create index on transactions (user_id, category) where deleted_at is null;

create table schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  object_type text not null, object_id uuid not null,
  freq text not null, day int, month int, amount bigint not null, tx_type text not null,
  remind_days_before int not null default 2, active boolean not null default true
);

create table upcoming_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  schedule_id uuid references schedules(id) on delete set null,
  object_type text not null, object_id uuid not null,
  title text not null, due_date date not null, amount bigint not null,
  direction text not null default 'out', status text not null default 'upcoming',
  transaction_id uuid references transactions(id)
);
create index on upcoming_events (user_id, due_date) where status = 'upcoming';

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  kind text not null, title text not null, body text not null, deep_link text not null,
  actions jsonb default '[]', created_at timestamptz not null default now(), read_at timestamptz
);

create table insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  kind text not null, headline text not null, detail text not null,
  basis text not null check (basis in ('data','calculation','suggestion')),
  cta_label text, deep_link text, created_at timestamptz not null default now(), dismissed_at timestamptz, useful boolean
);

-- Spending view: never includes transfers, card payments, investments or debt settlements.
create view spending as
  select * from transactions
  where deleted_at is null and type in ('expense','emi_payment','loan_payment','insurance_premium','subscription_payment','bill_payment');
