# Launch Blockers — external dependencies needed from you

These are items that CANNOT be built or verified without credentials/accounts only you can
provide. The code is structured so each one has a clearly-labelled dev adapter that is
hard-disabled when `NODE_ENV=production`.

| # | Item | Why needed | Where it plugs in | Status |
|---|------|-----------|------------------|--------|
| 1 | `DATABASE_URL` (Neon / Supabase-Postgres / Railway) | Real persistence | `server/.env` | PENDING |
| 2 | `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (64-byte hex) | Auth token signing | `server/.env` | PENDING |
| 3 | SMS provider (MSG91 or Twilio Verify) creds | Real OTP delivery | `server/src/adapters/otp.ts` | PENDING — console adapter used in dev |
| 4 | `GEMINI_API_KEY` | Voice parse + Ask My Money | `server/src/adapters/gemini.ts` | PENDING — rule-based dev adapter |
| 5 | `SENTRY_DSN` (server + client) | Error tracking | `server/.env`, `.env` | PENDING |
| 6 | Google OAuth client IDs (iOS/Android/Web) | Google sign-in | `server/src/adapters/google.ts` | PENDING — endpoint returns 501 until provided |
| 7 | RevenueCat public keys (Android/iOS) + webhook secret | KAI Pro subscriptions | `.env`, `/v1/payments/verify` | PENDING — feature-flagged off |
| 8 | Apple Team ID / ASC API key | TestFlight submit | EAS credentials | PENDING |
| 9 | Google Play service-account JSON | Play internal-track submit | EAS credentials | PENDING |
| 10 | Privacy policy / terms / account-deletion URLs | Both stores require | app.json + store listing | PENDING |
| 11 | `ADMIN_SEED_EMAIL` | First admin-panel login | `server/.env` | PENDING |
| 12 | Expo account login (for `eas build`) | Signed APK/AAB/IPA | `eas login` | PENDING — cannot run in this sandbox |
| 13 | Real device (Android 10/13/15, iOS 16/18) | Final QA matrix | Manual | PENDING |

Items NOT blockers but recommended before launch:
- Certificate pinning (optional hardening)
- Virus-scan hook on document vault (plug-in point ready)
- Pen-test engagement (checklist self-audit included in docs/SECURITY_CHECKLIST.md)
