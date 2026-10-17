import { Db } from '../db/client';
import { accounts, creditCards, transactions, debts } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * applyTransactionEffect — the ONE place where balances change.
 *
 * Runs inside a single DB transaction with row locks (SELECT ... FOR UPDATE).
 * Effects are exactly reversible: reverseEffect() computes the inverse.
 *
 * Rules (COUNTS_AS_SPENDING handled at read/report time, not by balance):
 * - expense:              from account balance -amount | from card outstanding +amount
 * - income:               to account balance +amount
 * - transfer:             from -amount, to +amount (both accounts)
 * - card_payment:         from account -amount AND card outstanding -amount
 * - investment:           from account -amount (money moves to investments, tracked there)
 * - emi_payment:          from account -amount, loan outstanding -amount
 * - insurance_premium:    from account -amount
 * - subscription_payment: from account -amount
 * - bill_payment:         from account -amount
 * - debt_settlement:      from/to account ±amount, debt settled +amount
 *
 * NO clamping (no Math.max(0, ...)) — negative balances are allowed and surfaced
 * by callers as a warning. Amount must be a positive integer (paise).
 */

export interface TxEffectInput {
  type: string;
  amount: number;
  fromType?: 'account' | 'card' | null;
  fromId?: string | null;
  toType?: 'account' | null;
  toId?: string | null;
  debtId?: string | null;
}

export interface LoadedTxRow {
  id: string;
  type: string;
  amount: number;
  fromType: string | null;
  fromId: string | null;
  toType: string | null;
  toId: string | null;
  debtId?: string | null;
}

export const validateAmount = (amount: unknown): number | null => {
  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) return null;
  if (amount > 9_007_199_254_740_991) return null; // Number.MAX_SAFE_INTEGER overflow guard
  return amount;
};

/** Lock + fetch an account owned by user, or null. */
const lockAccount = async (db: Db, userId: string, accountId: string) => {
  const rows = await db.execute(
    sql`SELECT id, balance FROM accounts WHERE id = ${accountId} AND user_id = ${userId} FOR UPDATE`,
  );
  return (rows as any).rows?.[0] || null;
};

/** Lock + fetch a card owned by user, or null. */
const lockCard = async (db: Db, userId: string, cardId: string) => {
  const rows = await db.execute(
    sql`SELECT id, outstanding, credit_limit FROM credit_cards WHERE id = ${cardId} AND user_id = ${userId} FOR UPDATE`,
  );
  return (rows as any).rows?.[0] || null;
};

/**
 * Apply the balance effect of a transaction. Caller must already have opened a
 * db.transaction. `txIds` references rows created in the same tx.
 */
export async function applyTransactionEffect(db: Db, userId: string, input: TxEffectInput): Promise<void> {
  const amount = validateAmount(input.amount);
  if (amount === null) throw new Error('INVALID_AMOUNT');
  const { type } = input;

  switch (type) {
    case 'expense': {
      if (input.fromType === 'card' && input.fromId) {
        const card = await lockCard(db, userId, input.fromId);
        if (!card) throw new Error('CARD_NOT_FOUND');
        await db.execute(sql`UPDATE credit_cards SET outstanding = outstanding + ${amount} WHERE id = ${card.id}`);
      } else if (input.fromType === 'account' && input.fromId) {
        const acc = await lockAccount(db, userId, input.fromId);
        if (!acc) throw new Error('ACCOUNT_NOT_FOUND');
        await db.execute(sql`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${acc.id}`);
      } else {
        throw new Error('MISSING_SOURCE');
      }
      return;
    }

    case 'income': {
      if (input.toType === 'account' && input.toId) {
        const acc = await lockAccount(db, userId, input.toId);
        if (!acc) throw new Error('ACCOUNT_NOT_FOUND');
        await db.execute(sql`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${acc.id}`);
      } else {
        throw new Error('MISSING_DESTINATION');
      }
      return;
    }

    case 'transfer': {
      if (!input.fromId || !input.toId || input.fromId === input.toId) throw new Error('INVALID_TRANSFER');
      const from = await lockAccount(db, userId, input.fromId);
      if (!from) throw new Error('ACCOUNT_NOT_FOUND');
      const to = await lockAccount(db, userId, input.toId);
      if (!to) throw new Error('ACCOUNT_NOT_FOUND');
      await db.execute(sql`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${from.id}`);
      await db.execute(sql`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${to.id}`);
      return;
    }

    case 'card_payment': {
      if (!input.fromId || !input.toId) throw new Error('INVALID_CARD_PAYMENT');
      const acc = await lockAccount(db, userId, input.fromId);
      if (!acc) throw new Error('ACCOUNT_NOT_FOUND');
      const card = await lockCard(db, userId, input.toId);
      if (!card) throw new Error('CARD_NOT_FOUND');
      await db.execute(sql`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${acc.id}`);
      // Outstanding floors at 0 for overpayment, and the excess is a credit balance.
      await db.execute(
        sql`UPDATE credit_cards SET outstanding = GREATEST(0, outstanding - ${amount}) WHERE id = ${card.id}`,
      );
      return;
    }

    case 'emi_payment': {
      if (!input.fromId) throw new Error('MISSING_SOURCE');
      const acc = await lockAccount(db, userId, input.fromId);
      if (!acc) throw new Error('ACCOUNT_NOT_FOUND');
      await db.execute(sql`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${acc.id}`);
      // loan outstanding decremented in route (loan lock + status update)
      return;
    }

    case 'investment':
    case 'insurance_premium':
    case 'subscription_payment':
    case 'bill_payment': {
      if (!input.fromId) throw new Error('MISSING_SOURCE');
      const acc = await lockAccount(db, userId, input.fromId);
      if (!acc) throw new Error('ACCOUNT_NOT_FOUND');
      await db.execute(sql`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${acc.id}`);
      return;
    }

    case 'debt_settlement': {
      if (!input.debtId) throw new Error('MISSING_DEBT');
      const rows = await db.execute(
        sql`SELECT id, direction, amount, settled FROM debts WHERE id = ${input.debtId} AND user_id = ${userId} FOR UPDATE`,
      );
      const debt = (rows as any).rows?.[0];
      if (!debt) throw new Error('DEBT_NOT_FOUND');
      const newSettled = Number(debt.settled) + amount;
      if (newSettled > Number(debt.amount)) throw new Error('SETTLE_EXCEEDS_DEBT');
      await db.execute(
        sql`UPDATE debts SET settled = ${newSettled}, status = ${newSettled >= Number(debt.amount) ? 'settled' : 'open'} WHERE id = ${debt.id}`,
      );
      // Movement through account: i_owe → pay out; owed_to_me → receive
      if (input.fromId && debt.direction === 'i_owe') {
        const acc = await lockAccount(db, userId, input.fromId);
        if (!acc) throw new Error('ACCOUNT_NOT_FOUND');
        await db.execute(sql`UPDATE accounts SET balance = balance - ${amount} WHERE id = ${acc.id}`);
      }
      if (input.toId && debt.direction === 'owed_to_me') {
        const acc = await lockAccount(db, userId, input.toId);
        if (!acc) throw new Error('ACCOUNT_NOT_FOUND');
        await db.execute(sql`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${acc.id}`);
      }
      return;
    }

    default:
      throw new Error(`UNKNOWN_TX_TYPE:${type}`);
  }
}

/** Compute the exact inverse effect input for reversal (edit/delete). */
export function reverseEffectInput(row: LoadedTxRow): TxEffectInput {
  const flip = (t?: string | null) => (t === 'account' ? 'account' : t === 'card' ? 'card' : null);
  switch (row.type) {
    case 'expense':
      return { type: 'expense', amount: row.amount, fromType: flip(row.fromType), fromId: row.fromId };
    case 'income':
      return { type: 'income', amount: row.amount, toType: 'account', toId: row.toId };
    case 'transfer':
      // reverse: move back
      return { type: 'transfer', amount: row.amount, fromType: 'account', fromId: row.toId, toType: 'account', toId: row.fromId };
    case 'card_payment':
      return { type: 'card_payment', amount: row.amount, fromType: 'account', fromId: row.toId, toType: 'card', toId: row.fromId };
    case 'investment':
    case 'insurance_premium':
    case 'subscription_payment':
    case 'bill_payment':
    case 'emi_payment':
      // reversal credits the money back to source account
      return { type: 'income', amount: row.amount, toType: 'account', toId: row.fromId };
    case 'debt_settlement':
      return { type: 'debt_settlement', amount: row.amount, debtId: row.debtId, fromType: null, fromId: null, toType: null, toId: null };
    default:
      throw new Error(`UNKNOWN_TX_TYPE:${row.type}`);
  }
}

/** Reversal special-cases that can't reuse applyTransactionEffect directly. */
export async function reverseTransactionEffect(db: Db, userId: string, row: LoadedTxRow): Promise<void> {
  if (row.type === 'card_payment') {
    // give money back to account, put outstanding back on card
    const acc = await lockAccount(db, userId, row.fromId!);
    if (!acc) throw new Error('ACCOUNT_NOT_FOUND');
    const card = await lockCard(db, userId, row.toId!);
    if (!card) throw new Error('CARD_NOT_FOUND');
    await db.execute(sql`UPDATE accounts SET balance = balance + ${row.amount} WHERE id = ${acc.id}`);
    await db.execute(sql`UPDATE credit_cards SET outstanding = outstanding + ${row.amount} WHERE id = ${card.id}`);
    return;
  }
  if (row.type === 'debt_settlement') {
    const rows = await db.execute(
      sql`SELECT id, direction, settled FROM debts WHERE id = ${row.debtId} AND user_id = ${userId} FOR UPDATE`,
    );
    const debt = (rows as any).rows?.[0];
    if (!debt) throw new Error('DEBT_NOT_FOUND');
    const newSettled = Math.max(0, Number(debt.settled) - row.amount);
    await db.execute(
      sql`UPDATE debts SET settled = ${newSettled}, status = ${newSettled === 0 ? 'open' : 'open'} WHERE id = ${debt.id}`,
    );
    if (row.fromId && debt.direction === 'i_owe') {
      const acc = await lockAccount(db, userId, row.fromId);
      if (acc) await db.execute(sql`UPDATE accounts SET balance = balance + ${row.amount} WHERE id = ${acc.id}`);
    }
    if (row.toId && debt.direction === 'owed_to_me') {
      const acc = await lockAccount(db, userId, row.toId);
      if (acc) await db.execute(sql`UPDATE accounts SET balance = balance - ${row.amount} WHERE id = ${acc.id}`);
    }
    return;
  }
  await applyTransactionEffect(db, userId, reverseEffectInput(row));
}
