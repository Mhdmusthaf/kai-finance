/*
# Create KAI finance core tables (single-tenant, no auth)

1. Plain-English summary
   KAI is a personal finance app. This migration creates the four core tables
   the app needs to remember your money between sessions: bank accounts,
   credit cards, transactions, and upcoming bills. One dataset is shared by
   the app (no sign-in exists yet), so every row is visible to the app.

2. New Tables
- `accounts` — bank / cash accounts (title, subtitle, balance in paise, icon, account number, sort order)
- `cards` — credit cards (name, issuer, outstanding, credit limit, due date label)
- `transactions` — money events (title, amount in paise, type: expense/income/transfer/card_pay, account, icon)
- `upcoming_bills` — scheduled payments (title, subtitle, amount, due date, status: due/paid, icon)

3. Security
- Enable RLS on all four tables.
- Policies allow anon + authenticated CRUD because the app intentionally has
  no sign-in yet and manages one shared dataset.

4. Notes
- Money is stored as integer paise (₹500 = 50000) to avoid float errors.
- IDs are client-generated text (e.g. "tx_1728...") so optimistic UI keeps working.
*/

CREATE TABLE IF NOT EXISTS accounts (
  id text PRIMARY KEY,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  balance bigint NOT NULL DEFAULT 0,
  icon text NOT NULL DEFAULT 'bank',
  account_number text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cards (
  id text PRIMARY KEY,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  outstanding bigint NOT NULL DEFAULT 0,
  credit_limit bigint NOT NULL DEFAULT 0,
  due_date text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id text PRIMARY KEY,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  amount bigint NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'expense',
  amount_color text,
  icon text NOT NULL DEFAULT 'expense',
  icon_bg_color text NOT NULL DEFAULT '#D8F3E5',
  happened_at text NOT NULL DEFAULT '',
  account text NOT NULL DEFAULT '',
  is_voice boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS upcoming_bills (
  id text PRIMARY KEY,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  amount bigint NOT NULL DEFAULT 0,
  due_date text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'due',
  icon text NOT NULL DEFAULT 'bills',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions (created_at DESC);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE upcoming_bills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_accounts" ON accounts;
CREATE POLICY "anon_select_accounts" ON accounts FOR SELECT
TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_accounts" ON accounts;
CREATE POLICY "anon_insert_accounts" ON accounts FOR INSERT
TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_accounts" ON accounts;
CREATE POLICY "anon_update_accounts" ON accounts FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_accounts" ON accounts;
CREATE POLICY "anon_delete_accounts" ON accounts FOR DELETE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_cards" ON cards;
CREATE POLICY "anon_select_cards" ON cards FOR SELECT
TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_cards" ON cards;
CREATE POLICY "anon_insert_cards" ON cards FOR INSERT
TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_cards" ON cards;
CREATE POLICY "anon_update_cards" ON cards FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_cards" ON cards;
CREATE POLICY "anon_delete_cards" ON cards FOR DELETE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_transactions" ON transactions;
CREATE POLICY "anon_select_transactions" ON transactions FOR SELECT
TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_transactions" ON transactions;
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT
TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_transactions" ON transactions;
CREATE POLICY "anon_update_transactions" ON transactions FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_transactions" ON transactions;
CREATE POLICY "anon_delete_transactions" ON transactions FOR DELETE
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_upcoming_bills" ON upcoming_bills;
CREATE POLICY "anon_select_upcoming_bills" ON upcoming_bills FOR SELECT
TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_upcoming_bills" ON upcoming_bills;
CREATE POLICY "anon_insert_upcoming_bills" ON upcoming_bills FOR INSERT
TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_upcoming_bills" ON upcoming_bills;
CREATE POLICY "anon_update_upcoming_bills" ON upcoming_bills FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_upcoming_bills" ON upcoming_bills;
CREATE POLICY "anon_delete_upcoming_bills" ON upcoming_bills FOR DELETE
TO anon, authenticated USING (true);