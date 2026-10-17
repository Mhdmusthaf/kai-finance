import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getSupabase } from '../lib/supabase';

// ---------- Types ----------

export interface TransactionItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: 'expense' | 'income' | 'transfer' | 'card_pay';
  amountColor?: 'forest' | 'deepMint' | 'error' | 'mint' | 'cream' | 'white';
  icon: string;
  iconBgColor: string;
  happenedAt: string;
  account: string;
  isVoice?: boolean;
}

export interface BankAccount {
  id: string;
  title: string;
  subtitle: string;
  balance: number;
  icon: string;
  accountNumber: string;
}

export interface CreditCardItem {
  id: string;
  title: string;
  subtitle: string;
  outstanding: number;
  limit: number;
  dueDate: string;
}

export interface UpcomingBillItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  dueDate: string;
  status: 'due' | 'paid';
  icon: string;
}

export interface GoalItem {
  id: string;
  name: string;
  icon: string;
  target: number;
  saved: number;
  deadline?: string;
  monthlyTarget?: number;
  status: 'active' | 'completed' | 'archived';
}

export interface LoanItem {
  id: string;
  kind: string;
  lender: string;
  principal: number;
  annualRatePct: number;
  tenureMonths: number;
  emi: number;
  emiDay: number;
  startDate: string;
  outstanding: number;
  paidCount: number;
  status: 'active' | 'closed';
}

export interface InvestmentItem {
  id: string;
  kind: string;
  name: string;
  invested: number;
  currentValue: number;
  maturityDate?: string;
}

export interface SipItem {
  id: string;
  investmentId: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  day: number;
  startDate: string;
  status: 'active' | 'paused' | 'stopped';
}

export interface InsuranceItem {
  id: string;
  kind: string;
  provider: string;
  policyName: string;
  cover: number;
  premium: number;
  premiumFrequency: 'monthly' | 'quarterly' | 'yearly';
  renewalDate: string;
  remindDaysBefore: number;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  cycle: 'monthly' | 'quarterly' | 'yearly';
  nextBillingDate: string;
  status: 'active' | 'cancelled';
}

export interface DebtItem {
  id: string;
  personName: string;
  personPhone?: string;
  direction: 'owed_to_me' | 'i_owe';
  amount: number;
  settled: number;
  reason?: string;
  date: string;
  status: 'open' | 'settled';
}

export interface NotificationItem {
  id: string;
  kind: string;
  title: string;
  body: string;
  deepLink: string;
  readAt?: string;
  createdAt: string;
}

export interface InsightItem {
  id: string;
  kind: string;
  headline: string;
  detail: string;
  basis: 'data' | 'calculation' | 'suggestion';
  ctaLabel?: string;
  deepLink?: string;
  dismissedAt?: string;
  useful?: boolean;
}

export interface SettingsItem {
  currency: string;
  language: string;
  safetyBuffer: number;
  theme: string;
  biometricEnabled: boolean;
  autoLockMinutes: number;
}

interface AppContextType {
  authStage: 'splash' | 'onboarding' | 'auth_otp' | 'pin_lock' | 'authenticated';
  setAuthStage: (stage: 'splash' | 'onboarding' | 'auth_otp' | 'pin_lock' | 'authenticated') => void;

  accounts: BankAccount[];
  cards: CreditCardItem[];
  transactions: TransactionItem[];
  upcomingBills: UpcomingBillItem[];
  goals: GoalItem[];
  loans: LoanItem[];
  investments: InvestmentItem[];
  sips: SipItem[];
  insurance: InsuranceItem[];
  subscriptions: SubscriptionItem[];
  debts: DebtItem[];
  notifications: NotificationItem[];
  insights: InsightItem[];
  settings: SettingsItem | null;

  loading: boolean;
  syncError: string | null;
  refresh: () => void;

  balanceHidden: boolean;
  setBalanceHidden: (hidden: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;

  addTransaction: (tx: Omit<TransactionItem, 'id' | 'happenedAt'>) => void;
  deleteTransaction: (id: string) => void;
  markBillPaid: (id: string) => void;
  addAccount: (acc: Omit<BankAccount, 'id'>) => void;
  addCard: (card: Omit<CreditCardItem, 'id'>) => void;
  addUpcomingBill: (bill: Omit<UpcomingBillItem, 'id' | 'status'>) => void;
  addGoal: (goal: Omit<GoalItem, 'id' | 'saved' | 'status'>) => void;
  updateGoal: (id: string, updates: Partial<GoalItem>) => void;
  deleteGoal: (id: string) => void;
  markNotificationRead: (id: string) => void;
  dismissInsight: (id: string) => void;
  updateSettings: (updates: Partial<SettingsItem>) => void;
  addDebt: (debt: Omit<DebtItem, 'id' | 'settled' | 'status'>) => void;
  settleDebt: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const formatPaise = (paise: number) =>
  `₹${Math.round(paise / 100).toLocaleString('en-IN')}`;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authStage, setAuthStage] = useState<'splash' | 'onboarding' | 'auth_otp' | 'pin_lock' | 'authenticated'>('splash');
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [cards, setCards] = useState<CreditCardItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<UpcomingBillItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [sips, setSips] = useState<SipItem[]>([]);
  const [insurance, setInsurance] = useState<InsuranceItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [settings, setSettings] = useState<SettingsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setSyncError(null);
    try {
      const supabase = getSupabase();
      const [
        accRes, cardRes, txRes, billRes,
        goalRes, loanRes, invRes, sipRes,
        insRes, subRes, debtRes, notifRes,
        insightRes, settingsRes,
      ] = await Promise.all([
        supabase.from('accounts').select('*').order('sort_order', { ascending: true }),
        supabase.from('cards').select('*'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('upcoming_bills').select('*'),
        supabase.from('goals').select('*'),
        supabase.from('loans').select('*'),
        supabase.from('investments').select('*'),
        supabase.from('sips').select('*'),
        supabase.from('insurance_policies').select('*'),
        supabase.from('subscriptions').select('*'),
        supabase.from('debts').select('*'),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('insights').select('*').order('created_at', { ascending: false }),
        supabase.from('settings').select('*').eq('id', 'singleton').maybeSingle(),
      ]);

      const firstError = accRes.error || cardRes.error || txRes.error || billRes.error ||
        goalRes.error || loanRes.error || invRes.error || sipRes.error ||
        insRes.error || subRes.error || debtRes.error || notifRes.error ||
        insightRes.error || settingsRes.error;
      if (firstError) throw new Error(firstError.message);

      if (!mounted.current) return;

      setAccounts((accRes.data || []).map((a: any) => ({
        id: a.id, title: a.title, subtitle: a.subtitle,
        balance: Number(a.balance), icon: a.icon, accountNumber: a.account_number,
      })));
      setCards((cardRes.data || []).map((c: any) => ({
        id: c.id, title: c.title, subtitle: c.subtitle,
        outstanding: Number(c.outstanding), limit: Number(c.credit_limit), dueDate: c.due_date,
      })));
      setTransactions((txRes.data || []).map((t: any) => ({
        id: t.id, title: t.title, subtitle: t.subtitle, amount: Number(t.amount),
        type: t.type, amountColor: t.amount_color || undefined, icon: t.icon,
        iconBgColor: t.icon_bg_color, happenedAt: t.happened_at, account: t.account, isVoice: t.is_voice,
      })));
      setUpcomingBills((billRes.data || []).map((b: any) => ({
        id: b.id, title: b.title, subtitle: b.subtitle, amount: Number(b.amount),
        dueDate: b.due_date, status: b.status, icon: b.icon,
      })));
      setGoals((goalRes.data || []).map((g: any) => ({
        id: g.id, name: g.name, icon: g.icon, target: Number(g.target),
        saved: Number(g.saved), deadline: g.deadline || undefined,
        monthlyTarget: g.monthly_target ? Number(g.monthly_target) : undefined,
        status: g.status,
      })));
      setLoans((loanRes.data || []).map((l: any) => ({
        id: l.id, kind: l.kind, lender: l.lender, principal: Number(l.principal),
        annualRatePct: Number(l.annual_rate_pct), tenureMonths: l.tenure_months,
        emi: Number(l.emi), emiDay: l.emi_day, startDate: l.start_date,
        outstanding: Number(l.outstanding), paidCount: l.paid_count, status: l.status,
      })));
      setInvestments((invRes.data || []).map((i: any) => ({
        id: i.id, kind: i.kind, name: i.name, invested: Number(i.invested),
        currentValue: Number(i.current_value), maturityDate: i.maturity_date || undefined,
      })));
      setSips((sipRes.data || []).map((s: any) => ({
        id: s.id, investmentId: s.investment_id, amount: Number(s.amount),
        frequency: s.frequency, day: s.day, startDate: s.start_date, status: s.status,
      })));
      setInsurance((insRes.data || []).map((p: any) => ({
        id: p.id, kind: p.kind, provider: p.provider, policyName: p.policy_name,
        cover: Number(p.cover), premium: Number(p.premium),
        premiumFrequency: p.premium_frequency, renewalDate: p.renewal_date,
        remindDaysBefore: p.remind_days_before,
      })));
      setSubscriptions((subRes.data || []).map((s: any) => ({
        id: s.id, name: s.name, category: s.category, amount: Number(s.amount),
        cycle: s.cycle, nextBillingDate: s.next_billing_date, status: s.status,
      })));
      setDebts((debtRes.data || []).map((d: any) => ({
        id: d.id, personName: d.person_name, personPhone: d.person_phone || undefined,
        direction: d.direction, amount: Number(d.amount), settled: Number(d.settled),
        reason: d.reason || undefined, date: d.date, status: d.status,
      })));
      setNotifications((notifRes.data || []).map((n: any) => ({
        id: n.id, kind: n.kind, title: n.title, body: n.body,
        deepLink: n.deep_link, readAt: n.read_at || undefined, createdAt: n.created_at,
      })));
      setInsights((insightRes.data || []).map((i: any) => ({
        id: i.id, kind: i.kind, headline: i.headline, detail: i.detail,
        basis: i.basis, ctaLabel: i.cta_label || undefined, deepLink: i.deep_link || undefined,
        dismissedAt: i.dismissed_at || undefined, useful: i.useful,
      })));
      if (settingsRes.data) {
        setSettings({
          currency: settingsRes.data.currency, language: settingsRes.data.language,
          safetyBuffer: Number(settingsRes.data.safety_buffer), theme: settingsRes.data.theme,
          biometricEnabled: settingsRes.data.biometric_enabled,
          autoLockMinutes: settingsRes.data.auto_lock_minutes,
        });
      }
    } catch (err: any) {
      if (mounted.current) setSyncError(err?.message || 'Could not load your data');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const showToast = (msg: string) => setToastMessage(msg);
  const hideToast = () => setToastMessage(null);
  const refresh = () => loadAll();

  // ---------- Generic optimistic persist helper ----------
  const persistOptimistic = useCallback(async (
    table: string,
    insertData: Record<string, any>,
    rollbackFn: () => void,
    successMsg?: string,
  ) => {
    const { error } = await getSupabase().from(table).insert(insertData);
    if (error && mounted.current) {
      setSyncError(error.message);
      showToast('Could not save — check your connection');
      rollbackFn();
    } else if (mounted.current) {
      setSyncError(null);
    }
  }, []);

  // ---------- Transaction actions ----------
  const addTransaction = (newTx: Omit<TransactionItem, 'id' | 'happenedAt'>) => {
    const id = `tx_${Date.now()}`;
    const createdTx: TransactionItem = { ...newTx, id, happenedAt: 'Just now' };
    setTransactions((prev) => [createdTx, ...prev]);
    if (newTx.type === 'expense') {
      setAccounts((prev) => prev.map((acc) =>
        acc.title === newTx.account || acc.id === 'acc_1'
          ? { ...acc, balance: Math.max(0, acc.balance - newTx.amount) } : acc));
    } else if (newTx.type === 'income') {
      setAccounts((prev) => prev.map((acc) =>
        acc.title === newTx.account || acc.id === 'acc_2'
          ? { ...acc, balance: acc.balance + newTx.amount } : acc));
    }
    showToast(`Added ${formatPaise(newTx.amount)} ${newTx.title}`);
    (async () => {
      const { error } = await getSupabase().from('transactions').insert({
        id, title: newTx.title, subtitle: newTx.subtitle, amount: newTx.amount,
        type: newTx.type, amount_color: newTx.amountColor ?? null, icon: newTx.icon,
        icon_bg_color: newTx.iconBgColor, happened_at: createdTx.happenedAt,
        account: newTx.account, is_voice: !!newTx.isVoice,
      });
      if (error && mounted.current) { setSyncError(error.message); showToast('Could not save — check your connection'); loadAll(); }
      else if (mounted.current) setSyncError(null);
    })();
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    showToast('Transaction deleted');
    (async () => {
      const { error } = await getSupabase().from('transactions').delete().eq('id', id);
      if (error && mounted.current) { setSyncError(error.message); showToast('Could not delete — check your connection'); loadAll(); }
      else if (mounted.current) setSyncError(null);
    })();
  };

  const markBillPaid = (id: string) => {
    const bill = upcomingBills.find((b) => b.id === id);
    if (!bill) return;
    setUpcomingBills((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'paid' } : b)));
    setAccounts((accs) => accs.map((a, idx) => (idx === 0 ? { ...a, balance: Math.max(0, a.balance - bill.amount) } : a)));
    showToast(`Paid ${formatPaise(bill.amount)} for ${bill.title}`);
    (async () => {
      const { error } = await getSupabase().from('upcoming_bills').update({ status: 'paid' }).eq('id', id);
      if (error && mounted.current) { setSyncError(error.message); showToast('Could not update — check your connection'); loadAll(); }
      else if (mounted.current) setSyncError(null);
    })();
  };

  const addAccount = (acc: Omit<BankAccount, 'id'>) => {
    const id = `acc_${Date.now()}`;
    setAccounts((prev) => [...prev, { ...acc, id }]);
    showToast(`Added ${acc.title}`);
    (async () => {
      const { error } = await getSupabase().from('accounts').insert({
        id, title: acc.title, subtitle: acc.subtitle, balance: acc.balance,
        icon: acc.icon, account_number: acc.accountNumber, sort_order: 99,
      });
      if (error && mounted.current) { setSyncError(error.message); setAccounts((prev) => prev.filter((a) => a.id !== id)); showToast('Could not save account'); }
      else if (mounted.current) setSyncError(null);
    })();
  };

  const addCard = (card: Omit<CreditCardItem, 'id'>) => {
    const id = `card_${Date.now()}`;
    setCards((prev) => [...prev, { ...card, id }]);
    showToast(`Added ${card.title}`);
    (async () => {
      const { error } = await getSupabase().from('cards').insert({
        id, title: card.title, subtitle: card.subtitle, outstanding: card.outstanding,
        credit_limit: card.limit, due_date: card.dueDate,
      });
      if (error && mounted.current) { setSyncError(error.message); setCards((prev) => prev.filter((c) => c.id !== id)); showToast('Could not save card'); }
      else if (mounted.current) setSyncError(null);
    })();
  };

  const addUpcomingBill = (bill: Omit<UpcomingBillItem, 'id' | 'status'>) => {
    const id = `bill_${Date.now()}`;
    setUpcomingBills((prev) => [{ ...bill, id, status: 'due' }, ...prev]);
    showToast(`Scheduled bill for ${bill.title}`);
    (async () => {
      const { error } = await getSupabase().from('upcoming_bills').insert({
        id, title: bill.title, subtitle: bill.subtitle, amount: bill.amount,
        due_date: bill.dueDate, status: 'due', icon: bill.icon,
      });
      if (error && mounted.current) { setSyncError(error.message); setUpcomingBills((prev) => prev.filter((b) => b.id !== id)); showToast('Could not save bill'); }
      else if (mounted.current) setSyncError(null);
    })();
  };

  // ---------- Goal actions ----------
  const addGoal = (goal: Omit<GoalItem, 'id' | 'saved' | 'status'>) => {
    const id = `goal_${Date.now()}`;
    const newGoal: GoalItem = { ...goal, id, saved: 0, status: 'active' };
    setGoals((prev) => [...prev, newGoal]);
    showToast(`Created goal: ${goal.name}`);
    (async () => {
      const { error } = await getSupabase().from('goals').insert({
        id, name: goal.name, icon: goal.icon, target: goal.target, saved: 0,
        deadline: goal.deadline || null, monthly_target: goal.monthlyTarget || null,
        status: 'active',
      });
      if (error && mounted.current) { setSyncError(error.message); setGoals((prev) => prev.filter((g) => g.id !== id)); showToast('Could not save goal'); }
      else if (mounted.current) setSyncError(null);
    })();
  };

  const updateGoal = (id: string, updates: Partial<GoalItem>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    (async () => {
      const dbUpdates: Record<string, any> = {};
      if (updates.saved !== undefined) dbUpdates.saved = updates.saved;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.target !== undefined) dbUpdates.target = updates.target;
      const { error } = await getSupabase().from('goals').update(dbUpdates).eq('id', id);
      if (error && mounted.current) { setSyncError(error.message); loadAll(); }
      else if (mounted.current) setSyncError(null);
    })();
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Goal deleted');
    (async () => {
      const { error } = await getSupabase().from('goals').delete().eq('id', id);
      if (error && mounted.current) { setSyncError(error.message); loadAll(); }
      else if (mounted.current) setSyncError(null);
    })();
  };

  // ---------- Notification actions ----------
  const markNotificationRead = (id: string) => {
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: now } : n)));
    (async () => {
      const { error } = await getSupabase().from('notifications').update({ read_at: now }).eq('id', id);
      if (error && mounted.current) setSyncError(error.message);
      else if (mounted.current) setSyncError(null);
    })();
  };

  // ---------- Insight actions ----------
  const dismissInsight = (id: string) => {
    const now = new Date().toISOString();
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, dismissedAt: now } : i)));
    (async () => {
      const { error } = await getSupabase().from('insights').update({ dismissed_at: now }).eq('id', id);
      if (error && mounted.current) setSyncError(error.message);
      else if (mounted.current) setSyncError(null);
    })();
  };

  // ---------- Settings actions ----------
  const updateSettings = (updates: Partial<SettingsItem>) => {
    setSettings((prev) => (prev ? { ...prev, ...updates } : prev));
    (async () => {
      const dbUpdates: Record<string, any> = {};
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.language !== undefined) dbUpdates.language = updates.language;
      if (updates.safetyBuffer !== undefined) dbUpdates.safety_buffer = updates.safetyBuffer;
      if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
      if (updates.biometricEnabled !== undefined) dbUpdates.biometric_enabled = updates.biometricEnabled;
      if (updates.autoLockMinutes !== undefined) dbUpdates.auto_lock_minutes = updates.autoLockMinutes;
      const { error } = await getSupabase().from('settings').update(dbUpdates).eq('id', 'singleton');
      if (error && mounted.current) { setSyncError(error.message); loadAll(); }
      else if (mounted.current) setSyncError(null);
    })();
  };

  // ---------- Debt actions ----------
  const addDebt = (debt: Omit<DebtItem, 'id' | 'settled' | 'status'>) => {
    const id = `debt_${Date.now()}`;
    const newDebt: DebtItem = { ...debt, id, settled: 0, status: 'open' };
    setDebts((prev) => [...prev, newDebt]);
    showToast(`Added debt for ${debt.personName}`);
    (async () => {
      const { error } = await getSupabase().from('debts').insert({
        id, person_name: debt.personName, person_phone: debt.personPhone || null,
        direction: debt.direction, amount: debt.amount, settled: 0,
        reason: debt.reason || null, date: debt.date, status: 'open',
        remind_on: null,
      });
      if (error && mounted.current) { setSyncError(error.message); setDebts((prev) => prev.filter((d) => d.id !== id)); showToast('Could not save'); }
      else if (mounted.current) setSyncError(null);
    })();
  };

  const settleDebt = (id: string) => {
    const debt = debts.find((d) => d.id === id);
    if (!debt) return;
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'settled', settled: d.amount } : d)));
    showToast(`Settled with ${debt.personName}`);
    (async () => {
      const { error } = await getSupabase().from('debts').update({ status: 'settled', settled: debt.amount }).eq('id', id);
      if (error && mounted.current) { setSyncError(error.message); loadAll(); }
      else if (mounted.current) setSyncError(null);
    })();
  };

  return (
    <AppContext.Provider
      value={{
        authStage, setAuthStage,
        accounts, cards, transactions, upcomingBills,
        goals, loans, investments, sips, insurance, subscriptions, debts,
        notifications, insights, settings,
        loading, syncError, refresh,
        balanceHidden, setBalanceHidden,
        toastMessage, showToast, hideToast,
        addTransaction, deleteTransaction, markBillPaid,
        addAccount, addCard, addUpcomingBill,
        addGoal, updateGoal, deleteGoal,
        markNotificationRead, dismissInsight, updateSettings,
        addDebt, settleDebt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
