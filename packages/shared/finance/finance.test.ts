import {
  calculateTotalBalance,
  calculateCardUtilisation,
  calculateEmi,
  calculateNetWorth,
  calculateCanIAfford,
} from './index';

describe('KAI Financial Engine Unit Tests', () => {
  test('calculateTotalBalance ignores archived accounts', () => {
    const accounts: any = [
      { id: '1', name: 'HDFC', balance: 8000000, archived: false },
      { id: '2', name: 'SBI', balance: 2000000, archived: false },
      { id: '3', name: 'Old Account', balance: 500000, archived: true },
    ];
    expect(calculateTotalBalance(accounts)).toBe(10000000); // ₹1,00,000
  });

  test('calculateCardUtilisation returns correct ratio between 0 and 1', () => {
    expect(calculateCardUtilisation(1824000, 7500000)).toBeCloseTo(0.2432);
    expect(calculateCardUtilisation(8000000, 7500000)).toBe(1);
    expect(calculateCardUtilisation(0, 7500000)).toBe(0);
  });

  test('calculateEmi computes exact monthly EMI in paise', () => {
    // Principal ₹6,00,000 (60,000,000 paise), 9% rate, 48 months
    const emi = calculateEmi(60000000, 9.0, 48);
    // Standard EMI formula yields ₹14,931 (1,493,100 paise)
    expect(Math.round(emi / 100)).toBe(14931);
  });

  test('calculateNetWorth correctly sums assets and subtracts liabilities', () => {
    const accounts: any = [{ balance: 13050000, archived: false }]; // ₹1,30,500
    const investments: any = [{ currentValue: 48630000 }];           // ₹4,86,300
    const otherAssets: any = [{ value: 224595000 }];                 // ₹22,45,950
    const owedToMe = 450000;                                         // ₹4,500
    const cardOutstanding = 2945000;                                 // ₹29,450
    const loanOutstanding = 36980000;                                // ₹3,69,800
    const iOwe = 0;

    const res = calculateNetWorth(
      accounts,
      investments,
      otherAssets,
      owedToMe,
      cardOutstanding,
      loanOutstanding,
      iOwe
    );

    expect(res.totalAssets).toBe(286725000);
    expect(res.totalLiabilities).toBe(39925000);
    expect(res.netWorth).toBe(246800000); // ₹24,68,000
  });

  test('calculateCanIAfford gives accurate spending advice based on safety buffer', () => {
    const currentBalance = 10000000; // ₹1,00,000
    const upcomingOutflows = 2500000; // ₹25,000
    const safetyBuffer = 4000000;     // ₹40,000

    // Afford ₹15,000 (safeToSpend = 100k - 25k - 40k = 35k)
    const res1 = calculateCanIAfford(currentBalance, upcomingOutflows, safetyBuffer, 1500000);
    expect(res1.canAfford).toBe('yes');

    // Afford ₹50,000 (dips into safety buffer)
    const res2 = calculateCanIAfford(currentBalance, upcomingOutflows, safetyBuffer, 5000000);
    expect(res2.canAfford).toBe('careful');

    // Afford ₹80,000 (exceeds total available balance - upcoming)
    const res3 = calculateCanIAfford(currentBalance, upcomingOutflows, safetyBuffer, 8000000);
    expect(res3.canAfford).toBe('not_now');
  });
});
