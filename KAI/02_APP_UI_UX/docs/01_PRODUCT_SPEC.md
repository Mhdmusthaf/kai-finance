# 01 — Product spec

KAI is a calm, voice-first money OS. Users talk to it ("Spent 500 on dinner yesterday with HDFC card"). KAI then:

- records the event,
- keeps every financial object up to date,
- reminds the user before money moves,
- explains what it all means.

**Platforms:** iOS and Android phones only. The design width is 390 pt, and layouts scale fluidly from 360 to 430.

## Navigation

```
Root
├─ Splash → Onboarding (first run) → Auth (OTP → PIN/biometric) → Tabs
├─ Lock screen (every cold start / after auto-lock)
└─ Tabs (bottom bar, 84pt) + floating Voice button (bottom-right, above bar, every tab)
   ├─ Home           → Notifications · Search · Insight detail · Goal · Upcoming item · Tx detail
   ├─ Activity       → Tx detail → Edit · Add (expense/income/transfer/card pay/investment) · Search & filters
   ├─ Upcoming       → Calendar · Event sheet (mark paid / remind / skip)
   ├─ Insights       → Insight detail · Ask My Money · Cash flow · Net worth · Reports · Monthly recap
   └─ My Money       → Accounts · Cards · Loans & EMIs · Investments & SIPs · Insurance · Bills · Subscriptions
                       · Goals · Owed · Document vault · Me (profile/settings/security/privacy/help) · KAI Pro
Voice (modal, full screen, dark premium world) – reachable from every tab
```

The core chain is **Financial object → Schedule → Upcoming event → Notification → Transaction → Analytics**.

## Screen inventory

Screens are listed by their file in `screens/`.

| # | Screen | States (file suffix) |
|---|---|---|
| 01 | Splash | — |
| 02 | Onboarding | welcome, moneyos, voice, currency, profile, objects, goals, account, done |
| 03 | Auth | signup, otp, pin, lock, expired, mic (permission primer), notifications (primer) |
| 04 | Home | default, empty, loading, offline, toast (after voice add) |
| 05 | Voice | idle, listening, transcribing, thinking, result, complex, missing (one follow-up), error |
| 06 | Activity (transaction list) | default, search, filter, swipe, empty, loading |
| 07 | Transaction detail | default, delete |
| 08 | Add / edit transaction | expense, income, transfer, cardpay, investment × new / edit, plus expense_error |
| 09 | Search | idle, results |
| 10 | My Money | — |
| 11 | Object list | accounts, cards, debt, investments, insurance, bills, subs × default / empty |
| 12 | Object detail | account, card, loan, emi, fund, sip, policy, bill, sub × default / sheet (action), plus sip_paused |
| 13 | Object add | account, card, loan, emi, sip, policy, bill, sub, receivable × new / success |
| 14 | Upcoming | default, empty |
| 15 | Calendar | default, event |
| 16–18 | Goals, Goal, Achievements | Goals: default, empty. Goal: detail, create, complete |
| 19–21 | Insights, Insight detail, Ask My Money | Insights: default, empty. Ask: empty, thinking, answer, error |
| 22–24 | Cash flow, Net worth, Reports | — |
| 25 | Monthly recap (story) | intro, money, category, improvement, goals, networth, focus |
| 26 | Owed | list, person, settle, empty |
| 27 | Document vault | list, uploading, failed, preview, empty |
| 28 | Notifications | center, empty, push (lock-screen preview) |
| 29 | Me | profile, settings, security, privacy, help |
| 30 | KAI Pro | paywall, confirm, success, restore, manage |

## Home, top to bottom

1. **Greeting and mascot**, plus the search and bell buttons. The bell shows an unread dot.
2. **Balance hero:**
   - Forest gradient card showing the total across non-archived accounts, with an eye toggle that hides amounts.
   - Change since last month.
   - Earned / Spent / Saved this month.
   - A month progress bar ("43% of income spent · 27 days left").
3. **Quick actions:** Expense, Income, Transfer, Pay card.
4. **"KAI noticed" insight card** (lavender).
5. **Needs your attention:** due soon or overdue items, using warning/error tint.
6. **Where it went:**
   - Category bar and legend, spending only.
   - Footnote: "Transfers between your own accounts and card bill payments are not counted as spending."
7. **Accounts carousel.**
8. **Coming up:** the next three events, plus "₹X left in <month>".
9. **Goals preview.**
10. **Net worth teaser.**

## Behaviour rules

- **Voice first:**
  - The floating mic is always reachable.
  - A simple entry (amount, category and account all known) auto-saves after 3 s and shows a toast with **Undo** for 6 s.
  - Anything complex, or anything that creates an object, shows a confirm sheet.
- **One question max:** if an essential field is missing (amount, or the account for a transfer/card pay), ask one short question. Otherwise use defaults: the primary account, today, the category the model guessed.
- **Two times:**
  - Every transaction shows "When: yesterday, 9:00 pm" and "Recorded: today, 8:02 pm".
  - Lists sort by `happenedAt`.
- **Credit cards:** spending is counted when the card is swiped. Paying the bill is a `card_payment` that reduces the card's outstanding and the bank balance, and is never counted as spending.
- **Investments and SIPs** are "invested", not spent.
- **Owed / debts:** settling is a `debt_settlement`, which is neither income nor expense.
- **Reminders:**
  - Bills and EMIs: 2 days before.
  - Card bill: 3 days before the due date.
  - Insurance: 30 days before renewal.
  - SIP: 1 day before.
- **Every state is designed.** Every list screen needs default, loading (skeleton), empty (mascot + one CTA) and error/offline states.
- **Offline:**
  - Show an offline banner on Home.
  - Queue voice and manual entries locally and sync them when back online.
  - Never lose an entry.
- **Security:**
  - PIN or biometric lock on launch, and after 1 minute in the background (configurable).
  - Amounts are hidden in the app switcher.
- **Free vs Pro:**
  - Free: unlimited manual + voice entries, 3 goals, 5 documents, basic insights.
  - Pro: unlimited goals and vault, Ask My Money, cash-flow forecast, monthly recap, exports.

## Tone

Calm, warm, brief. Never shame. "You spent 18% more on dining this month. Want to see why?" — not "Overspending alert!"
