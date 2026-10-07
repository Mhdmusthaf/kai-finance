import fs from 'fs';
import path from 'path';

const storageFile = path.join(__dirname, '../kai_store.json');

export interface MemoryStore {
  users: any[];
  accounts: any[];
  credit_cards: any[];
  loans: any[];
  emis: any[];
  investments: any[];
  sips: any[];
  insurance_policies: any[];
  bills: any[];
  subscriptions: any[];
  goals: any[];
  transactions: any[];
  upcoming_events: any[];
}

let store: MemoryStore = {
  users: [],
  accounts: [],
  credit_cards: [],
  loans: [],
  emis: [],
  investments: [],
  sips: [],
  insurance_policies: [],
  bills: [],
  subscriptions: [],
  goals: [],
  transactions: [],
  upcoming_events: [],
};

function loadStore() {
  if (fs.existsSync(storageFile)) {
    try {
      const data = fs.readFileSync(storageFile, 'utf8');
      store = JSON.parse(data);
    } catch (e) {
      // keep initial
    }
  }
}

function saveStore() {
  try {
    fs.writeFileSync(storageFile, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    // error writing
  }
}

export function initDatabase() {
  loadStore();
}

export const db = {
  pragma: (str: string) => {},
  exec: (sql: string) => {},
  prepare: (sql: string) => {
    const lowerSql = sql.toLowerCase().trim();

    return {
      get: (...args: any[]) => {
        loadStore();

        if (lowerSql.includes('count(*)')) {
          if (lowerSql.includes('from users')) return { count: store.users.length };
          if (lowerSql.includes('from accounts')) return { count: store.accounts.length };
          if (lowerSql.includes('from transactions')) return { count: store.transactions.length };
          return { count: 0 };
        }

        if (lowerSql.includes('from users')) {
          return store.users[0] || { id: 'u_aditi', name: 'Aditi Sharma', currency: 'INR', plan: 'free' };
        }
        if (lowerSql.includes('from transactions') && lowerSql.includes('where id =')) {
          const id = args[0];
          return store.transactions.find((t) => t.id === id) || null;
        }
        return { count: store.users.length };
      },
      all: (...args: any[]) => {
        loadStore();
        if (lowerSql.includes('from accounts')) {
          return store.accounts.filter((a) => !a.archived);
        }
        if (lowerSql.includes('from credit_cards')) {
          return store.credit_cards.filter((c) => !c.archived);
        }
        if (lowerSql.includes('from transactions')) {
          return store.transactions.filter((t) => !t.deleted_at);
        }
        if (lowerSql.includes('from upcoming_events')) {
          return store.upcoming_events.filter((u) => u.status === 'upcoming');
        }
        if (lowerSql.includes('from goals')) {
          return store.goals.filter((g) => g.status === 'active');
        }
        return [];
      },
      run: (...args: any[]) => {
        loadStore();
        if (lowerSql.includes('into users')) {
          const [id, name, phone, email, currency, language, persona, safety_buffer, plan] = args;
          const idx = store.users.findIndex((u) => u.id === id);
          const obj = { id, name, phone, email, currency, language, persona, safety_buffer, plan };
          if (idx >= 0) store.users[idx] = obj;
          else store.users.push(obj);
        } else if (lowerSql.includes('into accounts')) {
          const [id, userId, name, kind, institution, last4, balance, is_primary] = args;
          const idx = store.accounts.findIndex((a) => a.id === id);
          const obj = { id, user_id: userId, space: 'personal', name, kind, institution, last4, balance, is_primary, archived: 0 };
          if (idx >= 0) store.accounts[idx] = obj;
          else store.accounts.push(obj);
        } else if (lowerSql.includes('into credit_cards')) {
          const [id, userId, name, issuer, last4, credit_limit, outstanding, statement_day, due_day, autopay] = args;
          const idx = store.credit_cards.findIndex((c) => c.id === id);
          const obj = { id, user_id: userId, space: 'personal', name, issuer, last4, credit_limit, outstanding, statement_day, due_day, autopay, archived: 0 };
          if (idx >= 0) store.credit_cards[idx] = obj;
          else store.credit_cards.push(obj);
        } else if (lowerSql.includes('into transactions')) {
          const [id, userId, type, amount, category, description, happened_at, recorded_at, from_type, from_id, to_type, to_id, source, voice_transcript] = args;
          const idx = store.transactions.findIndex((t) => t.id === id);
          const obj = { id, user_id: userId, space: 'personal', type, amount, category, description, happened_at, recorded_at, from_type, from_id, to_type, to_id, source, voice_transcript, deleted_at: null };
          if (idx >= 0) store.transactions[idx] = obj;
          else store.transactions.push(obj);
        } else if (lowerSql.includes('into upcoming_events')) {
          const [id, userId, object_type, object_id, title, due_date, amount, direction, status] = args;
          const idx = store.upcoming_events.findIndex((u) => u.id === id);
          const obj = { id, user_id: userId, object_type, object_id, title, due_date, amount, direction, status };
          if (idx >= 0) store.upcoming_events[idx] = obj;
          else store.upcoming_events.push(obj);
        } else if (lowerSql.startsWith('update accounts set balance = balance -')) {
          const [amount, accountId] = args;
          const acc = store.accounts.find((a) => a.id === accountId);
          if (acc) acc.balance -= amount;
        } else if (lowerSql.startsWith('update accounts set balance = balance +')) {
          const [amount, accountId] = args;
          const acc = store.accounts.find((a) => a.id === accountId);
          if (acc) acc.balance += amount;
        } else if (lowerSql.startsWith('update transactions set deleted_at')) {
          const [id] = args;
          const tx = store.transactions.find((t) => t.id === id);
          if (tx) tx.deleted_at = new Date().toISOString();
        }
        saveStore();
        return { changes: 1 };
      },
    };
  },
};
