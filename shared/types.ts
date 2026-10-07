// KAI data model — shared TypeScript types (client + server)
// Layer 1: FinancialObject (things you have / owe / plan)
// Layer 2: Transaction (events). Objects create Schedules → UpcomingEvents → Notifications → Transactions → Analytics.

export type ID = string;          // uuid
export type ISODate = string;     // '2026-10-04'
export type ISODateTime = string; // '2026-10-04T20:02:00+05:30'
export type Paise = number;       // store money as integer paise (₹500 = 50000) to avoid float errors
export type Currency = 'INR' | 'USD' | 'AED' | 'EUR' | 'GBP';
export type Space = 'personal' | 'business'; // business is future — default 'personal'
export type Source = 'voice' | 'manual' | 'import' | 'integration'; // integration = future bank/AA/broker

// ---------- Financial objects ----------
export type AccountKind = 'savings' | 'current' | 'cash' | 'wallet' | 'other';
export interface Account {
  id: ID; userId: ID; space: Space; name: string; kind: AccountKind;
  institution?: string; last4?: string; currency: Currency;
  openingBalance: Paise; balance: Paise;          // balance = opening + Σ effects of transactions
  isPrimary: boolean; archived: boolean; sortOrder: number; source: Source;
  createdAt: ISODateTime; updatedAt: ISODateTime;
}

export interface CreditCard {
  id: ID; userId: ID; space: Space; name: string; issuer: string; last4: string;
  creditLimit: Paise; outstanding: Paise;          // billed + unbilled
  statementDay: number;                            // 1–31
  dueDay: number;                                  // 1–31
  lastStatement?: { date: ISODate; totalDue: Paise; minimumDue: Paise; paid: Paise };
  autopay: boolean; archived: boolean; source: Source;
  createdAt: ISODateTime; updatedAt: ISODateTime;
}

export type LoanKind = 'personal' | 'vehicle' | 'education' | 'home' | 'other';
export interface Loan {
  id: ID; userId: ID; space: Space; kind: LoanKind; lender: string;
  principal: Paise; annualRatePct: number; tenureMonths: number;
  emi: Paise; emiDay: number; startDate: ISODate;
  outstanding: Paise; paidCount: number; payFromAccountId?: ID;
  status: 'active' | 'closed'; source: Source; createdAt: ISODateTime; updatedAt: ISODateTime;
}

export interface Emi {          // product EMI (e.g. laptop on card)
  id: ID; userId: ID; space: Space; title: string;
  monthly: Paise; count: number; paidCount: number; dueDay: number;
  interest: Paise;              // 0 for no-cost
  chargedTo: { type: 'card' | 'account'; id: ID };
  startDate: ISODate; status: 'active' | 'completed'; createdAt: ISODateTime; updatedAt: ISODateTime;
}

export type InvestmentKind = 'mutual_fund' | 'stock' | 'fd' | 'rd' | 'gold' | 'bond' | 'crypto' | 'ppf' | 'nps' | 'other';
export interface Investment {
  id: ID; userId: ID; space: Space; kind: InvestmentKind; name: string;
  invested: Paise; currentValue: Paise; units?: number;
  valueUpdatedAt: ISODateTime; valueSource: Source;   // manual NAV today
  maturityDate?: ISODate; ratePct?: number; createdAt: ISODateTime; updatedAt: ISODateTime;
}

export interface Sip {
  id: ID; userId: ID; space: Space; investmentId: ID;
  amount: Paise; frequency: 'weekly' | 'monthly' | 'quarterly'; day: number;
  fromAccountId: ID; startDate: ISODate;
  status: 'active' | 'paused' | 'stopped'; createdAt: ISODateTime; updatedAt: ISODateTime;
}

export type InsuranceKind = 'health' | 'life' | 'vehicle' | 'travel' | 'other';
export interface InsurancePolicy {
  id: ID; userId: ID; space: Space; kind: InsuranceKind; provider: string; policyName: string;
  policyNumber?: string; cover: Paise; premium: Paise;
  premiumFrequency: 'monthly' | 'quarterly' | 'yearly'; renewalDate: ISODate;
  insured?: string[]; nominee?: string; remindDaysBefore: number;   // default 30
  documentIds: ID[]; createdAt: ISODateTime; updatedAt: ISODateTime;
}

export type BillKind = 'electricity' | 'internet' | 'mobile' | 'rent' | 'water' | 'maintenance' | 'school_fees' | 'other';
export interface Bill {
  id: ID; userId: ID; space: Space; kind: BillKind; name: string;
  usualAmount: Paise; variable: boolean; dueDay: number; frequency: 'monthly' | 'quarterly' | 'yearly';
  payFromAccountId?: ID; remindDaysBefore: number; createdAt: ISODateTime; updatedAt: ISODateTime;
}

export interface Subscription {
  id: ID; userId: ID; space: Space; name: string; category: 'streaming' | 'music' | 'software' | 'cloud' | 'fitness' | 'other';
  amount: Paise; cycle: 'monthly' | 'quarterly' | 'yearly'; nextBillingDate: ISODate;
  paymentMethod: { type: 'card' | 'account'; id: ID }; status: 'active' | 'cancelled';
  createdAt: ISODateTime; updatedAt: ISODateTime;
}

export interface Goal {
  id: ID; userId: ID; space: Space; name: string; icon: string;
  target: Paise; saved: Paise; deadline?: ISODate; monthlyTarget?: Paise;  // computed suggestion
  linkedAccountId?: ID; status: 'active' | 'completed' | 'archived'; completedAt?: ISODateTime;
  createdAt: ISODateTime; updatedAt: ISODateTime;
}

export interface Person { id: ID; userId: ID; name: string; phone?: string; }
export interface Debt {          // money owed between the user and a person
  id: ID; userId: ID; personId: ID; direction: 'owed_to_me' | 'i_owe';
  amount: Paise; settled: Paise; reason?: string; date: ISODate;
  status: 'open' | 'settled'; remindOn?: ISODate; source: Source;
  createdAt: ISODateTime; updatedAt: ISODateTime;
}

export interface Asset {         // other assets for net worth (EPF, car, gold, property)
  id: ID; userId: ID; space: Space; name: string; kind: 'epf' | 'vehicle' | 'gold' | 'property' | 'other';
  value: Paise; valueUpdatedAt: ISODateTime;
}

export interface Document {
  id: ID; userId: ID; title: string; category: 'insurance' | 'loan' | 'tax' | 'investment' | 'receipt' | 'bank' | 'other';
  mimeType: string; sizeBytes: number; storageKey: string;      // encrypted object storage
  linked?: { type: ObjectType; id: ID }; validUntil?: ISODate; createdAt: ISODateTime;
}

export type ObjectType = 'account' | 'credit_card' | 'loan' | 'emi' | 'investment' | 'sip' | 'insurance' | 'bill' | 'subscription' | 'goal' | 'debt';

// ---------- Financial events ----------
export type TxType =
  | 'expense' | 'income' | 'transfer'
  | 'card_payment'      // settles credit card liability — NOT spending
  | 'investment'        // money into investments — NOT spending
  | 'emi_payment' | 'loan_payment' | 'insurance_premium' | 'subscription_payment' | 'bill_payment'
  | 'debt_settlement';  // repayment between people — NOT income/expense

export type Category =
  | 'food_dining' | 'transport' | 'fuel' | 'shopping' | 'bills' | 'rent' | 'entertainment'
  | 'health' | 'education' | 'travel' | 'personal' | 'family' | 'emi_loan' | 'other'
  | 'salary' | 'freelance' | 'business' | 'client_payment' | 'interest' | 'dividends' | 'rental' | 'refund' | 'other_income';

export interface Transaction {
  id: ID; userId: ID; space: Space;
  type: TxType; amount: Paise; currency: Currency;
  category?: Category; description?: string; merchant?: string;
  happenedAt: ISODateTime;      // when the money moved (e.g. yesterday 21:00)
  recordedAt: ISODateTime;      // when the user created the entry (now) — NEVER merge with happenedAt
  fromAccount?: { type: 'account' | 'credit_card'; id: ID };  // paid with / source
  toAccount?: { type: 'account' | 'credit_card' | 'investment'; id: ID }; // received in / destination
  tags: string[]; notes?: string;
  source: Source; voiceTranscript?: string;
  linkedObject?: { type: ObjectType; id: ID };  // SIP instalment, EMI 7/12, bill, policy…
  recurrenceId?: ID; undoUntil?: ISODateTime;   // undo window after quick voice add
  createdAt: ISODateTime; updatedAt: ISODateTime; deletedAt?: ISODateTime;
}

// Spending analytics include ONLY these types:
export const COUNTS_AS_SPENDING: TxType[] = ['expense', 'emi_payment', 'loan_payment', 'insurance_premium', 'subscription_payment', 'bill_payment'];
export const COUNTS_AS_INCOME: TxType[] = ['income'];
// transfer, card_payment, investment and debt_settlement are excluded from both.

// ---------- Schedules & upcoming ----------
export interface Schedule {
  id: ID; userId: ID; objectType: ObjectType; objectId: ID;
  rule: { freq: 'weekly' | 'monthly' | 'quarterly' | 'yearly'; day?: number; month?: number };
  amount: Paise; txType: TxType; remindDaysBefore: number; active: boolean;
}
export interface UpcomingEvent {
  id: ID; userId: ID; scheduleId?: ID; objectType: ObjectType; objectId: ID;
  title: string; dueDate: ISODate; amount: Paise; direction: 'out' | 'in';
  status: 'upcoming' | 'paid' | 'skipped' | 'overdue'; transactionId?: ID;
}

export interface Notification {
  id: ID; userId: ID; kind: 'due' | 'sip' | 'renewal' | 'insight' | 'goal' | 'unusual' | 'subscription';
  title: string; body: string; deepLink: string; createdAt: ISODateTime; readAt?: ISODateTime;
  actions?: { label: string; action: string }[];
}

export interface Insight {
  id: ID; userId: ID; kind: 'spending' | 'savings' | 'upcoming' | 'subscriptions' | 'goal' | 'unusual';
  headline: string; detail: string; basis: 'data' | 'calculation' | 'suggestion';
  ctaLabel?: string; deepLink?: string; createdAt: ISODateTime; dismissedAt?: ISODateTime; useful?: boolean;
}

// ---------- Voice parsing contract ----------
export interface VoiceParseResult {
  transcript: string;
  intent: 'create_transaction' | 'create_object' | 'settle_debt' | 'question' | 'unknown';
  transaction?: Partial<Transaction> & { confidence: number };
  transactions?: (Partial<Transaction> & { confidence: number })[];   // complex: several items in one sentence
  object?: { type: ObjectType; fields: Record<string, unknown>; confidence: number };
  missing: ('amount' | 'account' | 'category' | 'date' | 'person')[];  // ask ONE follow-up, only if essential
  followUpQuestion?: string;   // e.g. "Which account did you use?"
}

export interface User {
  id: ID; name: string; phone?: string; email?: string; currency: Currency; language: string;
  persona?: ('salaried' | 'freelancer' | 'founder' | 'student' | 'home' | 'investor')[];
  safetyBuffer: Paise;        // used by "Can I afford…" answers
  plan: 'free' | 'pro'; proRenewsAt?: ISODateTime; createdAt: ISODateTime;
}
