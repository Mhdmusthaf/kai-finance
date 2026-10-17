/*
# Expand KAI schema: goals, financial objects, notifications, insights

1. Plain-English summary
   Adds the remaining tables KAI needs to be production-complete:
   goals, loans, investments, SIPs, insurance policies, recurring bills,
   subscriptions, debts (money between people), notifications, and insights.
   Also adds a `goals` table and `settings` (user preferences).

2. New Tables
- `goals` — savings goals (name, icon, target, saved, deadline, status)
- `loans` — loans (kind, lender, principal, rate, tenure, EMI, outstanding, status)
- `investments` — investments (kind, name, invested, current value, maturity)
- `sips` — SIPs linked to investments (amount, frequency, day, status)
- `insurance_policies` — insurance (kind, provider, cover, premium, renewal)
- `recurring_bills` — recurring bills (kind, name, usual amount, due day, frequency)
- `subscriptions` — subscriptions (name, category, amount, cycle, next billing, status)
- `debts` — money owed between people (person, direction, amount, settled, status)
- `notifications` — notification center (kind, title, body, deep link, read status)
- `insights` — AI insights feed (kind, headline, detail, basis, dismissed)
- `settings` — single-row user preferences (currency, language, safety buffer, theme, pin)

3. Security
- RLS enabled on all new tables.
- All policies allow anon + authenticated CRUD (single-tenant, no sign-in).

4. Notes
- Money stored as integer paise (bigint).
- IDs are client-generated text.
- `settings` is a single-row table enforced by a check constraint.
*/

CREATE TABLE IF NOT EXISTS goals (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'goals',
  target bigint NOT NULL DEFAULT 0,
  saved bigint NOT NULL DEFAULT 0,
  deadline text,
  monthly_target bigint,
  linked_account_id text,
  status text NOT NULL DEFAULT 'active',
  completed_at text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loans (
  id text PRIMARY KEY,
  kind text NOT NULL DEFAULT 'personal',
  lender text NOT NULL DEFAULT '',
  principal bigint NOT NULL DEFAULT 0,
  annual_rate_pct numeric NOT NULL DEFAULT 0,
  tenure_months integer NOT NULL DEFAULT 0,
  emi bigint NOT NULL DEFAULT 0,
  emi_day integer NOT NULL DEFAULT 5,
  start_date text NOT NULL DEFAULT '',
  outstanding bigint NOT NULL DEFAULT 0,
  paid_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investments (
  id text PRIMARY KEY,
  kind text NOT NULL DEFAULT 'mutual_fund',
  name text NOT NULL,
  invested bigint NOT NULL DEFAULT 0,
  current_value bigint NOT NULL DEFAULT 0,
  units numeric,
  maturity_date text,
  rate_pct numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sips (
  id text PRIMARY KEY,
  investment_id text NOT NULL,
  amount bigint NOT NULL DEFAULT 0,
  frequency text NOT NULL DEFAULT 'monthly',
  day integer NOT NULL DEFAULT 1,
  from_account_id text,
  start_date text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_policies (
  id text PRIMARY KEY,
  kind text NOT NULL DEFAULT 'health',
  provider text NOT NULL DEFAULT '',
  policy_name text NOT NULL DEFAULT '',
  policy_number text NOT NULL DEFAULT '',
  cover bigint NOT NULL DEFAULT 0,
  premium bigint NOT NULL DEFAULT 0,
  premium_frequency text NOT NULL DEFAULT 'yearly',
  renewal_date text NOT NULL DEFAULT '',
  nominee text,
  remind_days_before integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recurring_bills (
  id text PRIMARY KEY,
  kind text NOT NULL DEFAULT 'electricity',
  name text NOT NULL,
  usual_amount bigint NOT NULL DEFAULT 0,
  variable boolean NOT NULL DEFAULT false,
  due_day integer NOT NULL DEFAULT 1,
  frequency text NOT NULL DEFAULT 'monthly',
  pay_from_account_id text,
  remind_days_before integer NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'other',
  amount bigint NOT NULL DEFAULT 0,
  cycle text NOT NULL DEFAULT 'monthly',
  next_billing_date text NOT NULL DEFAULT '',
  payment_method_type text NOT NULL DEFAULT 'card',
  payment_method_id text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS debts (
  id text PRIMARY KEY,
  person_name text NOT NULL,
  person_phone text,
  direction text NOT NULL DEFAULT 'owed_to_me',
  amount bigint NOT NULL DEFAULT 0,
  settled bigint NOT NULL DEFAULT 0,
  reason text,
  date text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  remind_on text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  kind text NOT NULL DEFAULT 'due',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  deep_link text NOT NULL DEFAULT '',
  read_at text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insights (
  id text PRIMARY KEY,
  kind text NOT NULL DEFAULT 'spending',
  headline text NOT NULL,
  detail text NOT NULL DEFAULT '',
  basis text NOT NULL DEFAULT 'data',
  cta_label text,
  deep_link text,
  dismissed_at text,
  useful boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  id text PRIMARY KEY DEFAULT 'singleton',
  currency text NOT NULL DEFAULT 'INR',
  language text NOT NULL DEFAULT 'en',
  safety_buffer bigint NOT NULL DEFAULT 5000000,
  theme text NOT NULL DEFAULT 'forest',
  pin_hash text,
  biometric_enabled boolean NOT NULL DEFAULT false,
  auto_lock_minutes integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT singleton_check CHECK (id = 'singleton')
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sips ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Helper: create standard 4 CRUD policies for a table
-- We do this manually per table since Supabase doesn't support procedural policy generation easily.

-- goals
DROP POLICY IF EXISTS "anon_select_goals" ON goals;
CREATE POLICY "anon_select_goals" ON goals FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_goals" ON goals;
CREATE POLICY "anon_insert_goals" ON goals FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_goals" ON goals;
CREATE POLICY "anon_update_goals" ON goals FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_goals" ON goals;
CREATE POLICY "anon_delete_goals" ON goals FOR DELETE TO anon, authenticated USING (true);

-- loans
DROP POLICY IF EXISTS "anon_select_loans" ON loans;
CREATE POLICY "anon_select_loans" ON loans FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_loans" ON loans;
CREATE POLICY "anon_insert_loans" ON loans FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_loans" ON loans;
CREATE POLICY "anon_update_loans" ON loans FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_loans" ON loans;
CREATE POLICY "anon_delete_loans" ON loans FOR DELETE TO anon, authenticated USING (true);

-- investments
DROP POLICY IF EXISTS "anon_select_investments" ON investments;
CREATE POLICY "anon_select_investments" ON investments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_investments" ON investments;
CREATE POLICY "anon_insert_investments" ON investments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_investments" ON investments;
CREATE POLICY "anon_update_investments" ON investments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_investments" ON investments;
CREATE POLICY "anon_delete_investments" ON investments FOR DELETE TO anon, authenticated USING (true);

-- sips
DROP POLICY IF EXISTS "anon_select_sips" ON sips;
CREATE POLICY "anon_select_sips" ON sips FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sips" ON sips;
CREATE POLICY "anon_insert_sips" ON sips FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sips" ON sips;
CREATE POLICY "anon_update_sips" ON sips FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sips" ON sips;
CREATE POLICY "anon_delete_sips" ON sips FOR DELETE TO anon, authenticated USING (true);

-- insurance_policies
DROP POLICY IF EXISTS "anon_select_insurance" ON insurance_policies;
CREATE POLICY "anon_select_insurance" ON insurance_policies FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_insurance" ON insurance_policies;
CREATE POLICY "anon_insert_insurance" ON insurance_policies FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_insurance" ON insurance_policies;
CREATE POLICY "anon_update_insurance" ON insurance_policies FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_insurance" ON insurance_policies;
CREATE POLICY "anon_delete_insurance" ON insurance_policies FOR DELETE TO anon, authenticated USING (true);

-- recurring_bills
DROP POLICY IF EXISTS "anon_select_recurring_bills" ON recurring_bills;
CREATE POLICY "anon_select_recurring_bills" ON recurring_bills FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_recurring_bills" ON recurring_bills;
CREATE POLICY "anon_insert_recurring_bills" ON recurring_bills FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_recurring_bills" ON recurring_bills;
CREATE POLICY "anon_update_recurring_bills" ON recurring_bills FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_recurring_bills" ON recurring_bills;
CREATE POLICY "anon_delete_recurring_bills" ON recurring_bills FOR DELETE TO anon, authenticated USING (true);

-- subscriptions
DROP POLICY IF EXISTS "anon_select_subscriptions" ON subscriptions;
CREATE POLICY "anon_select_subscriptions" ON subscriptions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_subscriptions" ON subscriptions;
CREATE POLICY "anon_insert_subscriptions" ON subscriptions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_subscriptions" ON subscriptions;
CREATE POLICY "anon_update_subscriptions" ON subscriptions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_subscriptions" ON subscriptions;
CREATE POLICY "anon_delete_subscriptions" ON subscriptions FOR DELETE TO anon, authenticated USING (true);

-- debts
DROP POLICY IF EXISTS "anon_select_debts" ON debts;
CREATE POLICY "anon_select_debts" ON debts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_debts" ON debts;
CREATE POLICY "anon_insert_debts" ON debts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_debts" ON debts;
CREATE POLICY "anon_update_debts" ON debts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_debts" ON debts;
CREATE POLICY "anon_delete_debts" ON debts FOR DELETE TO anon, authenticated USING (true);

-- notifications
DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE TO anon, authenticated USING (true);

-- insights
DROP POLICY IF EXISTS "anon_select_insights" ON insights;
CREATE POLICY "anon_select_insights" ON insights FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_insights" ON insights;
CREATE POLICY "anon_insert_insights" ON insights FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_insights" ON insights;
CREATE POLICY "anon_update_insights" ON insights FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_insights" ON insights;
CREATE POLICY "anon_delete_insights" ON insights FOR DELETE TO anon, authenticated USING (true);

-- settings
DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_settings" ON settings;
CREATE POLICY "anon_insert_settings" ON settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_settings" ON settings;
CREATE POLICY "anon_update_settings" ON settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_settings" ON settings;
CREATE POLICY "anon_delete_settings" ON settings FOR DELETE TO anon, authenticated USING (true);