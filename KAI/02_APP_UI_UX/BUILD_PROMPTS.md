# Build prompts: KAI (works in Antigravity, Replit, Cursor)

**Antigravity:**
- Open the repo folder, then paste these prompts into the Agent panel one at a time.
- Reference screen images by path (for example `02_APP_UI_UX/screens/04_Home__default.jpg`), or drag them into the chat.
- For the database: run Postgres locally (Docker: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=kai postgres`) or use a free Neon or Supabase database, and put `DATABASE_URL` in `server/.env`.
- Test on your phone with Expo Go (`npx expo start`, then scan the QR code).
- Android: `eas build -p android`. iOS: `eas build -p ios`.

**Replit:** create a "Mobile app" project and upload this folder.

---
## Prompt 0: Project setup (create a "Mobile app" project)

```
Build "KAI — Your Money OS", a voice-first personal finance mobile app for iOS and Android.
Mobile only: no web or desktop layouts.

The full design handoff is uploaded at 02_APP_UI_UX.
Before writing any code, read these files in order:
  README.md
  docs/01_PRODUCT_SPEC.md
  docs/02_DESIGN_SYSTEM.md
  docs/03_DATA_MODEL.md
  docs/04_VOICE_AND_AI.md
The screens/ folder has a screenshot of every screen and state. Match them closely.

Stack:
- App:
  - Expo + React Native + TypeScript, with expo-router.
  - react-native-reanimated, react-native-svg and expo-linear-gradient.
  - @expo-google-fonts/nunito and @expo-google-fonts/nunito-sans.
- Server:
  - Node + Express + TypeScript in /server (repo root), with Drizzle ORM on Replit PostgreSQL.
  - Start from code/schema.sql and code/types.ts.
- Shared types: copy code/types.ts to /shared/types.ts.
- Theme: copy code/theme.ts to /src/theme/theme.ts.
  - Every colour, font, size, radius and shadow must come from this file. Never hardcode a hex value in a screen.
- Assets: copy assets/ to the Expo assets folder.
  - Use app-icon/KAI_AppIcon_Forest_1024.png as the app icon.
  - Use mascot/*.svg or *.png for the KAI mascot.

Phase 1 only (do not build other screens yet):
1. Set up the project structure, theme, fonts and the server with the database schema.
2. Seed the database from code/sample-data.json.
3. Build the bottom tab bar with 5 tabs: Home, Activity, Upcoming, Insights, My Money.
   Add a floating round Voice button (mic, forest gradient, 62pt) bottom-right, above the tab bar, on every tab.
4. Add placeholder screens for each tab.
5. Build these shared components:
   - Button (primary, secondary, ghost)
   - Card
   - Chip
   - AmountText (uses formatINR, tabular numbers)
   - ListRow
   - SectionHeader
   - EmptyState (mascot + text + CTA)
   - Skeleton
   - BottomSheet
   - Toast with Undo
   - Mascot (props: expression, size)
   - Icon (the SVGs in assets/icons)

Show me the tab bar and a component gallery screen when done.
```

**Attach:**
- `boards/01_app-system__App-Components.jpg`
- `boards/01_app-system__TabBar.jpg`
- `boards/01_app-system__App-Map.jpg`

---

## Prompt 1: Splash, onboarding, auth and lock

```
Build Splash, Onboarding and Auth exactly as in the attached screens.
- Onboarding steps, in order:
  welcome → moneyos → voice → currency → profile → objects → goals → account → done
- Auth:
  - Sign up / log in with phone OTP.
  - A 6-digit OTP screen with resend timer.
  - Create a 4-digit PIN, plus an optional Face ID / fingerprint lock (expo-local-authentication).
  - A lock screen when the app opens.
  - A session-expired screen.
  - Microphone and notification permission primers shown BEFORE the system prompt.
- Server: POST /auth/otp/request, POST /auth/otp/verify → JWT. Store the JWT in expo-secure-store.
- For development, log the OTP to the console instead of sending an SMS.
```

**Attach:**
- `01_Splash.jpg`
- all `02_Onboarding__*.jpg`
- all `03_Auth__*.jpg`

---

## Prompt 2: Home and voice (the heart of the app)

```
Build Home and the Voice flow exactly as in the attached screens.

Home:
- Greeting.
- Balance hero card (forest gradient).
- This month spent / earned.
- Upcoming summary.
- "Needs you" items.
- Recent transactions.
- An insight card.
- Goals preview.
- States: default, empty (new user), loading (skeletons), offline banner, toast after a voice add.

Voice flow (floating mic button on every tab): idle → listening (live waveform) → transcribing →
thinking → result card.
- Result card editing:
  - Editable chips: amount, type, category, account, date/time.
  - Show the transaction time ("yesterday 9 pm") separately from the entry time ("now").
- Saving:
  - Simple entries auto-save after 3 s with an Undo toast.
  - Complex entries (several items, a new object such as a loan or SIP) show a confirm sheet.
- Missing info: if the amount or account is missing, ask ONE follow-up question.
- Error state: retry, or type instead.

Implement the backend for docs/04_VOICE_AND_AI.md:
- POST /voice/parse takes { transcript, now, timezone } and returns VoiceParseResult, using an LLM with the system prompt in docs/04.
- Speech-to-text: use expo-speech-recognition on the device; fall back to uploading audio to POST /voice/transcribe.
```

**Attach:**
- all `04_Home__*.jpg`
- all `05_Voice__*.jpg`

---

## Prompt 3: Activity (transactions)

```
Build the Activity tab, Transaction Detail, Add/Edit Transaction and Search, exactly as attached.
- List:
  - Grouped by day.
  - Day totals count spending only (COUNTS_AS_SPENDING).
  - Filters: type, category, account, date range.
  - Swipe left to delete (with undo); swipe right to edit.
  - Empty and loading states.
- Add/Edit:
  - Type selector: expense, income, transfer, card payment, investment.
  - Large amount keypad, category grid, account picker.
  - Separate "When did it happen" date+time; "Recorded" is shown read-only.
  - Notes, tags, receipt photo.
  - Validation error state.
- Detail:
  - Every field, including both timestamps and a voice transcript if one exists.
  - Linked object (e.g. "EMI 7 of 12"), edit, delete confirm.
- Account balances update on every create/edit/delete, in a single DB transaction on the server.
```

**Attach:** all `06_Activity__*`, `07_TxDetail__*`, `08_TxAdd__*` and `09_Search__*` files.

---

## Prompt 4: My Money (financial objects)

```
Build My Money and the generic Object List / Object Detail / Object Add screens for:
- accounts
- credit cards
- loans and EMIs
- investments and SIPs
- insurance
- bills
- subscriptions
- money owed

Follow docs/03_DATA_MODEL.md. Every object that recurs creates a Schedule, and the server generates
UpcomingEvents for the next 90 days.

Detail screens show the object-specific info:
- card: limit / used / available, statement and due day
- loan: EMI x of N, outstanding, amortisation
- SIP: next date, pause/resume
- policy: renewal countdown, documents

Each detail screen has a bottom-sheet action:
- pay a card bill (records card_payment, NOT spending)
- mark an EMI paid
- pause a SIP
- renew a policy

Add flows end on a success state with the happy mascot.
```

**Attach:** `10_MyMoney.jpg` and all `11_ObjectList__*`, `12_ObjectDetail__*` and `13_ObjectAdd__*` files.

---

## Prompt 5: Upcoming, calendar and notifications

```
Build Upcoming (grouped Today / This week / Later, with the total committed this month), the monthly
Calendar with day dots and an event sheet, and the Notifications center.
- Upcoming actions:
  - Mark paid → creates the matching Transaction, linked to the event.
  - Remind me later.
  - Skip.
- Overdue events turn into warning styling.
- Schedule local push notifications with expo-notifications:
  - bills/EMIs 2 days before
  - insurance 30 days before
  - SIP the day before
- The push preview must match 28_Notifications__push.jpg.
- Tapping a notification deep-links to the right screen.
```

**Attach:** all `14_Upcoming__*`, `15_Calendar__*` and `28_Notifications__*` files.

---

## Prompt 6: Goals, Insights, Ask My Money and analytics

```
Build:
- Goals: list, detail, create, completion celebration
- Achievements
- Insights feed and insight detail. Each insight shows its basis: "From your data" / "Calculated" / "Suggestion".
- Ask My Money chat: empty, thinking, answer (with a mini chart and source numbers), error.
- Cash Flow forecast
- Net Worth: assets − liabilities
- Reports: category donut, month compare
- Monthly Recap story: 7 swipeable pages

Rules:
- Analytics use ONLY COUNTS_AS_SPENDING for spending.
- "Can I afford X?" answers use: balance − upcoming commitments − safetyBuffer.
- Every number in an AI answer must come from a server query result. Never let the LLM invent numbers (docs/04).
```

**Attach:** all `16_Goals__*`, `17_Goal__*`, `18_*`, `19_*`, `20_*`, `21_Ask__*`, `22_*`, `23_*`, `24_*` and `25_Recap__*` files.

---

## Prompt 7: Owed, Document Vault, Me / settings

```
Build:
- Owed (money between people):
  - list, person detail, settle (records debt_settlement: not income, not expense), empty
  - "remind" shares a friendly WhatsApp message
- Document Vault:
  - list, upload with progress, failed upload, preview, empty
  - Files are encrypted and stored in Replit Object Storage.
  - Documents can be linked to a policy or loan.
- Me: profile, settings (currency, language, safety buffer, theme), security (PIN, biometrics,
  auto-lock), privacy (export my data as CSV/JSON, delete account), help.
```

**Attach:** all `26_Owed__*`, `27_Vault__*` and `29_Me__*` files.

---

## Prompt 8: KAI Pro, polish and release

```
Build:
- The Pro paywall, purchase confirm, success, restore, and manage subscription screens.
  Use RevenueCat (react-native-purchases) behind a feature flag.
Then polish:
- Pressed states (scale 0.97).
- Skeleton loaders on every list.
- Pull to refresh.
- Haptics on save.
- Dynamic type up to 130%.
- VoiceOver/TalkBack labels on every control.
- 44pt touch targets.
- Offline queue: voice entries made offline sync later.
Finally, set up app.json for release:
- bundle id: app.kai.money
- icon: assets/app-icon/KAI_AppIcon_Forest_1024.png
- splash: forest #0B3D2E with the mascot
- microphone, notification and Face ID usage descriptions
```

**Attach:** all `30_Pro__*` files.

---

### Fix-up prompt (use any time)

```
This screen doesn't match the design. Compare it to the attached image and fix spacing, font sizes,
weights, colours, corner radius and shadows so it matches exactly. Use only tokens from src/theme/theme.ts.
```
