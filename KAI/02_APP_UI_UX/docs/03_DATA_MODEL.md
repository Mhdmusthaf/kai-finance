# 03 — Data model and money rules

The types are in `code/types.ts` and the Postgres schema is in `code/schema.sql`. The two must stay in sync. If you use Drizzle, generate the Drizzle schema from the SQL file.

## Two layers

The data model has two layers:

1. **Financial objects** are what the user has, owes or plans:
   - account, credit card, loan, EMI, investment, SIP, insurance policy, bill, subscription, goal, debt (owed), other asset, document.
2. **Transactions** are events that move money. Every transaction has a `type`:

| type | from → to | Counts as spending? | Effect |
|---|---|---|---|
| expense | account/card → — | **yes** | account −, or card outstanding + |
| income | — → account | income | account + |
| transfer | account → account | no | − / + |
| card_payment | account → card | **no** | account −, card outstanding − |
| investment | account → investment | no (invested) | account −, investment.invested + |
| emi_payment | account/card → loan/emi | yes | loan outstanding −, paidCount + 1 |
| loan_payment | account → loan | yes | loan outstanding − |
| insurance_premium | account/card → policy | yes | renewalDate rolls forward |
| subscription_payment | card/account → sub | yes | nextBillingDate rolls forward |
| bill_payment | account → bill | yes | — |
| debt_settlement | person ↔ account | **no** | debt.settled + |

Rules for every transaction:

- The server applies the effects inside **one DB transaction**, together with the insert, edit or soft delete.
- Editing a transaction reverses the old effect, then applies the new one.
- Deleting is a soft delete (`deleted_at`).

## The chain

```
Object ──creates──▶ Schedule (rule: monthly on day 7, amount, txType)
Schedule ──nightly job──▶ UpcomingEvent (next 90 days, status upcoming)
UpcomingEvent ──N days before──▶ Notification (+ local push)
User "Mark paid" / voice "paid SBI card" ──▶ Transaction (linkedObject, event.transactionId, status paid)
Transactions ──▶ Analytics (spending view, cash flow, net worth, insights)
```

How events change state:

- An event still `upcoming` after its due date becomes `overdue`. The app shows it in error styling and lists it under "Needs your attention".
- If the user records a matching transaction manually or by voice (same object, amount within ±10%, date within ±5 days), the server links it to the event and marks the event paid. This prevents double entry.

## Derived numbers

| Number | Formula |
|---|---|
| Total balance | Σ account.balance (not archived) |
| Card available | limit − outstanding |
| Spent this month | Σ amount where type ∈ COUNTS_AS_SPENDING and happenedAt in month |
| Earned | Σ income in month |
| Saved | earned − spent |
| Upcoming left this month | Σ UpcomingEvent.amount, direction out, status upcoming, due ≤ month end |
| Net worth | (accounts + investments.currentValue + other assets + owed_to_me open) − (card outstanding + loan outstanding + i_owe open) |
| Safe to spend | balance − upcoming out until next income − user.safetyBuffer |
| Goal monthly needed | (target − saved) / months to deadline |
| EMI amount | P·r·(1+r)^n / ((1+r)^n − 1), with r = annualRate / 12 / 100 |

## API (REST, JWT auth)

```
POST /auth/otp/request  POST /auth/otp/verify  POST /auth/pin
GET  /me  PATCH /me
GET/POST/PATCH/DELETE /accounts /cards /loans /emis /investments /sips /policies /bills /subscriptions /goals /people /debts /assets
POST /goals/:id/contributions
GET  /transactions?from&to&type&category&account&q&cursor   POST /transactions  PATCH/DELETE /transactions/:id
GET  /upcoming?from&to   POST /upcoming/:id/pay  POST /upcoming/:id/skip  POST /upcoming/:id/snooze
GET  /notifications  POST /notifications/:id/read
GET  /insights  POST /insights/:id/feedback
GET  /analytics/summary?month   /analytics/categories?month   /analytics/cashflow   /analytics/networth
POST /voice/transcribe (audio)   POST /voice/parse   POST /ask
GET/POST/DELETE /documents (signed upload URL)
GET  /export?format=csv|json     DELETE /me
```

## Security

- Every query is scoped by `user_id`.
- Rate-limit `/auth` and the AI endpoints.
- Encrypt documents at rest, and never log transcripts or amounts.
