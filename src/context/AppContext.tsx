import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getSupabase } from '../lib/supabase';

export interface TransactionItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number; // in paise
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

interface AppContextType {
  // Auth state
  authStage: 'splash' | 'onboarding' | 'auth_otp' | 'pin_lock' | 'authenticated';
  setAuthStage: (stage: 'splash' | 'onboarding' | 'auth_otp' | 'pin_lock' | 'authenticated') => void;

  // Balance & Financials
  accounts: BankAccount[];
  cards: CreditCardItem[];
  transactions: TransactionItem[];
  upcomingBills: UpcomingBillItem[];

  // Loading / error state for persistence
  loading: boolean;
  syncError: string | null;

  // UI State
  balanceHidden: boolean;
  setBalanceHidden: (hidden: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;

  // Core Actions
  addTransaction: (tx: Omit<TransactionItem, 'id' | 'happenedAt'>) => void;
  deleteTransaction: (id: string) => void;
  markBillPaid: (id: string) => void;
  addAccount: (acc: Omit<BankAccount, 'id'>) => void;
  addCard: (card: Omit<CreditCardItem, 'id'>) => void;
  addUpcomingBill: (bill: Omit<UpcomingBillItem, 'id' | 'status'>) => void;
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
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setSyncError(null);
    try {
      const supabase = getSupabase();
      const [accRes, cardRes, txRes, billRes] = await Promise.all([
        supabase.from('accounts').select('*').order('sort_order', { ascending: true }),
        supabase.from('cards').select('*'),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('upcoming_bills').select('*'),
      ]);

      const firstError = accRes.error || cardRes.error || txRes.error || billRes.error;
      if (firstError) throw new Error(firstError.message);

      if (mounted.current) {
        setAccounts(
          (accRes.data || []).map((a: any) => ({
            id: a.id,
            title: a.title,
            subtitle: a.subtitle,
            balance: Number(a.balance),
            icon: a.icon,
            accountNumber: a.account_number,
          }))
        );
        setCards(
          (cardRes.data || []).map((c: any) => ({
            id: c.id,
            title: c.title,
            subtitle: c.subtitle,
            outstanding: Number(c.outstanding),
            limit: Number(c.credit_limit),
            dueDate: c.due_date,
          }))
        );
        setTransactions(
          (txRes.data || []).map((t: any) => ({
            id: t.id,
            title: t.title,
            subtitle: t.subtitle,
            amount: Number(t.amount),
            type: t.type,
            amountColor: t.amount_color || undefined,
            icon: t.icon,
            iconBgColor: t.icon_bg_color,
            happenedAt: t.happened_at,
            account: t.account,
            isVoice: t.is_voice,
          }))
        );
        setUpcomingBills(
          (billRes.data || []).map((b: any) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            amount: Number(b.amount),
            dueDate: b.due_date,
            status: b.status,
            icon: b.icon,
          }))
        );
      }
    } catch (err: any) {
      if (mounted.current) {
        setSyncError(err?.message || 'Could not load your data');
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const hideToast = () => {
    setToastMessage(null);
  };

  const addTransaction = (newTx: Omit<TransactionItem, 'id' | 'happenedAt'>) => {
    const id = `tx_${Date.now()}`;
    const createdTx: TransactionItem = {
      ...newTx,
      id,
      happenedAt: 'Just now',
    };

    // Optimistic update
    setTransactions((prev) => [createdTx, ...prev]);
    if (newTx.type === 'expense') {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.title === newTx.account || acc.id === 'acc_1'
            ? { ...acc, balance: Math.max(0, acc.balance - newTx.amount) }
            : acc
        )
      );
    } else if (newTx.type === 'income') {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.title === newTx.account || acc.id === 'acc_2'
            ? { ...acc, balance: acc.balance + newTx.amount }
            : acc
        )
      );
    }
    showToast(`Added ${formatPaise(newTx.amount)} ${newTx.title}`);

    // Persist
    (async () => {
      const { error } = await getSupabase().from('transactions').insert({
        id,
        title: newTx.title,
        subtitle: newTx.subtitle,
        amount: newTx.amount,
        type: newTx.type,
        amount_color: newTx.amountColor ?? null,
        icon: newTx.icon,
        icon_bg_color: newTx.iconBgColor,
        happened_at: createdTx.happenedAt,
        account: newTx.account,
        is_voice: !!newTx.isVoice,
      });
      if (error) {
        // Roll back optimistic updates by reloading the saved state from the database
        if (mounted.current) {
          setSyncError(error.message);
          showToast('Could not save — check your connection');
          loadAll();
        }
      } else if (mounted.current) {
        setSyncError(null);
      }
    })();
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    showToast('Transaction deleted');

    (async () => {
      const { error } = await getSupabase().from('transactions').delete().eq('id', id);
      if (error && mounted.current) {
        setSyncError(error.message);
        showToast('Could not delete — check your connection');
        loadAll();
      } else if (mounted.current) {
        setSyncError(null);
      }
    })();
  };

  const markBillPaid = (id: string) => {
    const bill = upcomingBills.find((b) => b.id === id);
    if (!bill) return;

    setUpcomingBills((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'paid' } : b)));
    setAccounts((accs) =>
      accs.map((a, idx) => (idx === 0 ? { ...a, balance: Math.max(0, a.balance - bill.amount) } : a))
    );
    showToast(`Paid ${formatPaise(bill.amount)} for ${bill.title}`);

    (async () => {
      const { error } = await getSupabase().from('upcoming_bills').update({ status: 'paid' }).eq('id', id);
      if (error && mounted.current) {
        setSyncError(error.message);
        showToast('Could not update — check your connection');
        loadAll();
      } else if (mounted.current) {
        setSyncError(null);
      }
    })();
  };

  const addAccount = (acc: Omit<BankAccount, 'id'>) => {
    const id = `acc_${Date.now()}`;
    setAccounts((prev) => [...prev, { ...acc, id }]);
    showToast(`Added ${acc.title}`);

    (async () => {
      const { error } = await getSupabase().from('accounts').insert({
        id,
        title: acc.title,
        subtitle: acc.subtitle,
        balance: acc.balance,
        icon: acc.icon,
        account_number: acc.accountNumber,
        sort_order: 99,
      });
      if (error && mounted.current) {
        setSyncError(error.message);
        setAccounts((prev) => prev.filter((a) => a.id !== id));
        showToast('Could not save account — check your connection');
      } else if (mounted.current) {
        setSyncError(null);
      }
    })();
  };

  const addCard = (card: Omit<CreditCardItem, 'id'>) => {
    const id = `card_${Date.now()}`;
    setCards((prev) => [...prev, { ...card, id }]);
    showToast(`Added ${card.title}`);

    (async () => {
      const { error } = await getSupabase().from('cards').insert({
        id,
        title: card.title,
        subtitle: card.subtitle,
        outstanding: card.outstanding,
        credit_limit: card.limit,
        due_date: card.dueDate,
      });
      if (error && mounted.current) {
        setSyncError(error.message);
        setCards((prev) => prev.filter((c) => c.id !== id));
        showToast('Could not save card — check your connection');
      } else if (mounted.current) {
        setSyncError(null);
      }
    })();
  };

  const addUpcomingBill = (bill: Omit<UpcomingBillItem, 'id' | 'status'>) => {
    const id = `bill_${Date.now()}`;
    setUpcomingBills((prev) => [{ ...bill, id, status: 'due' }, ...prev]);
    showToast(`Scheduled bill for ${bill.title}`);

    (async () => {
      const { error } = await getSupabase().from('upcoming_bills').insert({
        id,
        title: bill.title,
        subtitle: bill.subtitle,
        amount: bill.amount,
        due_date: bill.dueDate,
        status: 'due',
        icon: bill.icon,
      });
      if (error && mounted.current) {
        setSyncError(error.message);
        setUpcomingBills((prev) => prev.filter((b) => b.id !== id));
        showToast('Could not save bill — check your connection');
      } else if (mounted.current) {
        setSyncError(null);
      }
    })();
  };

  return (
    <AppContext.Provider
      value={{
        authStage,
        setAuthStage,
        accounts,
        cards,
        transactions,
        upcomingBills,
        loading,
        syncError,
        balanceHidden,
        setBalanceHidden,
        toastMessage,
        showToast,
        hideToast,
        addTransaction,
        deleteTransaction,
        markBillPaid,
        addAccount,
        addCard,
        addUpcomingBill,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
