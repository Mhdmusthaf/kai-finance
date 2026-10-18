import { Router, Response } from 'express';
import { z } from 'zod';
import { Db } from '../db/client';
import { transactions, loans } from '../db/schema';
import { eq, and, desc, lt, gt, isNull, sql } from 'drizzle-orm';
import { AuthedRequest, errorShape } from './auth';
import { applyTransactionEffect, reverseTransactionEffect, LoadedTxRow, validateAmount } from '../services/txEffect';
import { txTypeEnum } from '../db/schema';

const TX_TYPES = ['expense', 'income', 'transfer', 'card_payment', 'investment', 'emi_payment', 'insurance_premium', 'subscription_payment', 'bill_payment', 'debt_settlement'] as const;

const createSchema = z.object({
  type: z.enum(TX_TYPES),
  amount: z.number().int().positive(),
  category: z.string().max(80).optional(),
  description: z.string().max(200).optional(),
  happenedAt: z.string().datetime().optional(),
  fromId: z.string().uuid().optional(),
  toId: z.string().uuid().optional(),
  fromType: z.enum(['account', 'card']).optional(),
  debtId: z.string().uuid().optional(),
});

const listSchema = z.object({
  type: z.enum(TX_TYPES).optional(),
  before: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().max(100).optional(),
});

export const transactionsRouter = (db: Db) => {
  const r = Router();

  r.get('/', async (req: AuthedRequest, res: Response) => {
    const parsed = listSchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json(errorShape('validation_failed', 'Invalid query', parsed.error.flatten().fieldErrors));
    const { type, before, limit, search } = parsed.data;
    const userId = req.userId!;

    const conds = [eq(transactions.userId, userId), isNull(transactions.deletedAt)];
    if (type) conds.push(eq(transactions.type, txTypeEnum.enumValues.indexOf(type) >= 0 ? (type as any) : type));
    if (before) conds.push(lt(transactions.happenedAt, new Date(before)));

    let rows;
    if (search) {
      const like = `%${search.toLowerCase()}%`;
      rows = await db
        .select()
        .from(transactions)
        .where(and(...conds, sql`(lower(coalesce(${transactions.description}, '')) LIKE ${like} OR lower(coalesce(${transactions.category}, '')) LIKE ${like})`))
        .orderBy(desc(transactions.happenedAt))
        .limit(limit);
    } else {
      rows = await db
        .select()
        .from(transactions)
        .where(and(...conds))
        .orderBy(desc(transactions.happenedAt))
        .limit(limit);
    }

    res.json({
      items: rows,
      nextCursor: rows.length === limit ? rows[rows.length - 1]?.happenedAt : null,
    });
  });

  r.post('/', async (req: AuthedRequest, res: Response) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(errorShape('validation_failed', 'Invalid body', parsed.error.flatten().fieldErrors));
    const data = parsed.data;
    const userId = req.userId!;
    const happenedAt = data.happenedAt ? new Date(data.happenedAt) : new Date();
    if (happenedAt.getTime() > Date.now() + 86400_000) {
      return res.status(400).json(errorShape('validation_failed', 'happenedAt cannot be in the future'));
    }

    // Map type → effect source/destination
    let fromType: 'account' | 'card' | null = data.fromType ?? null;
    let toType: 'account' | 'card' | null = null;
    if (data.type === 'income') toType = 'account';
    if (data.type === 'transfer') { fromType = 'account'; toType = 'account'; }
    if (data.type === 'card_payment') { fromType = 'account'; toType = 'card'; }

    try {
      const created = await db.transaction(async (tx) => {
        const effectInput = {
          type: data.type,
          amount: data.amount,
          fromType,
          fromId: data.fromId ?? null,
          toType,
          toId: data.toId ?? null,
          debtId: data.debtId ?? null,
        };
        await applyTransactionEffect(tx as any, userId, effectInput);

        const [row] = await tx
          .insert(transactions)
          .values({
            userId,
            type: data.type as any,
            amount: data.amount,
            category: data.category ?? null,
            description: data.description ?? null,
            happenedAt,
            fromType,
            fromId: data.fromId ?? null,
            toType,
            toId: data.toId ?? null,
            source: data.type === 'debt_settlement' ? 'manual' : 'manual',
          })
          .returning();
        return row;
      });
      res.status(201).json(created);
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (msg.includes('INVALID_AMOUNT')) return res.status(400).json(errorShape('invalid_amount', 'Amount must be a positive whole number'));
      if (msg.includes('ACCOUNT_NOT_FOUND') || msg.includes('CARD_NOT_FOUND')) return res.status(404).json(errorShape('not_found', 'Account or card not found'));
      if (msg.includes('DEBT_NOT_FOUND')) return res.status(404).json(errorShape('not_found', 'Debt not found'));
      if (msg.includes('SETTLE_EXCEEDS_DEBT')) return res.status(400).json(errorShape('settle_exceeds_debt', 'Settlement exceeds remaining debt'));
      if (msg.includes('INVALID_TRANSFER')) return res.status(400).json(errorShape('invalid_transfer', 'Transfer needs two different accounts'));
      if (msg.includes('MISSING_SOURCE') || msg.includes('MISSING_DESTINATION')) return res.status(400).json(errorShape('missing_account', 'Choose the account for this entry'));
      throw err;
    }
  });

  r.delete('/:id', async (req: AuthedRequest, res: Response) => {
    const userId = req.userId!;
    const id = req.params.id;
    const deleted = await db.transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId), isNull(transactions.deletedAt)))
        .for('update');
      if (!row) return null;
      await reverseTransactionEffect(tx as any, userId, row as LoadedTxRow);
      await tx.update(transactions).set({ deletedAt: new Date() }).where(eq(transactions.id, id));
      return row.id;
    });
    if (!deleted) return res.status(404).json(errorShape('not_found', 'Transaction not found'));
    res.json({ ok: true, id: deleted });
  });

  return r;
};
