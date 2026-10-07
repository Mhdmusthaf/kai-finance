import express, { Request, Response } from 'express';
import cors from 'cors';
import { db, initDatabase } from './db';
import { seedDatabase } from './seed';
import {
  calculateTotalBalance,
  calculateNetWorth,
  calculateCanIAfford,
} from '../../packages/shared/finance';
import { parseAndValidateVoiceResult } from '../../packages/shared/voice';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Database & Auto-seed
initDatabase();
seedDatabase();

// Root Welcome Route
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'KAI — Your Money OS (Server API v1)',
    documentation: 'https://github.com/kai-money/kai',
    endpoints: {
      health: '/health',
      seed: '/v1/seed',
      dashboardSummary: '/v1/dashboard/summary',
      userProfile: '/v1/me',
      accounts: '/v1/accounts',
      creditCards: '/v1/cards',
      transactions: '/v1/transactions',
      upcomingEvents: '/v1/upcoming',
      entitlements: '/v1/me/entitlements',
    },
  });
});

// Seed Endpoint
app.get('/v1/seed', (req: Request, res: Response) => {
  seedDatabase();
  res.json({ success: true, message: 'Database seeded clean from sample-data.json' });
});

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', app: 'KAI Money OS Server', time: new Date().toISOString() });
});

// Auth OTP Request & Verify Stubs
app.post('/v1/auth/otp/request', (req: Request, res: Response) => {
  const { phone } = req.body;
  console.log(`[AUTH] OTP sent to ${phone}: 123456`);
  res.json({ success: true, message: 'OTP sent successfully (console logged in dev)' });
});

app.post('/v1/auth/otp/verify', (req: Request, res: Response) => {
  const { phone, code } = req.body;
  const user = db.prepare('SELECT * FROM users LIMIT 1').get();
  res.json({
    success: true,
    token: 'jwt_mock_token_kai_aditi_123',
    user,
  });
});

// User Profile & Settings
app.get('/v1/me', (req: Request, res: Response) => {
  const user = db.prepare('SELECT * FROM users LIMIT 1').get();
  res.json(user);
});

app.get('/v1/me/entitlements', (req: Request, res: Response) => {
  res.json({
    plan: 'free',
    isPro: false,
    entitlements: {
      maxGoals: 3,
      maxVaultDocuments: 5,
      askMyMoney: false,
      cashFlowForecast: false,
    },
  });
});

// Dashboard Summary (Single Request Load for Performance)
app.get('/v1/dashboard/summary', (req: Request, res: Response) => {
  const accounts: any = db.prepare('SELECT * FROM accounts WHERE archived = 0').all();
  const cards: any = db.prepare('SELECT * FROM credit_cards WHERE archived = 0').all();
  const txs: any = db.prepare('SELECT * FROM transactions WHERE deleted_at IS NULL ORDER BY happened_at DESC LIMIT 10').all();
  const upcoming: any = db.prepare('SELECT * FROM upcoming_events WHERE status = "upcoming" ORDER BY due_date ASC LIMIT 5').all();
  const goals: any = db.prepare('SELECT * FROM goals WHERE status = "active" LIMIT 3').all();

  const totalBalance = calculateTotalBalance(accounts);
  const cardOutstanding = cards.reduce((sum: number, c: any) => sum + c.outstanding, 0);

  res.json({
    totalBalance,
    cardOutstanding,
    accounts,
    cards,
    recentTransactions: txs,
    upcoming,
    goals,
  });
});

// Objects APIs
app.get('/v1/accounts', (req: Request, res: Response) => {
  const accounts = db.prepare('SELECT * FROM accounts WHERE archived = 0').all();
  res.json(accounts);
});

app.get('/v1/cards', (req: Request, res: Response) => {
  const cards = db.prepare('SELECT * FROM credit_cards WHERE archived = 0').all();
  res.json(cards);
});

// Transactions API (Single DB transaction for balance updates)
app.get('/v1/transactions', (req: Request, res: Response) => {
  const txs = db.prepare('SELECT * FROM transactions WHERE deleted_at IS NULL ORDER BY happened_at DESC').all();
  res.json(txs);
});

app.post('/v1/transactions', (req: Request, res: Response) => {
  const tx = req.body;
  const id = tx.id || `tx_${Date.now()}`;
  const userId = 'u_aditi';
  const happenedAt = tx.happenedAt || new Date().toISOString();
  const recordedAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO transactions (id, user_id, type, amount, category, description, happened_at, recorded_at, from_type, from_id, to_type, to_id, source, voice_transcript)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    userId,
    tx.type,
    tx.amount,
    tx.category || null,
    tx.description || null,
    happenedAt,
    recordedAt,
    tx.fromAccount?.type || null,
    tx.fromAccount?.id || null,
    tx.toAccount?.type || null,
    tx.toAccount?.id || null,
    tx.source || 'manual',
    tx.voiceTranscript || null
  );

  // Apply Balance Effect inside DB
  if (tx.type === 'expense' && tx.fromAccount?.id) {
    db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(tx.amount, tx.fromAccount.id);
  } else if (tx.type === 'income' && tx.toAccount?.id) {
    db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(tx.amount, tx.toAccount.id);
  }

  const createdTx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  res.status(201).json(createdTx);
});

app.delete('/v1/transactions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('UPDATE transactions SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
  res.json({ success: true, id });
});

// Voice Parser Endpoint
app.post('/v1/voice/parse', (req: Request, res: Response) => {
  const { transcript } = req.body;

  // Mock Gemini API LLM parsing result according to contract
  const parsed = parseAndValidateVoiceResult({
    transcript,
    intent: 'create_transaction',
    transaction: {
      type: 'expense',
      amount: 50000,
      category: 'food_dining',
      description: 'Dinner',
      happenedAt: new Date().toISOString(),
      confidence: 0.95,
    },
    missing: [],
  });

  res.json(parsed);
});

// Ask My Money (Tool-Calling Endpoint)
app.post('/v1/ai/query', (req: Request, res: Response) => {
  const { question } = req.body;

  const accounts: any = db.prepare('SELECT * FROM accounts').all();
  const totalBalance = calculateTotalBalance(accounts);

  if (question.toLowerCase().includes('afford')) {
    const affordRes = calculateCanIAfford(totalBalance, 2500000, 4000000, 1500000);
    return res.json({
      answer: affordRes.explanation,
      basis: 'calculation',
      data: affordRes,
    });
  }

  res.json({
    answer: `You have ₹${Math.round(totalBalance / 100).toLocaleString('en-IN')} in non-archived savings accounts across HDFC and SBI.`,
    basis: 'data',
  });
});

app.listen(PORT, () => {
  console.log(`Database seeded successfully from sample-data.json!`);
  console.log(`KAI Server v1 running at http://localhost:${PORT}`);
});
