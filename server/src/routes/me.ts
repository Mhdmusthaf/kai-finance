import { Router, Response } from 'express';
import { z } from 'zod';
import { Db } from '../db/client';
import { users, settings, entitlements, refreshTokens } from '../db/schema';
import { eq } from 'drizzle-orm';
import { AuthedRequest, errorShape } from './auth';

export const meRouter = (db: Db) => {
  const r = Router();

  r.get('/', async (req: AuthedRequest, res: Response) => {
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!));
    if (!user || user.status !== 'active') return res.status(401).json(errorShape('unauthorized', 'Account unavailable'));
    const [s] = await db.select().from(settings).where(eq(settings.userId, user.id));
    res.json({
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      provider: user.provider,
      settings: s || null,
    });
  });

  r.patch('/', async (req: AuthedRequest, res: Response) => {
    const schema = z.object({ name: z.string().min(1).max(80).optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(errorShape('validation_failed', 'Invalid body', parsed.error.flatten().fieldErrors));
    if (parsed.data.name !== undefined) {
      await db.update(users).set({ name: parsed.data.name }).where(eq(users.id, req.userId!));
    }
    res.json({ ok: true });
  });

  r.patch('/settings', async (req: AuthedRequest, res: Response) => {
    const schema = z.object({
      currency: z.string().length(3).optional(),
      language: z.string().max(10).optional(),
      theme: z.string().max(10).optional(),
      safetyBuffer: z.number().int().min(0).optional(),
      biometricEnabled: z.boolean().optional(),
      autoLockMinutes: z.number().int().min(0).max(60).optional(),
      hideBalances: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(errorShape('validation_failed', 'Invalid body', parsed.error.flatten().fieldErrors));
    const { safetyBuffer, ...rest } = parsed.data;
    const updates: any = { ...rest, updatedAt: new Date() };
    if (safetyBuffer !== undefined) updates.safetyBuffer = safetyBuffer;
    await db.update(settings).set(updates).where(eq(settings.userId, req.userId!));
    res.json({ ok: true });
  });

  r.get('/entitlements', async (req: AuthedRequest, res: Response) => {
    const [e] = await db.select().from(entitlements).where(eq(entitlements.userId, req.userId!));
    res.json(e || { plan: 'free', isPro: false, source: 'none' });
  });

  r.get('/export', async (req: AuthedRequest, res: Response) => {
    const userId = req.userId!;
    const { accounts, creditCards, transactions, goals, debts } = await import('../db/schema');
    const [accs, cds, txs, gls, dts] = await Promise.all([
      db.select().from(accounts).where(eq(accounts.userId, userId)),
      db.select().from(creditCards).where(eq(creditCards.userId, userId)),
      db.select().from(transactions).where(eq(transactions.userId, userId)),
      db.select().from(goals).where(eq(goals.userId, userId)),
      db.select().from(debts).where(eq(debts.userId, userId)),
    ]);
    res.setHeader('Content-Disposition', 'attachment; filename=kai-export.json');
    res.json({ exportedAt: new Date().toISOString(), accounts: accs, cards: cds, transactions: txs, goals: gls, debts: dts });
  });

  r.delete('/', async (req: AuthedRequest, res: Response) => {
    // Hard delete — cascades to all user data via FK ON DELETE CASCADE.
    await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.userId, req.userId!));
    await db.delete(users).where(eq(users.id, req.userId!));
    res.json({ ok: true });
  });

  return r;
};
