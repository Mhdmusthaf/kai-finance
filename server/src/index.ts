import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import { randomUUID } from 'crypto';
import { createDb } from './db/client';
import { loadEnv } from './env';
import { authRouter, requireAuth, AuthedRequest } from './routes/auth';
import { meRouter } from './routes/me';
import { accountsRouter, cardsRouter, goalsRouter, debtsRouter } from './routes/objects';
import { transactionsRouter } from './routes/transactions';
import { dashboardRouter } from './routes/dashboard';

const env = loadEnv();
const log = pino({ level: process.env.LOG_LEVEL || 'info', redact: ['req.headers.authorization', 'req.body.code', 'req.body.refreshToken'] });

const { pool, db } = env.DATABASE_URL.startsWith('pglite')
  ? ({} as any) // PGlite path is only used by the test harness, never by `npm start`
  : createDb(env.DATABASE_URL);

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

// strict CORS allow-list
const origins = env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : false, credentials: false }));

// request id + logging
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).id = randomUUID();
  res.setHeader('X-Request-Id', (req as any).id);
  next();
});
app.use(pinoHttpLite(log));

// rate limits
const globalLimiter = rateLimit({ windowMs: 60_000, max: 300, standardHeaders: true });
const authLimiter = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true });
app.use('/v1/auth', authLimiter);
app.use(globalLimiter);

// health (no auth)
app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.get('/ready', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(503).json({ ok: false });
  }
});

// versioned API
const v1 = express.Router();
v1.use('/auth', authRouter(db));
v1.use(requireAuth(db)); // everything below requires a valid access token
v1.use('/me', meRouter(db));
v1.use('/accounts', accountsRouter(db));
v1.use('/cards', cardsRouter(db));
v1.use('/goals', goalsRouter(db));
v1.use('/debts', debtsRouter(db));
v1.use('/transactions', transactionsRouter(db));
v1.use('/dashboard', dashboardRouter(db));
app.use('/v1', v1);

// central error handler — never leak stacks
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const reqId = (req as any).id;
  log.error({ err: err?.message, reqId }, 'unhandled_error');
  if (res.headersSent) return;
  res.status(500).json({ error: { code: 'internal_error', message: 'Something went wrong', reqId } });
});

const server = app.listen(env.PORT, () => {
  log.info({ port: env.PORT, env: env.NODE_ENV }, 'kai-api-started');
});

// graceful shutdown
const shutdown = () => {
  server.close(() => pool?.end?.());
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function pinoHttpLite(logger: pino.Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      logger.info({ method: req.method, url: req.url, status: res.statusCode, ms: Date.now() - start, reqId: (req as any).id }, 'http');
    });
    next();
  };
}
