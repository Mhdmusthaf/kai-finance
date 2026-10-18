import { Router, Response } from 'express';
import { Db } from '../db/client';
import {
  accounts, creditCards, transactions, upcomingEvents, goals, insights, notifications,
} from '../db/schema';
import { and, desc, eq, isNull, sql, gte } from 'drizzle-orm';
import { AuthedRequest } from './auth';
import { COUNTS_AS_SPENDING } from '../db/schema';

/** Single request powering Home — replaces the 14-query waterfall (spec 8). */
export const dashboardRouter = (db: Db) => {
  const r = Router();

  r.get('/summary', async (req: AuthedRequest, res: Response) => {
    const userId = req.userId!;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [accs, cds, recent, upcoming, activeGoals, newInsights, unread] = await Promise.all([
      db.select().from(accounts).where(and(eq(accounts.userId, userId), eq(accounts.archived, false))),
      db.select().from(creditCards).where(and(eq(creditCards.userId, userId), eq(creditCards.archived, false))),
      db.select().from(transactions)
        .where(and(eq(transactions.userId, userId), isNull(transactions.deletedAt)))
        .orderBy(desc(transactions.happenedAt)).limit(8),
      db.select().from(upcomingEvents)
        .where(and(eq(upcomingEvents.userId, userId), eq(upcomingEvents.status, 'upcoming')))
        .orderBy(upcomingEvents.dueDate).limit(5),
      db.select().from(goals)
        .where(and(eq(goals.userId, userId), eq(goals.status, 'active'))).limit(3),
      db.select().from(insights)
        .where(and(eq(insights.userId, userId), isNull(insights.dismissedAt)))
        .orderBy(desc(insights.createdAt)).limit(1),
      db.select({ count: sql<number>`count(*)::int` }).from(notifications)
        .where(and(eq(notifications.userId, userId), isNull(notifications.readAt))),
    ]);

    const [spendRow] = await db
      .select({ total: sql<string>`coalesce(sum(${transactions.amount}), 0)::text` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        isNull(transactions.deletedAt),
        gte(transactions.happenedAt, monthStart),
        sql`${transactions.type} IN ('expense', 'bill_payment', 'subscription_payment')`,
      ));

    const totalBalance = accs.reduce((s, a) => s + a.balance, 0);
    const cardOutstanding = cds.reduce((s, c) => s + c.outstanding, 0);

    res.json({
      totalBalance,
      cardOutstanding,
      monthSpent: Number(spendRow?.total || 0),
      accounts: accs,
      cards: cds,
      recentTransactions: recent,
      upcoming,
      goals: activeGoals,
      topInsight: newInsights[0] || null,
      unreadNotifications: unread[0]?.count || 0,
    });
  });

  return r;
};
