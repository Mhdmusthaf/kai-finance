import React, { createContext, useContext, useState } from 'react';

export interface TransactionItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number; // in paise or raw rupees
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authStage, setAuthStage] = useState<'splash' | 'onboarding' | 'auth_otp' | 'pin_lock' | 'authenticated'>('splash');
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Accounts initial state
  const [accounts, setAccounts] = useState<BankAccount[]>([
    { id: 'acc_1', title: 'HDFC Savings', subtitle: 'Primary account · •••• 4821', balance: 8230000, icon: 'bank', accountNumber: '4821' },
    { id: 'acc_2', title: 'SBI Savings', subtitle: 'Salary account · •••• 1190', balance: 4820000, icon: 'bank', accountNumber: '1190' },
  ]);

  // Cards initial state
  const [cards, setCards] = useState<CreditCardItem[]>([
    { id: 'card_1', title: 'SBI SimplyClick Card', subtitle: 'Limit ₹75,000 · Due 7 Oct', outstanding: 1824000, limit: 7500000, dueDate: '7 Oct' },
  ]);

  // Upcoming Bills initial state
  const [upcomingBills, setUpcomingBills] = useState<UpcomingBillItem[]>([
    { id: 'bill_1', title: 'Electricity · BESCOM', subtitle: 'Due tomorrow (5 Oct)', amount: 243000, dueDate: '5 Oct', status: 'due', icon: 'bills' },
    { id: 'bill_2', title: 'SBI Bluechip SIP', subtitle: 'Due Oct 5 · HDFC Savings', amount: 500000, dueDate: '5 Oct', status: 'due', icon: 'sip' },
    { id: 'bill_3', title: 'SBI SimplyClick Card Bill', subtitle: 'Due Oct 7 · Min ₹1,824', amount: 1824000, dueDate: '7 Oct', status: 'due', icon: 'card' },
  ]);

  // Transactions initial state
  const [transactions, setTransactions] = useState<TransactionItem[]>([
    {
      id: 'tx_1',
      title: 'Dinner · Truffles',
      subtitle: 'Yesterday, 9:00 pm · HDFC Savings',
      amount: 50000,
      type: 'expense',
      icon: 'expense',
      iconBgColor: '#D8F3E5',
      happenedAt: 'Yesterday, 9:00 pm',
      account: 'HDFC Savings',
      isVoice: true,
    },
    {
      id: 'tx_2',
      title: 'Big Basket',
      subtitle: 'Oct 3, 1:00 pm · HDFC Millennia',
      amount: 342000,
      type: 'expense',
      icon: 'card',
      iconBgColor: '#D8F3E5',
      happenedAt: 'Oct 3, 1:00 pm',
      account: 'HDFC Millennia',
    },
    {
      id: 'tx_3',
      title: 'Salary · Acme Corp',
      subtitle: 'Oct 1, 9:00 am · SBI Savings',
      amount: 14000000,
      type: 'income',
      amountColor: 'deepMint',
      icon: 'income',
      iconBgColor: '#D8F3E5',
      happenedAt: 'Oct 1, 9:00 am',
      account: 'SBI Savings',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const hideToast = () => {
    setToastMessage(null);
  };

  const addTransaction = (newTx: Omit<TransactionItem, 'id' | 'happenedAt'>) => {
    const id = `tx_${Date.now()}`;
    const timeStr = 'Just now';
    const createdTx: TransactionItem = {
      ...newTx,
      id,
      happenedAt: timeStr,
    };

    setTransactions((prev) => [createdTx, ...prev]);

    // Update bank account balances
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

    showToast(`Added ₹${Math.round(newTx.amount / 100).toLocaleString('en-IN')} ${newTx.title}`);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    showToast('Transaction deleted');
  };

  const markBillPaid = (id: string) => {
    setUpcomingBills((prev) =>
      prev.map((bill) => {
        if (bill.id === id) {
          // Deduct from primary account
          setAccounts((accs) =>
            accs.map((a, idx) => (idx === 0 ? { ...a, balance: Math.max(0, a.balance - bill.amount) } : a))
          );
          showToast(`Paid ₹${Math.round(bill.amount / 100).toLocaleString('en-IN')} for ${bill.title}`);
          return { ...bill, status: 'paid' };
        }
        return bill;
      })
    );
  };

  const addAccount = (acc: Omit<BankAccount, 'id'>) => {
    const newAcc: BankAccount = { ...acc, id: `acc_${Date.now()}` };
    setAccounts((prev) => [...prev, newAcc]);
    showToast(`Added ${acc.title}`);
  };

  const addCard = (card: Omit<CreditCardItem, 'id'>) => {
    const newCard: CreditCardItem = { ...card, id: `card_${Date.now()}` };
    setCards((prev) => [...prev, newCard]);
    showToast(`Added ${card.title}`);
  };

  const addUpcomingBill = (bill: Omit<UpcomingBillItem, 'id' | 'status'>) => {
    const newBill: UpcomingBillItem = { ...bill, id: `bill_${Date.now()}`, status: 'due' };
    setUpcomingBills((prev) => [newBill, ...prev]);
    showToast(`Scheduled bill for ${bill.title}`);
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
