import fs from 'fs';
import path from 'path';
import { db, initDatabase } from './db';

export function seedDatabase() {
  initDatabase();

  const samplePath = path.join(__dirname, '../../KAI/02_APP_UI_UX/code/sample-data.json');
  if (!fs.existsSync(samplePath)) {
    console.error('Sample data file not found at:', samplePath);
    return;
  }

  const raw = fs.readFileSync(samplePath, 'utf8');
  const sample = JSON.parse(raw);

  const userId = sample.user.id;

  db.prepare(`
    INSERT OR REPLACE INTO users (id, name, phone, email, currency, language, persona, safety_buffer, plan)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sample.user.id,
    sample.user.name,
    sample.user.phone,
    sample.user.email,
    sample.user.currency,
    sample.user.language,
    JSON.stringify(sample.user.persona || []),
    sample.user.safetyBuffer,
    sample.user.plan
  );

  if (sample.accounts) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO accounts (id, user_id, space, name, kind, institution, last4, balance, is_primary)
      VALUES (?, ?, 'personal', ?, ?, ?, ?, ?, ?)
    `);
    for (const acc of sample.accounts) {
      stmt.run(acc.id, userId, acc.name, acc.kind, acc.institution || null, acc.last4 || null, acc.balance, acc.isPrimary ? 1 : 0);
    }
  }

  if (sample.creditCards) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO credit_cards (id, user_id, space, name, issuer, last4, credit_limit, outstanding, statement_day, due_day, autopay)
      VALUES (?, ?, 'personal', ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const card of sample.creditCards) {
      stmt.run(card.id, userId, card.name, card.issuer, card.last4, card.creditLimit, card.outstanding, card.statementDay, card.dueDay, card.autopay ? 1 : 0);
    }
  }

  if (sample.transactions) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO transactions (id, user_id, space, type, amount, currency, category, description, happened_at, recorded_at, from_type, from_id, to_type, to_id, source, voice_transcript)
      VALUES (?, ?, 'personal', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const tx of sample.transactions) {
      stmt.run(
        tx.id,
        userId,
        tx.type,
        tx.amount,
        tx.category || null,
        tx.description || null,
        tx.happenedAt,
        tx.recordedAt || tx.happenedAt,
        tx.fromAccount?.type || null,
        tx.fromAccount?.id || null,
        tx.toAccount?.type || null,
        tx.toAccount?.id || null,
        tx.source || 'manual',
        tx.voiceTranscript || null
      );
    }
  }

  if (sample.upcomingEvents) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO upcoming_events (id, user_id, object_type, object_id, title, due_date, amount, direction, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const ev of sample.upcomingEvents) {
      stmt.run(ev.id, userId, ev.objectType, ev.objectId, ev.title, ev.dueDate, ev.amount, ev.direction, ev.status);
    }
  }

  console.log('Database seeded successfully from sample-data.json!');
}

if (require.main === module) {
  seedDatabase();
}
