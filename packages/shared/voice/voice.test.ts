import { parseAndValidateVoiceResult } from './index';

describe('KAI Voice Parser Contract Unit Tests', () => {
  test('validates simple expense transaction result', () => {
    const mockLlmOutput = {
      transcript: 'Spent 500 on dinner yesterday with HDFC card',
      intent: 'create_transaction',
      transaction: {
        type: 'expense',
        amount: 50000,
        category: 'food_dining',
        happenedAt: '2026-10-03T21:00:00+05:30',
        confidence: 0.95,
      },
      missing: [],
    };

    const res = parseAndValidateVoiceResult(mockLlmOutput);
    expect(res.intent).toBe('create_transaction');
    expect(res.transaction?.amount).toBe(50000);
    expect(res.missing.length).toBe(0);
  });

  test('validates card payment intent is NOT classified as expense', () => {
    const mockLlmOutput = {
      transcript: 'Paid SBI card bill 18,240 from HDFC',
      intent: 'create_transaction',
      transaction: {
        type: 'card_payment',
        amount: 1824000,
        confidence: 0.98,
      },
      missing: [],
    };

    const res = parseAndValidateVoiceResult(mockLlmOutput);
    expect(res.transaction?.type).toBe('card_payment');
  });

  test('identifies essential missing field and single follow-up question', () => {
    const mockLlmOutput = {
      transcript: 'Transferred 10k',
      intent: 'create_transaction',
      missing: ['account'],
      followUpQuestion: 'Which account did you move it to?',
    };

    const res = parseAndValidateVoiceResult(mockLlmOutput);
    expect(res.missing).toContain('account');
    expect(res.followUpQuestion).toBe('Which account did you move it to?');
  });
});
