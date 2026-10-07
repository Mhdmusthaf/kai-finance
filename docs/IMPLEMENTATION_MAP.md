# KAI — Implementation Map

This document maps every screen, flow, state, component, data model, API endpoint, DB table, and navigation route across the **KAI — Your Money OS** application.

---

## Architecture & Monorepo Overview

```
/
├── apps/
│   ├── mobile/             # Expo React Native App (iOS & Android)
│   │   ├── app/            # expo-router file navigation
│   │   └── src/
│   │       ├── components/ # Shared UI components (Mascot, Icon, AmountText, etc.)
│   │       ├── features/   # Feature-based screens, hooks, components & APIs
│   │       ├── theme/      # KAI design tokens (theme.ts)
│   │       └── state/      # Zustand local UI state & TanStack Query client
│   └── server/             # Node Fastify/Express API server
│       ├── src/
│       │   ├── db/         # PostgreSQL / Drizzle ORM schema & migrations
│       │   ├── ai/         # Voice parser, Gemini API adapter, Ask My Money tools
│       │   ├── services/   # Financial engine, schedule calculator, notification worker
│       │   └── routes/     # Versioned REST endpoints (/v1)
├── packages/
│   └── shared/             # Shared types, Zod schemas, finance math & formatters
└── docs/                   # Documentation & Implementation Map
```

---

## Detailed Screen Implementation Mapping

### 1. Onboarding & Auth (`01_Splash`, `02_Onboarding`, `03_Auth`)
| Screen / State | Components | User Actions | Data & State | API Endpoints | DB Tables | Navigation |
|---|---|---|---|---|---|---|
| `01_Splash` | Mascot (`waving`), Brand wordmark | Auto-timer (1.5s) | Session JWT in SecureStore | `GET /v1/me` | `users`, `sessions` | → `Onboarding` or `Auth` or `Tabs` |
| `02_Onboarding__*` (9 steps) | Mascot (`waving`), Button, Carousel, Input | Next, Skip, Complete | Step index, user preferences | `POST /v1/onboarding` | `users`, `user_settings` | Carousel → `Auth` |
| `03_Auth__phone_otp` | TextField, PinInput, Button, ResendTimer | Enter Phone / OTP | Phone string, 6-digit OTP code | `POST /v1/auth/otp/request`, `POST /v1/auth/otp/verify` | `otp_codes`, `users`, `sessions` | Phone → OTP → PIN |
| `03_Auth__pin_lock` | Keypad, PinDots, BiometricPrompt | Enter 4-digit PIN / FaceID | Auth token, lock state | Local verification | `user_settings` | Pin → `Tabs` |

### 2. Home Dashboard (`04_Home`)
| Screen / State | Components | User Actions | Data & State | API Endpoints | DB Tables | Navigation |
|---|---|---|---|---|---|---|
| `04_Home__default` | Mascot, HeroCard, QuickActions, InsightCard, ListRow | Tap quick actions, eye toggle, pull refresh | Dashboard summary object | `GET /v1/dashboard/summary` | `accounts`, `transactions`, `insights`, `upcoming_events` | → Detail, Search, Bell |
| `04_Home__empty` | EmptyState (`sleeping`), Mascot, CTA | Tap "Log first expense" | Empty dataset | `GET /v1/dashboard/summary` | `transactions` | → Voice / Activity |
| `04_Home__loading` | Skeleton loader cards/rows | View placeholder | Loading boolean | `GET /v1/dashboard/summary` | - | - |

### 3. Voice & AI (`05_Voice`, `21_Ask`)
| Screen / State | Components | User Actions | Data & State | API Endpoints | DB Tables | Navigation |
|---|---|---|---|---|---|---|
| `05_Voice__listening` | Waveform, MicButton, Mascot (`listening`) | Speak, Cancel | Live audio stream, partial STT | `POST /v1/voice/transcribe` | `voice_entries` | Modal view |
| `05_Voice__result` | ResultCard, EditableChips, Toast (Undo) | Confirm, Edit fields, Undo | `VoiceParseResult` | `POST /v1/voice/parse`, `POST /v1/transactions` | `transactions`, `voice_entries` | Sheet → Toast |
| `21_Ask__answer` | ChatBubble, MiniChart, BasisTag | Ask question, view numbers | Answer text, tool query results | `POST /v1/ai/query` | `ai_interactions` | Insights → Ask |

### 4. Activity & Transactions (`06_Activity`, `07_TxDetail`, `08_TxAdd`)
| Screen / State | Components | User Actions | Data & State | API Endpoints | DB Tables | Navigation |
|---|---|---|---|---|---|---|
| `06_Activity__list` | GroupedList, ChipFilters, ListRow | Filter, Search, Swipe edit/delete | Transactions array, cursor | `GET /v1/transactions` | `transactions`, `categories` | Tab 2 → TxDetail |
| `08_TxAdd__form` | AmountKeypad, SegmentedControl, AccountPicker | Enter amount, pick type/category, save | Form state (RHF + Zod) | `POST /v1/transactions`, `PATCH /v1/transactions/:id` | `transactions`, `accounts`, `credit_cards` | Activity → TxAdd |

### 5. Financial Objects (`10_MyMoney`, `11_ObjectList`, `12_ObjectDetail`)
| Screen / State | Components | User Actions | Data & State | API Endpoints | DB Tables | Navigation |
|---|---|---|---|---|---|---|
| `10_MyMoney` | CategoryCards, StatSummary | Select object category | Accounts, Cards, Loans, Investments | `GET /v1/objects/summary` | All object tables | Tab 5 → ObjectList |
| `12_ObjectDetail` | CardHero, AmortizationTable, ActionSheet | Pay card, pause SIP, mark EMI paid | Object detail + linked events | `GET /v1/objects/:type/:id` | `credit_cards`, `loans`, `emis`, `sips` | Detail → ActionSheet |

### 6. Upcoming & Calendar (`14_Upcoming`, `15_Calendar`)
| Screen / State | Components | User Actions | Data & State | API Endpoints | DB Tables | Navigation |
|---|---|---|---|---|---|---|
| `14_Upcoming__default` | GroupedCards, ActionButtons | Mark Paid, Skip, Snooze | UpcomingEvents array | `GET /v1/upcoming`, `POST /v1/upcoming/:id/pay` | `upcoming_events`, `schedules` | Tab 3 → EventSheet |
| `15_Calendar` | CalendarGrid, DayDots, EventList | Select date | Daily event map | `GET /v1/calendar?month=YYYY-MM` | `upcoming_events` | Upcoming → Calendar |

### 7. Insights, Goals & Analytics (`16_Goals`, `19_Insights`, `22_25_Analytics`)
| Screen / State | Components | User Actions | Data & State | API Endpoints | DB Tables | Navigation |
|---|---|---|---|---|---|---|
| `16_Goals__detail` | ProgressRing, ContributionList, Confetti | Contribute, Complete | Goal object, contributions | `GET /v1/goals/:id`, `POST /v1/goals/:id/contributions` | `goals`, `goal_contributions` | MyMoney → Goals |
| `25_Recap` | SwipeableCards, Mascot (`celebrating`) | Swipe story cards | Monthly recap payload | `GET /v1/analytics/recap?month=YYYY-MM` | `monthly_recaps` | Insights → Recap |

### 8. Vault, Notifications & Me (`27_Vault`, `28_Notifications`, `29_Me`)
| Screen / State | Components | User Actions | Data & State | API Endpoints | DB Tables | Navigation |
|---|---|---|---|---|---|---|
| `27_Vault` | DocList, UploadProgress, FilePreview | Upload receipt/policy, preview | Document metadata, signed URLs | `GET /v1/documents`, `POST /v1/documents/upload` | `documents` | Vault → Preview |
| `29_Me` | SettingsList, Toggle, ProfileCard | Update safety buffer, export data, lock | User profile & settings | `GET /v1/me`, `PATCH /v1/me`, `POST /v1/me/export` | `users`, `user_settings` | MyMoney → Me |

### 9. KAI Pro (`30_Pro`)
| Screen / State | Components | User Actions | Data & State | API Endpoints | DB Tables | Navigation |
|---|---|---|---|---|---|---|
| `30_Pro__paywall` | PaywallCards, FeatureComparison, RestoreBtn | Purchase, Restore, Manage | Entitlements status | `GET /v1/me/entitlements`, `POST /v1/payments/verify` | `entitlements` | Me → KAI Pro |

---
