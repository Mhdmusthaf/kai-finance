# 02 — Design system

All values live in `code/theme.ts`. Screens must use the tokens, never raw hex values.

## Colour

| Token | Hex | Use |
|---|---|---|
| forest | #0B3D2E | Headlines, primary buttons, hero cards, dark surfaces |
| mint | #3ED1A0 | Accent **on dark only** (progress, active tab on dark, voice glow) |
| cream | #FFF8F1 | Brand canvas; text on forest |
| offWhite | #FCFBF8 | App background |
| leaf | #22A06B | Icons, charts, the mascot's leaf |
| deepMint | #17805A | Links, CTAs on light, positive amounts |
| lavender / softPurple | #C7B6FF / #E9E3FF | AI and insight moments |
| peach | #FFB89A | Reminders |
| gray | #5F6E67 | Secondary text |
| line | #ECE7DC | Card borders |
| Semantic | success #126B4B on #D8F3E5 · warning #9A5B00 on #FFF1DC · error #A8361F on #FFE8E0 · info #5B40C9 on #E9E3FF | Status chips, banners |

Amount colours:

- Income and positive amounts use deepMint, with a "+" prefix.
- Expenses use forest, with no minus sign in lists.
- Overdue amounts use errorText.

## Typography

- **Nunito 800** is for headings and the wordmark only.
- **Nunito Sans** is for all UI text and numbers.
  - Numbers always use `fontVariant: ['tabular-nums']`.
- The type scale is in `theme.type`:
  - display 40
  - h1 30
  - h2 24
  - h3 19
  - body 14.5
  - caption 12
  - amountXl 44
- Support Dynamic Type up to 130%. Hero amounts may shrink to fit (`adjustsFontSizeToFit`).

## Layout

- **Screen padding:** 20 horizontally, with an 18 gap between sections.
- **Cards:**
  - Corner radius 22. Hero cards use 26; bottom sheets use 28.
  - White fill, a 1px `line` border and the `shadow.card` shadow.
- **Touch and buttons:**
  - Touch targets are at least 44.
  - Primary buttons are 56 high, forest fill with cream text, pill radius.
- **Tab bar:**
  - 84 high, white at 94% opacity with blur.
  - The active tab gets a softGreen pill behind its icon and an 800-weight label.
- **Voice FAB:** 62, voiceButton gradient, mint ring glow while listening.

## Components

These are visible in `boards/01_app-system__App-Components.jpg`:

- **Buttons and inputs:** Button (primary, secondary, ghost, destructive), IconButton, segmented control, text field (label above, 52 tall, lightGray fill), amount keypad.
- **Content blocks:** Chip (filter, category, status), Card, ListRow (icon chip 44 + title/subtitle + amount right), SectionHeader (title + "See all").
- **Feedback and overlays:** BottomSheet with grabber, Toast with Undo, Skeleton, EmptyState (mascot 120 + title + one line + CTA), Banner (offline, warning).
- **Charts:** Progress bar, ring, donut, bar chart, line chart (react-native-svg).

## Mascot (KAI)

- **Assets:** `assets/mascot/` has 11 expressions:
  - default, listening, thinking, insight, happy, celebrating, reminder, concerned, sleeping, waving, plus a transparent master.
- **Which expression where:**
  - Listening → voice listening
  - Thinking → transcribing, thinking and Ask
  - Insight → insight cards
  - Happy → saved and success screens
  - Celebrating → goal complete
  - Reminder → upcoming and notifications
  - Concerned → errors and overdue
  - Sleeping → empty states at night, and offline
  - Waving → onboarding
- **Rendering:**
  - Use the 3D PNG/SVG on hero and empty states.
  - Use the Flat SVG below 48pt.
- **Do not:**
  - Distort the mascot or recolour its body.
  - Add other characters.
  - Put it on busy photos.

## Worlds (backgrounds)

These are soft gradients from `theme.gradients`:

- **Cream World:** default screens.
- **Dark Premium:** voice modal and Pro.
- **Mint World:** success states.
- **Lavender → Cream:** insights and Ask.
- **Peach:** reminders.

## Motion

| Element | Motion |
|---|---|
| Press | Scale to 0.97 over 90 ms |
| Sheets | Spring |
| Charts | Grow over 400 ms with a 30 ms stagger |
| Success | 600 ms check + mascot bounce |
| Goal complete | 1.4 s confetti |
| Listening waveform | Follows mic level |
| Reduce motion | Respect the system setting: crossfades only |

## Icons

`assets/icons/` has 25 line icons, drawn on a 24 grid with a 1.75 stroke, in forest. Recolour them with the `color` prop via react-native-svg.

The set:

- **Money and accounts:** Bank, Cash, Card, Money, Income, Expense, Transfer, Savings, NetWorth.
- **Commitments:** Bills, EMI, Loan, Insurance, Investment, SIP, Goals.
- **App:** Calendar, Documents, Insights, Notifications, Profile, Reports, Security, Settings, Voice.
