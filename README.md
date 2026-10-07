# KAI — Your Money OS (Production Mobile App)

KAI is a voice-first, calm personal money OS for iOS and Android. Built with Expo, React Native, TypeScript, Node.js, Fastify/Express, and Drizzle/SQLite.

---

## 📱 Tech Stack & Architecture

- **Mobile Client**: Expo (SDK 51) + React Native + TypeScript + expo-router.
- **Styling & Tokens**: KAI Design System in `src/theme/theme.ts`. Sourced strictly from tokens.
- **State Management**: TanStack Query (server state) + Zustand (local UI state).
- **Financial Calculation Engine**: `packages/shared/finance/` (100% unit tested).
- **Backend API**: Node.js + Fastify/Express + Drizzle/SQLite (`server/`).
- **Voice & AI**: Gemini API adapter (`packages/shared/voice/`) with structured output validation via Zod.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# Install mobile dependencies
npm install

# Install backend server dependencies
cd server && npm install
```

### 2. Start the Backend Server & Seed Sample Data
```bash
cd server
npm run dev
```
The server will initialize the database at `server/kai.db` and seed sample persona data (`Aditi`).

### 3. Run the Mobile App
```bash
# In the workspace root:
npx expo start
```
Scan the QR code with Expo Go on your iOS or Android phone, or run on an emulator.

---

## 🧪 Running Unit Tests

```bash
# Run unit tests for financial calculations & voice contract
npm test
```

---

## 📱 Features & Screens Inventory

- **Splash & Onboarding**: `SplashScreen.tsx`, `OnboardingScreen.tsx` (9-step carousel), `AuthPhoneOtpScreen.tsx`, `PinLockScreen.tsx`.
- **Home Dashboard**: Balance hero card, Quick Actions, KAI Noticed insights, Recent activity, Component Gallery quick launcher.
- **Activity**: Daily transaction groups, filter chips, category search, transaction detail & edit.
- **Upcoming & Calendar**: Committed month summary, Needs Attention warning cards, 90-day upcoming event scheduler, calendar dots.
- **Insights & Ask My Money**: AI insight cards, tool-calling financial advice assistant, monthly recaps.
- **My Money**: Financial objects (Accounts, Credit Cards, Loans & EMIs, Investments & SIPs, Insurance, Bills, Subscriptions).
- **Component Gallery**: Showcase of all 12 core KAI components, 10 mascot expressions, 25 line icons, bottom sheets, and undo toasts.
