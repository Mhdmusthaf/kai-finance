# Store Requirements (verified 2026-10-17)

## Google Play
- **Target API**: New apps/updates must target **Android 15 (API 35)** or higher (effective since Aug 31, 2025; extension to Nov 1, 2026 only for apps still targeting API 34).
  - Source: https://support.google.com/googleplay/android-developer/answer/11926878
  - Expo SDK 58 targets API 35 by default on `eas build -p android` — no extra config needed.
- **Signing**: Play App Signing recommended; EAS manages keystore via `eas credentials`.
- **Data safety form**: must reflect actual data collection (phone number for OTP, financial data user-entered, no analytics PII).
- **Account deletion**: in-app account deletion URL is REQUIRED for apps with account creation.
- **Permissions**: only those used (RECORD_AUDIO, POST_NOTIFICATIONS, USE_BIOMETRIC). Don't declare USE_FINGERPRINT (deprecated).

## Apple App Store
- **Xcode / SDK**: Starting **April 28, 2026**, uploads to App Store Connect must be built with **Xcode 26 / iOS 26 SDK** or later.
  - Source: https://developer.apple.com/news?id=ueeok6yw
  - Expo SDK 54+ EAS images already use Xcode 26. SDK 58 images qualify.
- **Privacy manifests** (`ios.privacyManifests`): required for apps using required-reason APIs.
- **Info.plist usage strings**: every permission needs a user-facing string (mic, speech, Face ID, photo library).
- **Account deletion**: apps with account creation MUST offer in-app account deletion (App Review Guideline 5.1.1(v)).
- **TestFlight**: internal testing up to 100 users; external requires beta app review.

## Both stores
- Privacy policy URL + terms URL are required at submission time.
- Finance apps: category `Finance`; may require additional review (e.g. lending in India = specific declaration).
- India-specific: DPDP Act 2023 compliance for data handling, personal-data consent.

## Current EAS build profile targets (to be verified at build time)
- Android `production` → `.aab` (Play, API 35)
- Android `production-apk` → `.apk` (sideload / internal QA)
- iOS `production` → `.ipa` (TestFlight / App Store, Xcode 26 image)
