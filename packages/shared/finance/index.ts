import { COUNTS_AS_SPENDING, COUNTS_AS_INCOME, Paise, Transaction, Account, CreditCard, Loan } from '../../../shared/types';

export function calculateTotalBalance(accounts: Account[]): Paise {
  return accounts
    .filter((acc) => !acc.archived)
    .reduce((sum, acc) => sum + acc.balance, 0);
}

export function calculateCardUtilisation(outstanding: Paise, limit: Paise): number {
  if (limit <= 0) return 0;
  return Math.min(1, Math.max(0, outstanding / limit));
}

/**
 * EMI calculation formula: P · r · (1+r)^n / ((1+r)^n − 1)
 * r = annualRate / 12 / 100
 */
export function calculateEmi(principal: Paise, annualRatePct: number, tenureMonths: number): Paise {
  if (annualRatePct <= 0 || tenureMonths <= 0) {
    return Math.round(principal / (tenureMonths || 1));
  }
  const r = annualRatePct / 12 / 100;
  const num = principal * r * Math.pow(1 + r, tenureMonths);
  const den = Math.pow(1 + r, tenureMonths) - 1;
  return Math.round(num / den);
}

export interface NetWorthBreakdown {
  totalAssets: Paise;
  totalLiabilities: Paise;
  netWorth: Paise;
}

export function calculateNetWorth(
  accounts: Account[],
  investments: { currentValue: Paise }[],
  otherAssets: { value: Paise }[],
  owedToMeOpen: Paise,
  cardOutstanding: Paise,
  loanOutstanding: Paise,
  iOweOpen: Paise
): NetWorthBreakdown {
  const accountTotal = accounts.filter((a) => !a.archived).reduce((s, a) => s + a.balance, 0);
  const invTotal = investments.reduce((s, i) => s + i.currentValue, 0);
  const otherTotal = otherAssets.reduce((s, a) => s + a.value, 0);

  const totalAssets = accountTotal + invTotal + otherTotal + owedToMeOpen;
  const totalLiabilities = cardOutstanding + loanOutstanding + iOweOpen;
  const netWorth = totalAssets - totalLiabilities;

  return { totalAssets, totalLiabilities, netWorth };
}

export interface CanIAffordResult {
  canAfford: 'yes' | 'careful' | 'not_now';
  safeToSpend: Paise;
  projectedRemaining: Paise;
  explanation: string;
}

export function calculateCanIAfford(
  currentBalance: Paise,
  upcomingOutflows: Paise,
  safetyBuffer: Paise,
  cost: Paise
): CanIAffordResult {
  const safeToSpend = currentBalance - upcomingOutflows - safetyBuffer;
  const projectedRemaining = safeToSpend - cost;

  if (projectedRemaining >= 0) {
    return {
      canAfford: 'yes',
      safeToSpend,
      projectedRemaining,
      explanation: `You can afford this. You will still have ₹${Math.round(projectedRemaining / 100).toLocaleString('en-IN')} remaining above your safety buffer.`,
    };
  } else if (projectedRemaining >= -safetyBuffer * 0.5) {
    return {
      canAfford: 'careful',
      safeToSpend,
      projectedRemaining,
      explanation: `Be careful. This will dip into your safety buffer by ₹${Math.round(Math.abs(projectedRemaining) / 100).toLocaleString('en-IN')}.`,
    };
  } else {
    return {
      canAfford: 'not_now',
      safeToSpend,
      projectedRemaining,
      explanation: `Not recommended right now. You have ₹${Math.round(upcomingOutflows / 100).toLocaleString('en-IN')} in committed upcoming bills.`,
    };
  }
}
