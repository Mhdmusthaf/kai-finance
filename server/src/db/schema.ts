import {
  pgTable, uuid, text, bigint, integer, boolean, timestamp, date, jsonb, index, uniqueIndex, check, pgEnum,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

// ---------- Enums ----------

export const txTypeEnum = pgEnum('tx_type', [
  'expense', 'income', 'transfer', 'card_payment', 'investment', 'emi_payment',
  'insurance_premium', 'subscription_payment', 'bill_payment', 'debt_settlement',
]);

// Which tx types count toward "spending" — single source of truth server-side.
export const COUNTS_AS_SPENDING: Record<string, boolean> = {
  expense: true,
  income: false,
  transfer: false,
  card_payment: false,
  investment: false,
  emi_payment: false,
  insurance_premium: false,
  subscription_payment: false,
  bill_payment: false,
  debt_settlement: false,
};

export const debtDirectionEnum = pgEnum('debt_direction', ['owed_to_me', 'i_owe']);
export const debtStatusEnum = pgEnum('debt_status', ['open', 'settled']);
export const goalStatusEnum = pgEnum('goal_status', ['active', 'completed', 'archived']);
export const sipStatusEnum = pgEnum('sip_status', ['active', 'paused', 'stopped']);
export const eventStatusEnum = pgEnum('event_status', ['upcoming', 'paid', 'skipped', 'snoozed']);
export const insightBasisEnum = pgEnum('insight_basis', ['data', 'calculation', 'suggestion']);
export const otpPurposeEnum = pgEnum('otp_purpose', ['login']);

// ---------- Users & Auth ----------

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: text('phone').unique(), // E.164
  email: text('email').unique(),
  name: text('name'),
  provider: text('provider').notNull().default('phone'), // phone | google
  providerId: text('provider_id'),
  status: text('status').notNull().default('active'), // active | suspended | deleted
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => [index('users_phone_idx').on(t.phone)]);

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  rotatedFrom: uuid('rotated_from'),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('refresh_tokens_user_idx').on(t.userId), uniqueIndex('refresh_tokens_hash_idx').on(t.tokenHash)]);

export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: text('phone').notNull(),
  codeHash: text('code_hash').notNull(),
  attempts: integer('attempts').notNull().default(0),
  consumedAt: timestamp('consumed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('otp_phone_idx').on(t.phone)]);

// ---------- Money objects ----------

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  kind: text('kind').notNull().default('savings'), // savings | current | cash | wallet
  institution: text('institution'),
  last4: text('last4'),
  balance: bigint('balance', { mode: 'number' }).notNull().default(0), // paise
  isPrimary: boolean('is_primary').notNull().default(false),
  archived: boolean('archived').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('accounts_user_idx').on(t.userId)]);

export const creditCards = pgTable('credit_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  issuer: text('issuer'),
  last4: text('last4'),
  creditLimit: bigint('credit_limit', { mode: 'number' }).notNull(), // paise
  outstanding: bigint('outstanding', { mode: 'number' }).notNull().default(0),
  statementDay: integer('statement_day'),
  dueDay: integer('due_day'),
  autopay: boolean('autopay').notNull().default(false),
  archived: boolean('archived').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('cards_user_idx').on(t.userId)]);

export const loans = pgTable('loans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull().default('personal'),
  lender: text('lender').notNull(),
  principal: bigint('principal', { mode: 'number' }).notNull(),
  annualRatePct: integer('annual_rate_pct').notNull(), // basis points of a percent? store percent*100 (e.g. 925 = 9.25%)
  tenureMonths: integer('tenure_months').notNull(),
  emi: bigint('emi', { mode: 'number' }).notNull(), // paise
  emiDay: integer('emi_day').notNull().default(5),
  startDate: date('start_date').notNull(),
  outstanding: bigint('outstanding', { mode: 'number' }).notNull(),
  paidCount: integer('paid_count').notNull().default(0),
  status: text('status').notNull().default('active'), // active | closed
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('loans_user_idx').on(t.userId)]);

export const investments = pgTable('investments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), // mf | stocks | ppf | epf | fd | gold
  name: text('name').notNull(),
  invested: bigint('invested', { mode: 'number' }).notNull(),
  currentValue: bigint('current_value', { mode: 'number' }).notNull(),
  maturityDate: date('maturity_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('investments_user_idx').on(t.userId)]);

export const sips = pgTable('sips', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  investmentId: uuid('investment_id').notNull().references(() => investments.id, { onDelete: 'cascade' }),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  frequency: text('frequency').notNull().default('monthly'), // weekly | monthly | quarterly
  day: integer('day').notNull().default(5),
  startDate: date('start_date').notNull(),
  status: sipStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('sips_user_idx').on(t.userId)]);

export const insurancePolicies = pgTable('insurance_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), // health | term | vehicle | travel
  provider: text('provider').notNull(),
  policyName: text('policy_name').notNull(),
  cover: bigint('cover', { mode: 'number' }).notNull(),
  premium: bigint('premium', { mode: 'number' }).notNull(),
  premiumFrequency: text('premium_frequency').notNull().default('yearly'),
  renewalDate: date('renewal_date').notNull(),
  remindDaysBefore: integer('remind_days_before').notNull().default(30),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('insurance_user_idx').on(t.userId)]);

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category'),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  cycle: text('cycle').notNull().default('monthly'),
  nextBillingDate: date('next_billing_date').notNull(),
  status: text('status').notNull().default('active'), // active | cancelled
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('subs_user_idx').on(t.userId)]);

export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('goals'),
  target: bigint('target', { mode: 'number' }).notNull(),
  saved: bigint('saved', { mode: 'number' }).notNull().default(0),
  deadline: date('deadline'),
  monthlyTarget: bigint('monthly_target', { mode: 'number' }),
  status: goalStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('goals_user_idx').on(t.userId),
  check('goals_target_positive', sql`${t.target} > 0`),
]);

export const debts = pgTable('debts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  personName: text('person_name').notNull(),
  personPhone: text('person_phone'),
  direction: debtDirectionEnum('direction').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  settled: bigint('settled', { mode: 'number' }).notNull().default(0),
  reason: text('reason'),
  date: date('date').notNull(),
  status: debtStatusEnum('status').notNull().default('open'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('debts_user_idx').on(t.userId)]);

// ---------- Transactions ----------

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: txTypeEnum('type').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  category: text('category'),
  description: text('description'),
  happenedAt: timestamp('happened_at', { withTimezone: true }).notNull().defaultNow(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  fromType: text('from_type'), // account | card
  fromId: uuid('from_id'),
  toType: text('to_type'),
  toId: uuid('to_id'),
  source: text('source').notNull().default('manual'), // manual | voice | recurring
  voiceEntryId: uuid('voice_entry_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('tx_user_happened_idx').on(t.userId, t.happenedAt),
  check('tx_amount_positive', sql`${t.amount} > 0`),
]);

// ---------- Upcoming / schedules ----------

export const upcomingEvents = pgTable('upcoming_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  objectType: text('object_type').notNull(), // bill | card | loan | sip | insurance | subscription | goal
  objectId: uuid('object_id'),
  title: text('title').notNull(),
  dueDate: date('due_date').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  status: eventStatusEnum('status').notNull().default('upcoming'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('upcoming_user_due_idx').on(t.userId, t.dueDate)]);

// ---------- Insights / notifications / voice / ai ----------

export const insights = pgTable('insights', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  headline: text('headline').notNull(),
  detail: text('detail').notNull(),
  basis: insightBasisEnum('basis').notNull().default('data'),
  ctaLabel: text('cta_label'),
  deepLink: text('deep_link'),
  dismissedAt: timestamp('dismissed_at', { withTimezone: true }),
  useful: boolean('useful'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('insights_user_idx').on(t.userId)]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  deepLink: text('deep_link'),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('notifications_user_idx').on(t.userId, t.createdAt)]);

export const pushTokens = pgTable('push_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  platform: text('platform').notNull(), // ios | android
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('push_tokens_token_idx').on(t.token)]);

export const voiceEntries = pgTable('voice_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  transcript: text('transcript').notNull(),
  parseResult: jsonb('parse_result'),
  status: text('status').notNull().default('parsed'), // parsed | committed | failed
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('voice_user_idx').on(t.userId)]);

export const aiInteractions = pgTable('ai_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer'),
  basis: text('basis'),
  toolCalls: jsonb('tool_calls'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('ai_user_idx').on(t.userId)]);

// ---------- Settings / entitlements / vault / audit ----------

export const settings = pgTable('settings', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  currency: text('currency').notNull().default('INR'),
  language: text('language').notNull().default('en-IN'),
  theme: text('theme').notNull().default('light'),
  safetyBuffer: bigint('safety_buffer', { mode: 'number' }).notNull().default(0),
  biometricEnabled: boolean('biometric_enabled').notNull().default(false),
  autoLockMinutes: integer('auto_lock_minutes').notNull().default(2),
  hideBalances: boolean('hide_balances').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const entitlements = pgTable('entitlements', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  plan: text('plan').notNull().default('free'), // free | pro
  isPro: boolean('is_pro').notNull().default(false),
  source: text('source').notNull().default('none'), // revenuecat | admin_grant | none
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  category: text('category').notNull().default('other'), // id | policy | receipt | statement | other
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  storageKey: text('storage_key').notNull(), // private object storage key
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('documents_user_idx').on(t.userId)]);

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id'),
  actorRole: text('actor_role'), // user | support | admin | superadmin | system
  action: text('action').notNull(),
  targetType: text('target_type'),
  targetId: text('target_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('audit_created_idx').on(t.createdAt)]);

// ---------- Relations (for drizzle query API) ----------

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  cards: many(creditCards),
  transactions: many(transactions),
  settings: one(settings, { fields: [users.id], references: [settings.userId] }),
  entitlements: one(entitlements, { fields: [users.id], references: [entitlements.userId] }),
}));

export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
