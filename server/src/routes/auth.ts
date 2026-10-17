import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import { Db } from '../db/client';
import { users, otpCodes, refreshTokens, settings, entitlements } from '../db/schema';
import { eq, and, desc, gt, isNull } from 'drizzle-orm';
import { sendOtp } from '../adapters/otp';
import { hashToken, normalizePhone } from '../lib/util';

export interface AuthedRequest extends Request {
  userId?: string;
}

export const errorShape = (code: string, message: string, fields?: any) => ({
  error: { code, message, ...(fields ? { fields } : {}) },
});

const OTP_REQUEST_SCHEMA = z.object({
  phone: z.string().min(10).max(15).regex(/^\+?[0-9]+$/, 'invalid phone'),
});

const OTP_VERIFY_SCHEMA = z.object({
  phone: z.string().min(10).max(15).regex(/^\+?[0-9]+$/, 'invalid phone'),
  code: z.string().length(6),
});

const ACCESS_TTL = Number(process.env.ACCESS_TOKEN_TTL || 900);
const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);

const signAccess = (userId: string) =>
  jwt.sign({ sub: userId, type: 'access' }, process.env.JWT_ACCESS_SECRET!, { expiresIn: ACCESS_TTL });

const signRefresh = (userId: string, jti: string) =>
  jwt.sign({ sub: userId, jti, type: 'refresh' }, process.env.JWT_REFRESH_SECRET!, { expiresIn: REFRESH_TTL_DAYS * 86400 });

const verifyToken = (token: string, secret: string, expectedType: 'access' | 'refresh') => {
  try {
    const payload = jwt.verify(token, secret) as any;
    if (payload.type !== expectedType) return null;
    return payload;
  } catch {
    return null;
  }
};

export const requireAuth = (db: Db) => (req: AuthedRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json(errorShape('unauthorized', 'Missing bearer token'));
  }
  const payload = verifyToken(header.slice(7), process.env.JWT_ACCESS_SECRET!, 'access');
  if (!payload) return res.status(401).json(errorShape('unauthorized', 'Invalid or expired token'));
  req.userId = payload.sub;
  next();
};

export const authRouter = (db: Db) => {
  const r = Router();

  // --- OTP request ---
  r.post('/otp/request', async (req, res) => {
    const parsed = OTP_REQUEST_SCHEMA.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(errorShape('validation_failed', 'Invalid request', parsed.error.flatten().fieldErrors));
    }
    const phone = normalizePhone(parsed.data.phone);

    // Rate limit: max 3 outstanding codes per phone per 15 min
    const recent = await db
      .select({ createdAt: otpCodes.createdAt })
      .from(otpCodes)
      .where(and(eq(otpCodes.phone, phone), gt(otpCodes.createdAt, new Date(Date.now() - 15 * 60_000))));
    if (recent.length >= 3) {
      return res.status(429).json(errorShape('rate_limited', 'Too many OTP requests — try again in a few minutes'));
    }

    // resend cooldown 45s
    const last = await db
      .select({ createdAt: otpCodes.createdAt })
      .from(otpCodes)
      .where(eq(otpCodes.phone, phone))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);
    if (last[0] && Date.now() - last[0].createdAt.getTime() < 45_000) {
      return res.status(429).json(errorShape('rate_limited', 'Please wait before requesting another OTP'));
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await db.insert(otpCodes).values({
      phone,
      codeHash: hashToken(code),
      expiresAt: new Date(Date.now() + 5 * 60_000),
    });

    const result = await sendOtp(phone, code);
    if (!result.ok) {
      return res.status(500).json(errorShape('otp_send_failed', 'Could not send OTP — try again'));
    }
    res.json({ ok: true, provider: result.provider });
  });

  // --- OTP verify → tokens ---
  r.post('/otp/verify', async (req, res) => {
    const parsed = OTP_VERIFY_SCHEMA.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(errorShape('validation_failed', 'Invalid request', parsed.error.flatten().fieldErrors));
    }
    const { phone: rawPhone, code } = parsed.data;
    const phone = normalizePhone(rawPhone);

    const [otpRow] = await db
      .select()
      .from(otpCodes)
      .where(and(eq(otpCodes.phone, phone), isNull(otpCodes.consumedAt)))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (!otpRow || otpRow.expiresAt.getTime() < Date.now()) {
      return res.status(401).json(errorShape('otp_expired', 'Code expired — request a new one'));
    }
    if (otpRow.attempts >= 5) {
      return res.status(429).json(errorShape('otp_locked', 'Too many wrong attempts — request a new code'));
    }
    if (otpRow.codeHash !== hashToken(code)) {
      await db.update(otpCodes).set({ attempts: otpRow.attempts + 1 }).where(eq(otpCodes.id, otpRow.id));
      return res.status(401).json(errorShape('otp_invalid', 'Incorrect code'));
    }

    await db.update(otpCodes).set({ consumedAt: new Date() }).where(eq(otpCodes.id, otpRow.id));

    // find or create user
    let [user] = await db.select().from(users).where(eq(users.phone, phone));
    if (!user) {
      [user] = await db.insert(users).values({ phone, provider: 'phone' }).returning();
      await db.insert(settings).values({ userId: user.id });
      await db.insert(entitlements).values({ userId: user.id });
    }
    if (user.status === 'suspended') {
      return res.status(403).json(errorShape('account_suspended', 'Account suspended — contact support'));
    }

    const refreshJti = crypto.randomUUID();
    const refreshToken = signRefresh(user.id, refreshJti);
    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 86400_000),
    });

    res.json({
      accessToken: signAccess(user.id),
      refreshToken,
      user: { id: user.id, phone: user.phone, name: user.name },
    });
  });

  // --- Refresh rotation ---
  r.post('/refresh', async (req, res) => {
    const token = req.body?.refreshToken;
    if (!token || typeof token !== 'string') {
      return res.status(400).json(errorShape('validation_failed', 'refreshToken required'));
    }
    const payload = verifyToken(token, process.env.JWT_REFRESH_SECRET!, 'refresh');
    if (!payload) return res.status(401).json(errorShape('unauthorized', 'Invalid refresh token'));

    const tokenHash = hashToken(token);
    const [stored] = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));

    if (!stored) {
      // Possible token reuse — revoke all sessions for this user.
      await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.userId, payload.sub));
      return res.status(401).json(errorShape('token_reuse', 'Session expired — please log in again'));
    }
    if (stored.revokedAt) {
      await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.userId, stored.userId));
      return res.status(401).json(errorShape('token_reuse', 'Session expired — please log in again'));
    }
    if (stored.expiresAt.getTime() < Date.now()) {
      return res.status(401).json(errorShape('token_expired', 'Session expired — please log in again'));
    }

    // Rotate
    await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.id, stored.id));
    const newJti = crypto.randomUUID();
    const newRefresh = signRefresh(stored.userId, newJti);
    await db.insert(refreshTokens).values({
      userId: stored.userId,
      tokenHash: hashToken(newRefresh),
      rotatedFrom: stored.id,
      expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 86400_000),
    });

    res.json({ accessToken: signAccess(stored.userId), refreshToken: newRefresh });
  });

  // --- Logout ---
  r.post('/logout', async (req, res) => {
    const token = req.body?.refreshToken;
    if (token && typeof token === 'string') {
      await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.tokenHash, hashToken(token)));
    }
    res.json({ ok: true });
  });

  return r;
};
