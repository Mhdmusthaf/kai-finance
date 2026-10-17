# Decisions Log

Format: date — decision — rationale — alternatives rejected.

## 2026-10-17 — Phase 0

1. **Backend: Express (TypeScript) + PostgreSQL + Drizzle ORM** (per spec 0.2).
   Rejected: keeping the JSON-file fake (no real SQL, no transactions, no multi-user safety);
   rejected: keeping direct Supabase client access from the app (couples client to vendor,
   no server-side auth logic, no rate limiting control).

2. **Mobile client talks only to `/v1/*` API.** `@supabase/supabase-js` and
   `src/lib/supabase.ts` removed from the app once the new API replaces them.

3. **Supabase project data considered compromised** (public anon key shipped in prior
   builds with open RLS). Per spec 7: treat as compromised; the migration path is one-way
   into the new Postgres. Locking/removal of the old Supabase tables is a manual step for
   the owner (documented in SECURITY_CHECKLIST).

4. **Expo SDK upgraded to 58** (latest stable). Verified against store requirements:
   Play requires target API 35 (met), Apple requires Xcode 26 / iOS 26 SDK from
   Apr 28 2026 (met by SDK 58 EAS images).

5. **npm peer conflicts during SDK upgrade** resolved with `--legacy-peer-deps`
   (React 19 / RN 0.88 transition). Locked in package-lock.

6. **OTP adapter**: dev adapter logs the code to server console and hard-fails in
   production. Production adapters (MSG91/Twilio) implemented behind `OTP_PROVIDER`.

7. **Gemini adapter**: dev adapter uses a deterministic rule-based parser so the voice
   flow is testable end-to-end without a key; production path calls Gemini with
   schema-constrained JSON. Feature-flag `VOICE_LLM_ENABLED` gates the LLM path.

8. **Money = bigint paise** in every table. No float anywhere. `formatINR` remains the
   only display formatter (mobile + admin reuse `packages/shared/finance`).

9. **Server-issued UUIDs** for all entity ids (no `Date.now()` ids from client).

10. **Expo Router (tabs + stack)** replaces the manual `activeTab` switch and the
    `overlay` state machine in AppNavigator, fixing the Android back-button traps
    (H2) and enabling deep links (`kai://`).
