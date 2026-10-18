import { Router, Response } from 'express';
import { z } from 'zod';
import { Db } from '../db/client';
import { accounts, creditCards, goals, debts } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthedRequest, errorShape } from './auth';

/** Generic owner-scoped CRUD factory — every query is pinned to req.userId. */
const owned =
  <T extends { userId: any }>(table: T, label: string) => (db: Db) => {
    const r = Router();

    r.get('/', async (req: AuthedRequest, res: Response) => {
      const rows = await db.select().from(table as any).where(eq((table as any).userId, req.userId));
      res.json({ items: rows });
    });

    r.post('/', async (req: AuthedRequest, res: Response) => {
      const body = { ...req.body, userId: req.userId };
      try {
        const [row] = (await db.insert(table as any).values(body).returning()) as any[];
        res.status(201).json(row);
      } catch (err: any) {
        res.status(400).json(errorShape('validation_failed', `Invalid ${label}`, err?.message));
      }
    });

    r.patch('/:id', async (req: AuthedRequest, res: Response) => {
      const { id } = req.params;
      const updates = { ...req.body };
      delete updates.id; delete updates.userId;
      const [row] = (await db
        .update(table as any)
        .set(updates)
        .where(and(eq((table as any).id, id), eq((table as any).userId, req.userId)))
        .returning()) as any[];
      if (!row) return res.status(404).json(errorShape('not_found', `${label} not found`));
      res.json(row);
    });

    r.delete('/:id', async (req: AuthedRequest, res: Response) => {
      const { id } = req.params;
      const [row] = (await db
        .delete(table as any)
        .where(and(eq((table as any).id, id), eq((table as any).userId, req.userId)))
        .returning()) as any[];
      if (!row) return res.status(404).json(errorShape('not_found', `${label} not found`));
      res.json({ ok: true });
    });

    return r;
  };

export const accountsRouter = owned(accounts, 'Account');
export const cardsRouter = owned(creditCards, 'Card');
export const goalsRouter = owned(goals, 'Goal');
export const debtsRouter = owned(debts, 'Debt');
