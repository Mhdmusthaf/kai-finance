# 04 — Voice and AI

## Pipeline

1. Recording:
   - The user taps the mic and the voice modal opens on the Dark Premium world. The state becomes `listening`, with a live waveform.
   - Speech-to-text runs on the device (`expo-speech-recognition`), with partial results shown live.
   - If on-device recognition is unavailable, the app records with expo-av and calls `POST /voice/transcribe`.
2. The state goes to `transcribing`, then to `thinking` when the app calls `POST /voice/parse { transcript, now, timezone, locale }`.
3. The server builds a context and calls the LLM in JSON mode:
   - the user's accounts, cards, loans, SIPs, bills, subscriptions, people and goals (names + ids only),
   - the categories,
   - today's date.
4. The server validates the result against `VoiceParseResult` and resolves names to ids, e.g. "HDFC card" → creditCard id.
5. The app then decides what to do with the result:
   - **simple** (one transaction, nothing missing, confidence ≥ 0.8): show the result card, then auto-save after 3 s with an Undo toast.
   - **complex** (several transactions, or a new object): show a confirm sheet listing everything. Nothing saves until the user confirms.
   - **missing**: show `followUpQuestion` (only one), listen again, merge the answer, and continue.
   - **question** intent: route to Ask My Money.
   - **error / unknown**: show the concerned mascot with "I didn't catch that", plus Retry and Type instead.

## Parse system prompt (server)

```
You are KAI's money parser. Convert the user's words into JSON matching VoiceParseResult. Output JSON only.
Today is {{now}} ({{timezone}}). Currency default INR. Amounts in paise (₹500 → 50000). "k" = thousand, "lakh"/"L" = 100000.
Resolve relative times into happenedAt: "yesterday night" → yesterday 21:00, "this morning" → today 09:00, no time → now.
recordedAt is always now — never change it.
Pick type carefully:
  "paid my HDFC card bill" → card_payment (NOT expense)
  "moved 10k to savings" → transfer
  "put 5000 in SIP" / "bought shares" → investment
  "Rahul paid me back 2000" → debt_settlement
  "EMI" → emi_payment; "premium" → insurance_premium; "Netflix charged" → subscription_payment; "electricity bill" → bill_payment
  "got salary" → income/salary
Match accounts/cards/people only from the provided lists (return their ids). If none mentioned use the primary account and do NOT list it as missing,
except for transfer/card_payment where the account is essential.
If the user describes a new thing ("I took a car loan of 6 lakh at 9% for 5 years, EMI on 5th") return intent create_object.
Several items in one sentence → return them all in transactions[] (complex).
Only put a field in missing[] if the entry cannot be saved without it. Ask at most ONE short, friendly followUpQuestion.
Never invent amounts.
Context: {{objects_json}}
```

## Examples

| Said | Result |
|---|---|
| "Spent 500 on dinner yesterday with HDFC card" | expense ₹500, food_dining, card HDFC, happenedAt yesterday 21:00 |
| "Got salary 1.4 lakh" | income ₹1,40,000, salary, primary account |
| "Paid SBI card bill 18,240 from HDFC" | card_payment; links to the upcoming card-bill event |
| "Transferred 10k" | transfer; missing [account] → "Which account did you move it to?" |
| "Lunch 320 and auto 80" | complex, 2 expenses |
| "Started a 5000 SIP in Parag Parikh on the 5th" | create_object sip + schedule |

## Ask My Money

- **Endpoint:** `POST /ask { question }`.
- **Step 1, tool use:**
  - The server first lets the LLM pick from a fixed set of **query tools**: `spending_by_category(range)`, `cashflow_forecast(days)`, `upcoming(range)`, `goal_status(id)`, `net_worth()`, `can_afford(amount, date)`, `compare_months(a,b)`.
  - The server runs those SQL queries.
- **Step 2, the answer:**
  - The LLM writes a short answer (≤ 3 sentences) using **only the returned numbers**, plus an optional chart spec `{type:'bar'|'line'|'donut', series}`.
  - The answer is labelled with its basis: data, calculation or suggestion.
- **Errors:** if a tool fails, return the error state ("I couldn't work that out right now"). Never guess.
- **"Can I afford X?":** compute `balance − upcoming outflows until next income − safetyBuffer − X`, then answer yes / careful / not now with the numbers shown.

## Insights (nightly job)

The job runs rule-based detectors first; the LLM only polishes the wording:

- category vs. last month (±15%)
- unusual transaction (more than 3× the median for that merchant)
- subscriptions renewing in 7 days
- a goal off track
- a large upcoming week
- a forgotten subscription (no usage tag in 60 days)

Each insight has a headline, a detail, its basis, and a CTA deep link.
