# KAI — Replit Build Handoff

**KAI · Your Money OS.** A voice-first personal finance app for iOS and Android.
This pack holds everything Replit Agent (or a developer) needs to build the full-stack mobile app from the KAI design.

## What's inside

| Folder | What it is | How to use it in Replit |
|---|---|---|
| `BUILD_PROMPTS.md` | The first Agent prompt, plus 8 follow-up phase prompts | Paste them one at a time |
| `docs/01_PRODUCT_SPEC.md` | Navigation, every screen and state, and the behaviour rules | Upload to the Repl and tell Agent to follow it |
| `docs/02_DESIGN_SYSTEM.md` | Colours, type, spacing, components, motion, mascot usage | Same |
| `docs/03_DATA_MODEL.md` | Objects → schedules → events → transactions → analytics, plus the money rules | Same |
| `docs/04_VOICE_AND_AI.md` | The voice parsing contract, the LLM prompt and the "Ask My Money" rules | Same |
| `code/theme.ts` | Design tokens, ready to drop into React Native | Put in `src/theme/theme.ts` |
| `code/types.ts` | Shared TypeScript types | Put in `shared/types.ts` |
| `code/schema.sql` | PostgreSQL schema (Replit's built-in Postgres) | Agent runs it, or translate to Drizzle |
| `code/sample-data.json` | Seed data for the "Aditi" persona shown in the mockups | Seed the dev database |
| `screens/` | 152 individual mobile screens, every state (390-wide @2x JPG) | **Attach these to Agent prompts.** It builds from images |
| `boards/` | 55 overview boards (flows, state grids, components) | Reference for you and Agent |
| `assets/` | App icon, mascot (11 expressions, SVG and PNG), logo SVGs, 25 UI icon SVGs, fonts | Put in `assets/` of the Expo project |
| `design-source/` | The editable design files (`.dc.html`) | Backup and reference only |

Screen file names follow `NN_Screen__state.jpg`. For example, `05_Voice__listening.jpg` is the Voice screen in its listening state.

## Step by step: build it on Replit

1. **Create the app.**
   - Go to replit.com → Create → choose **Mobile app** (Expo / React Native).
   - Paste **Prompt 0** from `BUILD_PROMPTS.md`.
2. **Upload the pack.**
   - Before or right after Prompt 0, drag the unzipped `KAI_REPLIT_HANDOFF` folder into the Repl's file tree.
   - At minimum, upload `docs/`, `code/`, `assets/` and `screens/`.
   - Tell Agent: *"The design handoff is in 02_APP_UI_UX. Read README.md and docs/ before writing code."*
3. **Build in phases.**
   - Run Prompts 1–8 one at a time.
   - With each prompt, attach the screenshots it lists. Agent copies layouts much more faithfully from images than from text.
   - Check each phase in the preview, or on your phone with **Expo Go** by scanning the QR code, before moving on.
4. **Fix drift early.** If a screen looks off, attach the matching file from `screens/` and say: *"Match this exactly: spacing, font sizes, colours, radius."*
5. **Add secrets** (Replit → Secrets):
   - `OPENAI_API_KEY` (or an Anthropic key), used for voice parsing and Ask My Money.
   - `DATABASE_URL`, which Replit Postgres sets automatically.
   - Speech-to-text runs on the device, or on the server through the same AI provider.
6. **Publish.**
   - iOS: Replit can publish to the App Store through TestFlight (Apple Developer account required).
   - Android: Replit does not yet publish to Google Play directly. Export the project and build with **EAS Build** (`eas build -p android`), then upload the `.aab` in the Play Console.

## Recommended stack

The stack Agent should use:

- **App:** Expo SDK (latest) + React Native + TypeScript, with `expo-router` (tabs + stacks).
- **App libraries:**
  - `react-native-reanimated` for motion.
  - `react-native-svg` for icons, mascot and charts.
  - `expo-linear-gradient`.
  - `@expo-google-fonts/nunito` and `@expo-google-fonts/nunito-sans`.
  - `expo-local-authentication` for the biometric lock.
  - `expo-secure-store`.
  - `expo-av` / `expo-speech-recognition` for voice.
  - `expo-notifications`.
  - `expo-document-picker` for the vault.
- **API:** Node + Express (or Hono) + TypeScript on the same Repl, with Drizzle ORM on Replit PostgreSQL.
- **Auth:** phone/email OTP → JWT in SecureStore, plus a 4-digit PIN or biometric app lock.
- **AI:** one server endpoint, `/voice/parse`, that returns `VoiceParseResult` (see `docs/04`), and one, `/ask`, for Ask My Money.
- **Files:** Replit Object Storage for vault documents (encrypt before upload).

## Non-negotiables

Agent must keep these rules:

- **Money:**
  - Store money as **integer paise**, never floats.
  - Show money with Indian grouping (₹1,40,000) via `formatINR`.
- **Two timestamps:** keep `happenedAt` (when the money moved) separate from `recordedAt` (when the entry was made). Never merge them.
- **What counts as spending:** transfers, credit-card bill payments, investments/SIPs and debt settlements are **never** spending. Use `COUNTS_AS_SPENDING`.
- **Voice:**
  - Voice is the primary input: a floating mic button on every tab.
  - A simple entry auto-saves after 3 s with Undo.
  - Ask at most **one** follow-up question, only when the amount or account is missing.
- **Brand:**
  - Nunito 800 for headings, Nunito Sans for UI and numbers (tabular figures).
  - Forest `#0B3D2E` on Cream / Off-white.
  - Mint `#3ED1A0` only on dark.
- **Mobile only:** 390 pt design width, safe areas respected, minimum 44 pt touch targets.
