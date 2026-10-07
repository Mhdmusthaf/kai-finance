# Instructions for coding agents (Antigravity / Gemini / Claude / Cursor)

This repo is the design source for **KAI — Your Money OS**: a voice-first personal finance app for **iOS and Android only**. There are no web or desktop screens.

## Read these first, in order
1. `02_APP_UI_UX/docs/01_PRODUCT_SPEC.md`: navigation, every screen and state, behaviour rules.
2. `02_APP_UI_UX/docs/02_DESIGN_SYSTEM.md`: colours, type, spacing, components, mascot, motion.
3. `02_APP_UI_UX/docs/03_DATA_MODEL.md`: objects → schedules → events → transactions → analytics, plus the API.
4. `02_APP_UI_UX/docs/04_VOICE_AND_AI.md`: the voice parse contract, LLM prompts, Ask My Money.
5. `02_APP_UI_UX/code/`: `theme.ts` (tokens), `types.ts` (shared types), `schema.sql` (Postgres), `sample-data.json` (seed).

## Visual truth
- `02_APP_UI_UX/screens/NN_Screen__state.jpg`: one image per screen state. **Match these exactly.**
- `02_APP_UI_UX/boards/`: overview of flows and components.
- Brand files live in `01_BRAND_ASSETS/`:
  - App icon: `06_APP_ICONS/Forest/KAI_AppIcon_Forest_1024.png`
  - Mascot: `05_MASCOT_EXPRESSIONS/*/` (3D PNG + SVG)
  - UI icons: `07_UI_ICONS/UI/Forest/*.svg`
  - Fonts: `09_TYPOGRAPHY/fonts/`
  - Logos: `01_LOGOS/`
  - Copies of the app-ready subset are also in `02_APP_UI_UX/assets/`.

## Stack
- **App:** Expo + React Native + TypeScript, with expo-router.
- **Server:** Node + Express + Drizzle on PostgreSQL.

## Rules you must not break
- **Don't change the brand.**
  - Use only tokens from `theme.ts` and never hardcode a hex value in a screen.
  - Nunito 800 for headings, Nunito Sans for UI and numbers (tabular figures).
  - Forest `#0B3D2E`, Mint `#3ED1A0` (on dark only), Cream `#FFF8F1`.
- **Money:**
  - Store it as integer **paise**.
  - Display it with Indian grouping via `formatINR`.
- **Two timestamps:** keep `happenedAt` (when the money moved) and `recordedAt` (when the entry was made) separate.
- **What isn't spending:** transfers, credit-card bill payments, investments/SIPs and debt settlements. Use `COUNTS_AS_SPENDING`.
- **Voice is the primary input:**
  - A floating mic button sits on every tab.
  - Simple entries auto-save after 3 s with Undo.
  - Ask at most one follow-up question.
- **Every list has states:** default, loading (skeleton), empty (mascot + CTA) and error/offline.
- **Layout:** design width 390 pt, safe areas, touch targets of 44 pt or more.

Build in the phases listed in `02_APP_UI_UX/BUILD_PROMPTS.md`. Don't build everything at once.
